'use client';

import { OpenMindMascot } from '@/components/ui/OpenMindMascot';
import { PromptInput } from '@/components/ui/ai-chat-input';
import { SuggestionCards } from './SuggestionCards';

import { useModels } from '@/lib/hooks/useModels';

interface WelcomeScreenProps {
  userName?: string;
  onSend: (message: string, model?: string) => void;
}

export function WelcomeScreen({
  userName = 'there',
  onSend,
}: WelcomeScreenProps) {
  const { models: fetchedModels } = useModels();
  const availableModelNames = fetchedModels.map((m) => m.id).filter(Boolean);
  const modelList = availableModelNames.length > 0 ? availableModelNames : ['openmind:latest'];

  const handleSubmit = (
    value: string,
    meta: { model: string; effort: string; attachments: File[] }
  ) => {
    onSend(value, meta.model);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      {/* Mascot */}
      <OpenMindMascot size={170} />

      {/* Greeting */}
      <h2 className="text-2xl font-light text-lavender-400 mb-1">
        Hello, {userName}
      </h2>
      <h1 className="text-[28px] font-semibold text-[var(--text-primary)] mb-8">
        How can I assist you today?
      </h1>

      {/* Prompt Input */}
      <PromptInput
        onSubmit={handleSubmit}
        placeholder="Ask me anything..."
        models={modelList}
      />

      {/* Suggestion Cards */}
      <SuggestionCards onSelect={onSend} />
    </div>
  );
}
