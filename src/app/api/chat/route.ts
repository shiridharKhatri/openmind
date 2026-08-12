import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Conversation } from '@/lib/models/Conversation';
import { Message } from '@/lib/models/Message';
import { FileModel } from '@/lib/models/File';
import { extractTextFromFile } from '@/lib/ai/extractor';
import { getProvider } from '@/lib/ai/provider';
import { generateTitle } from '@/lib/utils';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid or empty request body' }, { status: 400 });
    }

    const { messages, model, conversationId, temperature, maxTokens, isDeepResearch, editMessageId, systemPrompt } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    await connectDB();

    // Local RAG: Check if user has uploaded files matching keywords in query
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    // Detect image generation requests
    const msgLower = lastUserMessage.toLowerCase().trim();
    const imageKeywords = ['image', 'picture', 'photo', 'drawing', 'illustration', 'sketch', 'painting', 'portrait', 'visual', 'artwork'];
    const hasImageKeyword = imageKeywords.some(keyword => msgLower.includes(keyword));

    const isImageRequest = 
      msgLower.startsWith('/image ') ||
      msgLower.startsWith('draw ') ||
      msgLower.startsWith('paint ') ||
      msgLower.startsWith('sketch ') ||
      msgLower.startsWith('render ') ||
      ((msgLower.startsWith('generate') || msgLower.startsWith('create') || msgLower.startsWith('make') || msgLower.startsWith('show')) && hasImageKeyword);

    // Detect video generation requests
    const videoKeywords = ['video', 'clip', 'animation', 'movie', 'gif'];
    const hasVideoKeyword = videoKeywords.some(keyword => msgLower.includes(keyword));
    const isVideoRequest = 
      msgLower.startsWith('/video ') ||
      msgLower.startsWith('animate ') ||
      ((msgLower.startsWith('generate') || msgLower.startsWith('create') || msgLower.startsWith('make')) && hasVideoKeyword);

    if (isVideoRequest) {
      const cleanPrompt = lastUserMessage
        .replace(/^\/video\s+/i, '')
        .replace(/^(generate|create|make|animate)\s+(an\s+|a\s+)?(video\s+of\s+|clip\s+of\s+|animation\s+of\s+|movie\s+of\s+)?/i, '')
        .replace(/\s+(video|clip|animation|movie|gif)$/i, '');
      const prompt = cleanPrompt.trim() || lastUserMessage;
      
      // Get or create conversation early
      let conversation;
      if (conversationId) {
        conversation = await Conversation.findOne({
          _id: conversationId,
          userId: session.user.id,
        });
        if (!conversation) {
          return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }
      } else {
        conversation = await Conversation.create({
          userId: session.user.id,
          title: `Video: ${prompt.substring(0, 30)}`,
          modelId: model || 'qwen3:1.7b',
        });
      }

      await Message.create({
        conversationId: conversation._id.toString(),
        role: 'user',
        content: lastUserMessage,
      });

      // Attempt to generate local video using ComfyUI SVD pipeline
      let responseText = '';
      let isLocal = false;
      try {
        // 1. Verify ComfyUI is online
        const comfyPing = await fetch('http://127.0.0.1:8188/', { method: 'GET', signal: AbortSignal.timeout(2000) });
        if (comfyPing.ok) {
          isLocal = true;
          
          // 2. Generate starting image frame
          let startingImageBase64 = '';
          try {
            const dtResponse = await fetch('http://127.0.0.1:7860/sdapi/v1/txt2img', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt: prompt,
                steps: 20,
                width: 512,
                height: 512,
              }),
              signal: AbortSignal.timeout(10000),
            });
            if (dtResponse.ok) {
              const dtData = await dtResponse.json();
              if (dtData.images && dtData.images[0]) {
                startingImageBase64 = dtData.images[0];
              }
            }
          } catch (e) {
            // Draw things offline
          }

          if (!startingImageBase64) {
            // Online fallback for starting frame
            const onlineUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true`;
            const imageRes = await fetch(onlineUrl);
            if (imageRes.ok) {
              const arrayBuffer = await imageRes.arrayBuffer();
              startingImageBase64 = Buffer.from(arrayBuffer).toString('base64');
            }
          }

          if (!startingImageBase64) {
            throw new Error("Could not generate starting frame image");
          }

          // 3. Upload starting frame image to ComfyUI
          const imageBuffer = Buffer.from(startingImageBase64, 'base64');
          const formData = new FormData();
          const file = new File([imageBuffer], "input.png", { type: "image/png" });
          formData.append('image', file);

          const uploadRes = await fetch('http://127.0.0.1:8188/upload/image', {
            method: 'POST',
            body: formData,
          });
          if (!uploadRes.ok) throw new Error("Failed to upload image to ComfyUI");
          const uploadData = await uploadRes.json();
          const imageName = uploadData.name;

          // 4. Submit SVD Workflow prompt to ComfyUI
          const workflow = {
            "client_id": "openmind",
            "prompt": {
              "1": {
                "class_type": "ImageOnlyCheckpointLoader",
                "inputs": {
                  "ckpt_name": "svd_xt.safetensors"
                }
              },
              "2": {
                "class_type": "LoadImage",
                "inputs": {
                  "image": imageName,
                  "upload": "image"
                }
              },
              "3": {
                "class_type": "SVD_img2vid_Conditioning",
                "inputs": {
                  "width": 512,
                  "height": 512,
                  "video_frames": 14,
                  "motion_bucket_id": 127,
                  "fps": 6,
                  "augmentation_level": 0.0,
                  "clip_vision": ["1", 1],
                  "init_image": ["2", 0],
                  "vae": ["1", 2]
                }
              },
              "4": {
                "class_type": "EmptyLatentImage",
                "inputs": {
                  "width": 512,
                  "height": 512,
                  "batch_size": 14
                }
              },
              "5": {
                "class_type": "KSampler",
                "inputs": {
                  "seed": Math.floor(Math.random() * 1000000),
                  "steps": 20,
                  "cfg": 2.5,
                  "sampler_name": "euler",
                  "scheduler": "karras",
                  "denoise": 1.0,
                  "model": ["1", 0],
                  "positive": ["3", 0],
                  "negative": ["3", 1],
                  "latent_image": ["4", 0]
                }
              },
              "6": {
                "class_type": "VAEDecode",
                "inputs": {
                  "samples": ["5", 0],
                  "vae": ["1", 2]
                }
              },
              "7": {
                "class_type": "SaveAnimatedPNG",
                "inputs": {
                  "filename_prefix": "OpenMind_SVD",
                  "fps": 6.0,
                  "compress_level": 4,
                  "images": ["6", 0]
                }
              }
            }
          };

          const promptRes = await fetch('http://127.0.0.1:8188/prompt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workflow),
          });
          if (!promptRes.ok) {
            const errData = await promptRes.json().catch(() => ({}));
            const reason = errData.node_errors
              ? Object.entries(errData.node_errors)
                  .map(([nodeId, err]: any) => `Node ${nodeId} (${err.class_type}): ${err.errors?.[0]?.message || 'Invalid parameters'}`)
                  .join(', ')
              : errData.error?.message || "Verify your workflow nodes";
            throw new Error(`ComfyUI validation failed - ${reason}`);
          }
          const promptData = await promptRes.json();
          const queuePromptId = promptData.prompt_id;

          // 5. Poll ComfyUI history for completion
          let videoFilename = '';
          for (let attempt = 0; attempt < 300; attempt++) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const historyRes = await fetch(`http://127.0.0.1:8188/history/${queuePromptId}`);
            if (historyRes.ok) {
              const historyData = await historyRes.json();
              if (historyData[queuePromptId]) {
                const outputs = historyData[queuePromptId].outputs;
                const nodeOutput = outputs && outputs["7"];
                if (nodeOutput) {
                  const media = nodeOutput.images || nodeOutput.gifs;
                  if (media && media[0]) {
                    videoFilename = media[0].filename;
                    break;
                  }
                }
              }
            }
          }

          if (videoFilename) {
            const videoUrl = `http://127.0.0.1:8188/view?filename=${videoFilename}&type=output`;
            responseText = `Here is your uncensored local video for **"${prompt}"** generated using Stable Video Diffusion:\n\n![Local Video](${videoUrl})`;
          } else {
            responseText = `I've queued the video workflow in your local ComfyUI server, but the rendering timeout was exceeded. Please check your ComfyUI window at http://127.0.0.1:8188 to view progress!`;
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        responseText = `Failed to generate local video: ${errorMsg}. Please make sure your ComfyUI server is running and the models are loaded properly.`;
      }

      if (!isLocal) {
        responseText = `To generate **uncensored and unrestricted videos locally** on your MacBook Pro M4, you need to set up **ComfyUI** (the open-source node-based AI suite).

Here is a quick guide to start generating videos locally:

### 1. Install ComfyUI
Open your terminal and run:
\`\`\`bash
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI
pip install -r requirements.txt
\`\`\`

### 2. Download a Video Model (SVD)
Run this command in your terminal to download the Stable Video Diffusion model weights directly into your checkpoints folder (9.5 GB):
\`\`\`bash
curl -L "https://huggingface.co/stabilityai/stable-video-diffusion-img2vid-xt/resolve/main/svd_xt.safetensors" -o models/checkpoints/svd_xt.safetensors
\`\`\`

### 3. Start ComfyUI
Run this command in the terminal to launch the local server:
\`\`\`bash
python main.py
\`\`\`
Once running, open **http://127.0.0.1:8188** in your browser. 

Once ComfyUI is open, type your video prompts directly here in **OpenMind** (e.g. *"generate video a spaceship landing on Mars"*), and it will automatically trigger your local generator!`;
      }

      // Save assistant message
      await Message.create({
        conversationId: conversation._id.toString(),
        role: 'assistant',
        content: responseText,
        modelId: isLocal ? 'local-comfyui-video' : 'video-setup-guide',
      });

      // Update conversation timestamp
      await Conversation.findByIdAndUpdate(conversation._id, {
        updatedAt: new Date(),
      });

      return new NextResponse(
        new ReadableStream({
          start(controller) {
            controller.enqueue(
              new TextEncoder().encode(
                JSON.stringify({
                  content: responseText,
                  conversationId: conversation._id.toString(),
                }) + '\n'
              )
            );
            controller.enqueue(
              new TextEncoder().encode(
                JSON.stringify({
                  done: true,
                  conversationId: conversation._id.toString(),
                }) + '\n'
              )
            );
            controller.close();
          },
        }),
        {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
          }
        }
      );
    }

    if (isImageRequest) {
      // Extract prompt: remove prefix action phrases and trailing image keywords
      const cleanPrompt = lastUserMessage
        .replace(/^\/image\s+/i, '')
        .replace(/^(generate|create|draw|paint|sketch|make|show me)\s+(an\s+|a\s+)?(image\s+of\s+|picture\s+of\s+|photo\s+of\s+|portrait\s+of\s+|illustration\s+of\s+|sketch\s+of\s+|painting\s+of\s+)?/i, '')
        .replace(/\s+(image|picture|photo|portrait|illustration|sketch|drawing|artwork)$/i, '');
      const prompt = cleanPrompt.trim() || lastUserMessage;
      const encodedPrompt = encodeURIComponent(prompt.trim());
      const seed = Math.floor(Math.random() * 1000000);

      // Get or create conversation early
      let conversation;
      if (conversationId) {
        conversation = await Conversation.findOne({
          _id: conversationId,
          userId: session.user.id,
        });
        if (!conversation) {
          return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }
      } else {
        conversation = await Conversation.create({
          userId: session.user.id,
          title: `Image: ${prompt.substring(0, 30)}`,
          modelId: model || 'qwen3:1.7b',
        });
      }

      // Save user message
      await Message.create({
        conversationId: conversation._id.toString(),
        role: 'user',
        content: lastUserMessage,
      });

      // Return stream containing real-time progress followed by the final image
      return new NextResponse(
        new ReadableStream({
          async start(controller) {
            let isDone = false;
            let imageUrl = '';
            let isLocal = false;

            // Start simulated progress polling loop (since Draw Things doesn't support progress API)
            let simulatedProgress = 3;
            const progressInterval = setInterval(() => {
              if (isDone) return;
              if (simulatedProgress < 95) {
                simulatedProgress += Math.floor(Math.random() * 5) + 3; // increment randomly
                if (simulatedProgress > 95) simulatedProgress = 95;
              }
              const step = Math.round((simulatedProgress / 100) * 20);

              controller.enqueue(
                new TextEncoder().encode(
                  JSON.stringify({
                    progress: simulatedProgress,
                    step: step,
                    totalSteps: 20,
                    conversationId: conversation._id.toString(),
                  }) + '\n'
                )
              );
            }, 1000);

            try {
              // 1. Try local Draw Things Juggernaut XL API first (port 7860)
              const localResponse = await fetch('http://127.0.0.1:7860/sdapi/v1/txt2img', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  prompt: prompt.trim(),
                  steps: 20,
                  width: 1024,
                  height: 1024,
                  batch_size: 1,
                }),
                // allow up to 120s for M4 local generation
                signal: AbortSignal.timeout(120000),
              });

              if (localResponse.ok) {
                const data = await localResponse.json();
                if (data.images && data.images.length > 0) {
                  const base64Data = data.images[0];
                  const buffer = Buffer.from(base64Data, 'base64');
                  
                  // Save to public/generated directory
                  const generatedDir = path.join(process.cwd(), 'public', 'generated');
                  await fs.mkdir(generatedDir, { recursive: true });
                  
                  const fileName = `${Date.now()}-${seed}.png`;
                  const filePath = path.join(generatedDir, fileName);
                  await fs.writeFile(filePath, buffer);
                  
                  imageUrl = `/generated/${fileName}`;
                  isLocal = true;
                }
              } else {
                console.error('Local Juggernaut server responded with error status:', localResponse.status);
              }
            } catch (err: any) {
              console.error('Local Juggernaut generation failed, falling back to online API:', err);
              try {
                const logPath = path.join(process.cwd(), 'scratch', 'error.log');
                await fs.mkdir(path.dirname(logPath), { recursive: true });
                await fs.writeFile(logPath, `Error at ${new Date().toISOString()}:\n${err?.stack || err?.message || err}\n\n`, { flag: 'a' });
              } catch (logErr) {
                // ignore logging errors
              }
            } finally {
              isDone = true;
              clearInterval(progressInterval);
            }

            // 2. Fallback to Pollinations if local Juggernaut is offline
            if (!imageUrl) {
              imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&private=true&seed=${seed}`;
            }

            const responseText = isLocal
              ? `I've generated that image locally using Juggernaut XL on your M4 Mac:\n\n![${prompt}](${imageUrl})`
              : `I've generated that image for you (using online fallback):\n\n![${prompt}](${imageUrl})`;

            // Save assistant message
            await Message.create({
              conversationId: conversation._id.toString(),
              role: 'assistant',
              content: responseText,
              modelId: isLocal ? 'local-juggernaut-xl' : 'image-generation-fallback',
            });

            // Update conversation timestamp
            await Conversation.findByIdAndUpdate(conversation._id, {
              updatedAt: new Date(),
            });

            // Stream final content and done status
            controller.enqueue(
              new TextEncoder().encode(
                JSON.stringify({
                  content: responseText,
                  conversationId: conversation._id.toString(),
                }) + '\n'
              )
            );
            controller.enqueue(
              new TextEncoder().encode(
                JSON.stringify({
                  done: true,
                  conversationId: conversation._id.toString(),
                }) + '\n'
              )
            );
            controller.close();
          },
        }),
        {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
          }
        }
      );
    }

    let fileContext = '';

    if (lastUserMessage.trim()) {
      const userFiles = await FileModel.find({ userId: session.user.id }).lean();
      const queryTerms = lastUserMessage.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter((term: string) => term.length > 2);

      for (const file of userFiles) {
        const fileNameLower = file.originalName.toLowerCase();
        const matchesFileName = queryTerms.some((term: string) => fileNameLower.includes(term));
        const askingAboutFiles = lastUserMessage.toLowerCase().match(/(file|document|docx|pdf|sheet|txt)/);

        if (matchesFileName || askingAboutFiles) {
          const text = await extractTextFromFile(file.path, file.type || '');
          if (text.trim()) {
            fileContext += `\n[Content from uploaded file "${file.originalName}"]:\n${text}\n---`;
          }
        }
      }
    }

    // Build message history for AI
    const systemMessages = [];
    let baseSystemPrompt = systemPrompt?.trim() || '';

    if (fileContext) {
      baseSystemPrompt += `\n\nUse the following context from the user's uploaded files to answer their question. If the answer cannot be found in the context, use your general knowledge, but prioritize the uploaded file contents:\n${fileContext}`;
    }

    if (baseSystemPrompt) {
      systemMessages.push({
        role: 'system' as const,
        content: baseSystemPrompt,
      });
    } else if (isDeepResearch) {
      systemMessages.push({
        role: 'system' as const,
        content:
          'You are a deep research assistant. Provide thorough, well-structured analysis with detailed explanations. Break down complex topics into clear sections. Cite your reasoning process.',
      });
    }

    const aiMessages = [...systemMessages, ...messages];

    // Get AI provider and stream response
    const provider = getProvider('ollama');

    // Call the provider first to ensure connection is successful before saving to DB
    const stream = await provider.chat({
      model: model || 'qwen3:1.7b',
      messages: aiMessages,
      temperature: temperature ?? 0.7,
      maxTokens: maxTokens ?? 4096,
      stream: true,
    });

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        userId: session.user.id,
      });
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
    } else {
      conversation = await Conversation.create({
        userId: session.user.id,
        title: generateTitle(messages[messages.length - 1].content),
        modelId: model || 'qwen3:1.7b',
      });
    }

    // Save user message (or update if editing)
    const userMessage = messages[messages.length - 1];
    const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
    if (editMessageId && isValidObjectId(editMessageId)) {
      const existingMessage = await Message.findOne({ _id: editMessageId, conversationId: conversation._id.toString() });
      if (existingMessage) {
        await Message.updateOne(
          { _id: editMessageId },
          { $set: { content: userMessage.content } }
        );
        // Delete all messages created after this one to truncate subsequent path
        await Message.deleteMany({
          conversationId: conversation._id.toString(),
          createdAt: { $gt: existingMessage.createdAt }
        });
      }
    } else {
      await Message.create({
        conversationId: conversation._id.toString(),
        role: 'user',
        content: userMessage.content,
        attachments: userMessage.attachments || [],
      });
    }

    // Create a transform stream to accumulate the response
    let fullContent = '';
    let transformBuffer = '';
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        transformBuffer += new TextDecoder().decode(chunk);
        const lines = transformBuffer.split('\n');
        transformBuffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            fullContent += parsed.content || '';

            // Forward the chunk
            controller.enqueue(
              new TextEncoder().encode(
                JSON.stringify({
                  ...parsed,
                  conversationId: conversation._id.toString(),
                }) + '\n'
              )
            );

            // When done, save the assistant message
            if (parsed.done) {
              await Message.create({
                conversationId: conversation._id.toString(),
                role: 'assistant',
                content: fullContent,
                modelId: model || 'qwen3:1.7b',
                tokenUsage: parsed.tokenUsage,
              });

              await Conversation.findByIdAndUpdate(conversation._id, {
                updatedAt: new Date(),
              });
            }
          } catch {
            // Ignore incomplete or parsing errors
          }
        }
      },
      async flush(controller) {
        if (transformBuffer.trim()) {
          try {
            const parsed = JSON.parse(transformBuffer);
            fullContent += parsed.content || '';

            controller.enqueue(
              new TextEncoder().encode(
                JSON.stringify({
                  ...parsed,
                  conversationId: conversation._id.toString(),
                }) + '\n'
              )
            );

            if (parsed.done) {
              await Message.create({
                conversationId: conversation._id.toString(),
                role: 'assistant',
                content: fullContent,
                modelId: model || 'qwen3:1.7b',
                tokenUsage: parsed.tokenUsage,
              });
            }
          } catch {}
        }
      }
    });

    const responseStream = stream.pipeThrough(transformStream);

    return new Response(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    let message = 'Chat failed';
    if (error instanceof Error) {
      if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
        message = 'Cannot connect to Ollama. Make sure Ollama is running (ollama serve).';
      } else {
        message = error.message;
      }
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
