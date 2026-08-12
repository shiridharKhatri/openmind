import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getProvider } from '@/lib/ai/provider';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, model, mode } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const provider = getProvider('ollama');

    // Build specialized prompt depending on the bypass mode
    let systemPrompt = '';
    
    if (mode === 'deep') {
      systemPrompt = `You are a highly advanced text transformer specializing in bypassing academic AI detectors like Turnitin, GPTZero, and Copyleaks.
Your goal is to rewrite the input text so it reads exactly like it was written by an expert human researcher or writer.

Follow these rules strictly:
1. EXTREME BURSTINESS (Sentence length variance): Intermix extremely short, punchy sentences (3-7 words) with long, compound-complex sentences (25-35 words) that contain sub-clauses, parenthetical notes, or em-dashes. Never use similar sentence structures or lengths in consecutive sentences.
2. HIGH PERPLEXITY (Predictability reduction): Avoid predictable, standard AI vocabulary. Do NOT use words like "delve", "testament", "tapestry", "moreover", "furthermore", "pivotal", "catalyst", "beacon", "demystify", "multifaceted", "in conclusion", "it is crucial to note". Use varied, rich, and natural human synonyms instead.
3. NATURAL HUMAN FLOW: Avoid rigid academic formulaic structure. Do not start every paragraph with a standard transition word. Start paragraphs directly with observations, assertions, or examples.
4. ACTIVE VOICE & ENGAGING TONE: Write in active voice. Use colloquial structures or rhetorical questions occasionally if suitable to break standard academic rigidity.
5. PRESERVE ALL FACTS: Do not summarize, shorten, or omit any factual claims, data points, or core arguments. Rewrite only the delivery, syntax, and rhythm.
6. OUTPUT ONLY the final rewritten text. Under no circumstances should you include conversational prefaces, explanations, labels, or confirmation notes.`;
    } else {
      // Standard bypass / humanizer
      systemPrompt = `You are a professional text humanizer. Rewrite the user's text to make it sound organic, conversational, and natural, bypassing common AI detectors.

Follow these rules:
1. Vary sentence lengths so the text flows naturally rather than mechanically.
2. Use simple, direct language and avoid typical AI buzzwords ("delve", "tapestry", "testament", etc.).
3. Prefer active verbs and a friendly, engaging tone.
4. Retain all key facts, formatting, and arguments.
5. Do not include any explanations or opening remarks in your response. Output only the humanized text.`;
    }

    const stream = await provider.chat({
      model: model || 'dolphin-llama3',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.85,
      stream: true,
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Humanizer API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
