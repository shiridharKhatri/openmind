'use client';

import { RefreshCw, Lightbulb, Search } from 'lucide-react';

interface SuggestionCardsProps {
  onSelect: (prompt: string) => void;
}

const suggestions = [
  {
    icon: RefreshCw,
    title: 'Synthesize',
    prompt: 'Turn my meeting notes into 5 key bullet points for the team.',
  },
  {
    icon: Lightbulb,
    title: 'Brainstorm',
    prompt: 'Generate 3 taglines for a new sustainable fashion brand.',
  },
  {
    icon: Search,
    title: 'Research',
    prompt: 'Compare key differences between GDPR and CCPA.',
  },
];

export function SuggestionCards({ onSelect }: SuggestionCardsProps) {
  return (
    <div className="flex gap-2 mt-4">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.title}
          onClick={() => onSelect(suggestion.prompt)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-lavender-400/40 hover:bg-[var(--bg-hover)] transition-all duration-200 group"
        >
          <suggestion.icon size={13} className="text-lavender-400 shrink-0" />
          <span className="text-[12px] font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors whitespace-nowrap">
            {suggestion.title}
          </span>
        </button>
      ))}
    </div>
  );
}
