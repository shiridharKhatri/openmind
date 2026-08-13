import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

async function getModelName(): Promise<string> {
  let modelName = 'openmind:latest';
  try {
    const tagsResponse = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (tagsResponse.ok) {
      const data = await tagsResponse.json();
      if (data.models && data.models.length > 0) {
        const firstModel = data.models.find((m: any) => !m.name.includes('embed'));
        if (firstModel) {
          modelName = firstModel.name;
        }
      }
    }
  } catch (e) {
    console.warn('Ollama tags lookup failed, fallback to default model');
  }
  return modelName;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, resumeData, jobDescription, outreachType, company, contactName, chatHistory, userAnswer } = await req.json();

    if (!action) {
      return NextResponse.json({ error: 'Action parameter is required' }, { status: 400 });
    }

    const modelName = await getModelName();

    // ACTION 1: ATS ANALYZE
    if (action === 'analyze') {
      const systemPrompt = `You are an expert ATS (Applicant Tracking System) scanner and resume optimizer.
Analyze the user's resume JSON and the target Job Description. Compute a matching score (0-100), identify missing keywords (max 10), and provide specific suggestions to improve the resume for this role.

You MUST respond with a single, raw, valid JSON object matching the structure below. Do not wrap in markdown block, explanations, or preambles. Output raw JSON ONLY.

JSON Schema:
{
  "score": 85,
  "missingKeywords": ["Docker", "Kubernetes", "Next.js"],
  "suggestions": [
    "Add Next.js keywords to the top skills block and mention it explicitly in your Fishtail experience.",
    "Quantify your experience by adding concrete metrics, e.g. performance speed improvements."
  ]
}`;

      const userPrompt = `Resume:
${JSON.stringify(resumeData, null, 2)}

Job Description:
${jobDescription || 'Not specified'}`;

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
          options: { temperature: 0.2 }
        })
      });

      if (!chatResponse.ok) throw new Error('Ollama chat failed');
      const chatData = await chatResponse.json();
      let content = chatData.message?.content || '';
      content = content.trim().replace(/^```(json)?\n/, '').replace(/\n```$/, '').trim();

      return NextResponse.json(JSON.parse(content));
    }

    // ACTION 2: COVER LETTER
    if (action === 'cover-letter') {
      const systemPrompt = `You are a professional hiring consultant. Write a highly tailored, compelling, single-page Cover Letter based on the user's resume data and the target Job Description. 
The cover letter should look extremely polished, structured formally (Date, Recruiter Address, Subject line, Opening, Core body, Call to Action, and Closing Sign-off). Keep it realistic, authentic, and direct. Avoid generic fluff. Do not output markdown, preambles, or postscripts. Just output the cover letter text directly.`;

      const userPrompt = `Resume Details:
${JSON.stringify(resumeData, null, 2)}

Job Description:
${jobDescription || 'Not specified'}`;

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
          options: { temperature: 0.6 }
        })
      });

      if (!chatResponse.ok) throw new Error('Ollama chat failed');
      const chatData = await chatResponse.json();
      return NextResponse.json({ text: chatData.message?.content || '' });
    }

    // ACTION 3: COLD OUTREACH
    if (action === 'outreach') {
      const systemPrompt = `You are a career networking specialist. Write a concise, natural, and high-converting cold outreach message based on the user's resume.
Type requested: "${outreachType || 'General connection'}"
Company target: "${company || 'Target Company'}"
Recipient name: "${contactName || 'Recruiter'}"

Keep the email or LinkedIn message short (under 150 words), conversational, professional, and focusing on mutual interest or referrals. Do not include markdown code block wrappers or conversational preambles. Output the text directly.`;

      const userPrompt = `Sender Resume Details:
${JSON.stringify(resumeData, null, 2)}`;

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
          options: { temperature: 0.6 }
        })
      });

      if (!chatResponse.ok) throw new Error('Ollama chat failed');
      const chatData = await chatResponse.json();
      return NextResponse.json({ text: chatData.message?.content || '' });
    }

    // ACTION 4: INTERVIEW PREP
    if (action === 'interview') {
      const systemPrompt = `You are an expert technical interviewer simulating a live mock interview.
Analyze the user's resume and target Job Description. Act as the interviewer.
- If this is the start of the chat (no previous answer), greet the user, state your role, and ask a relevant question based on their resume experience and target job.
- If the user answered a question, provide a brief feedback rating on their previous answer (e.g. "Feedback: Excellent point on Socket.io. To improve, you could specify how you handled scale."), and then ask the NEXT situational or technical question.
Keep questions brief, realistic, and direct.

Output a JSON object containing:
{
  "feedback": "Feedback on their previous answer, or empty string if it is the first question",
  "question": "The next question you want to ask"
}
Output raw JSON ONLY. Do not write explanations outside of JSON.`;

      const historyPrompt = chatHistory && chatHistory.length > 0 
        ? `Chat History: \n${chatHistory.map((h: any) => `${h.role === 'user' ? 'Candidate' : 'Interviewer'}: ${h.content}`).join('\n')}\nCandidate's New Answer: ${userAnswer}`
        : `Start of the interview. Candidate has just walked in.`;

      const userPrompt = `Candidate Resume:
${JSON.stringify(resumeData, null, 2)}

Target Job Description:
${jobDescription || 'Full Stack Developer'}

State:
${historyPrompt}`;

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
          options: { temperature: 0.5 }
        })
      });

      if (!chatResponse.ok) throw new Error('Ollama chat failed');
      const chatData = await chatResponse.json();
      let content = chatData.message?.content || '';
      content = content.trim().replace(/^```(json)?\n/, '').replace(/\n```$/, '').trim();

      return NextResponse.json(JSON.parse(content));
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });

  } catch (error: any) {
    console.error('Career Suite API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
