import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

async function fetchTextFromUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      next: { revalidate: 0 }
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch URL: ${res.statusText}`);
    }
    const html = await res.text();
    
    // Strip script and style blocks
    let cleaned = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
      
    // Strip remaining HTML tags
    cleaned = cleaned.replace(/<[^>]+>/g, ' ');
    
    // Normalize whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Limit size to avoid overloading LLM token limits (e.g. first 20,000 characters)
    return cleaned.substring(0, 20000);
  } catch (error: any) {
    throw new Error(`Failed to scrape portfolio URL: ${error.message}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { background, url } = await req.json();
    
    let sourceContent = '';
    
    if (url && url.trim()) {
      let formattedUrl = url.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }
      try {
        sourceContent = await fetchTextFromUrl(formattedUrl);
      } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
    } else if (background && background.trim()) {
      sourceContent = background.trim();
    } else {
      return NextResponse.json({ error: 'Either background details or portfolio URL is required' }, { status: 400 });
    }

    // 1. Find an available local model
    let modelName = 'openmind:latest';
    try {
      const tagsResponse = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
      if (tagsResponse.ok) {
        const data = await tagsResponse.json();
        if (data.models && data.models.length > 0) {
          // Find first model that is not an embedding model
          const firstModel = data.models.find((m: any) => !m.name.includes('embed'));
          if (firstModel) {
            modelName = firstModel.name;
          }
        }
      }
    } catch (e) {
      console.warn('Ollama tags lookup failed, fallback to default model');
    }

    // 2. Query Ollama chat API
    const systemPrompt = `You are an expert resume writer. Generate a highly professional, fully detailed resume based on the user's website content or background details.
CRITICAL INSTRUCTION: You must extract and generate ACTUAL details. DO NOT copy the placeholder explanations in the schema (e.g. do not output literal explanations like "A compelling 2-3 sentence...").
Write a real, tailored, high-impact professional summary and comprehensive bullet points. 
If the user's data does not explicitly state project or experience descriptions, you MUST use your AI capabilities to expand and infer professional-grade descriptions based on their job title, skills, technologies, and achievements.

You must output a single, raw, valid JSON object matching the following structure exactly. Do not include markdown wrapping (such as \`\`\`json), explanations, or preambles. Output raw JSON ONLY.

JSON Schema:
{
  "personal": {
    "fullName": "Name of the person",
    "title": "Professional title (e.g. Freelance Full-Stack Developer & Designer)",
    "email": "Email address (clean any [email protected] obfuscation if possible, or infer/suggest one)",
    "phone": "Phone number (leave blank if not found)",
    "location": "City, State or Country (e.g. Nepal)",
    "website": "Personal portfolio URL",
    "linkedin": "LinkedIn profile link or GitHub link"
  },
  "summary": "Write a compelling, real, customized 2-3 sentence professional summary highlighting their core expertise, design/dev focus, and tech stack.",
  "experience": [
    {
      "company": "Company Name (e.g. Freelance / Self-employed if not stated, or project clients)",
      "role": "Role / Title (e.g. Web Developer & UI Designer)",
      "location": "Location (e.g. Remote / Nepal)",
      "startDate": "Start date (e.g. Year)",
      "endDate": "End date (e.g. Present / Year)",
      "description": "Write 2-3 sentences of rich professional bullet points showing work done, e.g. designing layouts, building web applications using React/Node.js, collaborating with clients, optimizing performance."
    }
  ],
  "education": [
    {
      "school": "University/School name (e.g. London Metropolitan University)",
      "degree": "Degree (e.g. Bachelor of Information Technology)",
      "field": "Field of study (e.g. Computing / IT)",
      "location": "Location (e.g. London / Nepal)",
      "startDate": "Start year",
      "endDate": "End year (e.g. Present)",
      "description": "Short description of courses, honors, or projects"
    }
  ],
  "projects": [
    {
      "title": "Project Title (extract actual project names if listed, or infer key work/projects)",
      "role": "Role in project (e.g. Full-Stack Developer)",
      "link": "Link to repository or live site",
      "technologies": "Comma-separated list of tech used (e.g. React, Next.js, Node.js, MongoDB, JavaScript)",
      "description": "Write a detailed description of what was designed and built, and the visual/interactive results."
    }
  ],
  "skills": ["Skill 1", "Skill 2", "Skill 3"],
  "languages": ["Language 1", "Language 2"]
}`;

    const userPrompt = `Analyze this portfolio content and generate a complete, high-quality detailed resume. Fill in all arrays with actual parsed items, or write intelligent, realistic client work/freelance projects and experiences based on their listed projects/skills.
DO NOT use placeholder strings from the schema definition.

Portfolio Webpage Text:
"${sourceContent}"`;

    const chatResponse = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: false,
        options: {
          temperature: 0.3,
        }
      })
    });

    if (!chatResponse.ok) {
      throw new Error(`Ollama chat request failed: ${chatResponse.statusText}`);
    }

    const chatData = await chatResponse.json();
    let content = chatData.message?.content || '';

    // Clean up content: strip ```json ... ``` wrapper if present
    content = content.trim();
    if (content.startsWith('```')) {
      content = content.replace(/^```(json)?\n/, '').replace(/\n```$/, '');
    }
    content = content.trim();

    try {
      const parsedResume = JSON.parse(content);
      return NextResponse.json(parsedResume);
    } catch (parseError) {
      console.error('Failed to parse model output as JSON:', content);
      return NextResponse.json({
        error: 'AI did not return a valid JSON format. Please try again.',
        raw: content
      }, { status: 422 });
    }
  } catch (error: any) {
    console.error('Resume generation API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
