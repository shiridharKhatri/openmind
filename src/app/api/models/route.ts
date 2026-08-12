import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getProvider } from '@/lib/ai/provider';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const provider = getProvider('ollama');

    const isHealthy = await provider.healthCheck();
    if (!isHealthy) {
      return NextResponse.json({
        models: [],
        available: false,
        message: 'Ollama is not available. Make sure Ollama is running.',
      });
    }

    const models = await provider.listModels();

    return NextResponse.json({
      models,
      available: true,
    });
  } catch (error) {
    console.error('Models error:', error);
    return NextResponse.json({
      models: [],
      available: false,
      message: 'Failed to fetch models',
    });
  }
}
