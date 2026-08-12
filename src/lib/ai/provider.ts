import { AIModel, ChatRequest } from '@/types';

export interface AIProviderInterface {
  name: string;
  chat(params: ChatRequest): Promise<ReadableStream<Uint8Array>>;
  listModels(): Promise<AIModel[]>;
  healthCheck(): Promise<boolean>;
}

export function getProvider(name?: string): AIProviderInterface {
  switch (name) {
    case 'ollama':
    default:
      // Dynamically import to avoid bundling issues
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { OllamaProvider } = require('./ollama');
      return new OllamaProvider();
  }
}
