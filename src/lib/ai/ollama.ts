import { AIModel, ChatRequest } from '@/types';
import { AIProviderInterface } from './provider';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

export class OllamaProvider implements AIProviderInterface {
  name = 'ollama';

  async chat(params: ChatRequest): Promise<ReadableStream<Uint8Array>> {
    const targetModel = params.model === 'qwen3' ? 'qwen3:1.7b' : params.model;
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: targetModel,
        messages: params.messages.map((m) => ({
          role: m.role,
          content: m.content,
          ...(m.images?.length ? { images: m.images } : {}),
        })),
        stream: params.stream !== false,
        options: {
          temperature: params.temperature ?? 0.7,
          num_predict: params.maxTokens ?? 4096,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama error: ${response.status} - ${error}`);
    }

    if (!response.body) {
      throw new Error('No response body from Ollama');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    return new ReadableStream({
      async pull(controller) {
        try {
          const { done, value } = await reader.read();

          if (done) {
            controller.close();
            return;
          }

          const text = decoder.decode(value, { stream: true });
          const lines = text.split('\n').filter(Boolean);

          for (const line of lines) {
            try {
              const json = JSON.parse(line);

              if (json.message?.content || json.message?.thinking) {
                const chunk = JSON.stringify({
                  content: json.message.content || '',
                  thinking: json.message.thinking || '',
                  done: json.done || false,
                  model: json.model,
                  ...(json.done
                    ? {
                        tokenUsage: {
                          prompt: json.prompt_eval_count || 0,
                          completion: json.eval_count || 0,
                          total:
                            (json.prompt_eval_count || 0) +
                            (json.eval_count || 0),
                        },
                      }
                    : {}),
                });
                controller.enqueue(encoder.encode(chunk + '\n'));
              } else if (json.done) {
                const chunk = JSON.stringify({
                  content: '',
                  done: true,
                  model: json.model,
                  tokenUsage: {
                    prompt: json.prompt_eval_count || 0,
                    completion: json.eval_count || 0,
                    total:
                      (json.prompt_eval_count || 0) +
                      (json.eval_count || 0),
                  },
                });
                controller.enqueue(encoder.encode(chunk + '\n'));
              }
            } catch {
              // Skip non-JSON lines
            }
          }
        } catch (error) {
          controller.error(error);
        }
      },
      cancel() {
        reader.cancel();
      },
    });
  }

  async listModels(): Promise<AIModel[]> {
    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);

      if (!response.ok) {
        return [];
      }

      const data = await response.json();

      return (data.models || []).map(
        (m: { name: string; size: number; details?: { parameter_size?: string } }) => ({
          id: m.name,
          name: m.name.split(':')[0],
          provider: 'ollama',
          description: `${m.details?.parameter_size || 'Unknown'} parameters`,
          available: true,
        })
      );
    } catch {
      return [];
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
