'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import {
  Send,
  Paperclip,
  Mic,
  Globe,
  Settings2,
  Square,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComposerProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  isDeepResearch?: boolean;
  onToggleDeepResearch?: () => void;
  onAttach?: () => void;
  placeholder?: string;
  disabled?: boolean;
  initialValue?: string;
}

export function Composer({
  onSend,
  onStop,
  isStreaming = false,
  isDeepResearch = false,
  onToggleDeepResearch,
  onAttach,
  placeholder = 'Ask me anything...',
  disabled = false,
  initialValue = '',
}: ComposerProps) {
  const [text, setText] = useState(initialValue);
  const [genMode, setGenMode] = useState<'chat' | 'image' | 'video'>('chat');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 200) + 'px';
    }
  }, [text]);

  useEffect(() => {
    if (initialValue) {
      setText(initialValue);
    }
  }, [initialValue]);

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    let finalPayload = text.trim();
    if (genMode === 'image' && !finalPayload.toLowerCase().startsWith('/image ')) {
      finalPayload = `/image ${finalPayload}`;
    } else if (genMode === 'video' && !finalPayload.toLowerCase().startsWith('/video ')) {
      finalPayload = `/video ${finalPayload}`;
    }
    onSend(finalPayload);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isStreaming) return;
      handleSend();
    }
  };

  return (
    <div
      className={cn(
        'w-full max-w-[800px] mx-auto',
        'rounded-[20px]',
        'border transition-all duration-200',
        'bg-[var(--bg-card)]',
        'border-[var(--border-color)]',
        'focus-within:border-[var(--accent)]/60',
        'focus-within:ring-2 focus-within:ring-[var(--accent)]/15',
      )}
    >
      {/* Textarea */}
      <div className="px-5 pt-4 pb-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isStreaming}
          rows={1}
          className={cn(
            'w-full resize-none bg-transparent',
            'text-[15px] leading-relaxed',
            'text-[var(--text-primary)]',
            'placeholder:text-[var(--text-muted)]',
            'focus:outline-none',
            'disabled:opacity-50',
            'min-h-[24px] max-h-[200px]',
          )}
          aria-label="Message input"
        />
      </div>

      {/* Bottom toolbar */}
      <div className="flex items-center justify-between px-3 pb-3 pt-1">
        {/* Left tools */}
        <div className="flex items-center gap-1">
          {/* Segmented Control Mode Toggle */}
          <span className="flex items-center bg-[var(--bg-surface)] border border-[var(--border-color)]/60 rounded-xl p-0.5 ml-1">
            <button
              onClick={() => setGenMode('chat')}
              className={cn(
                'px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer',
                genMode === 'chat'
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              Chat
            </button>
            <button
              onClick={() => setGenMode('image')}
              className={cn(
                'px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer',
                genMode === 'image'
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              Image
            </button>
            <button
              onClick={() => setGenMode('video')}
              className={cn(
                'px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer',
                genMode === 'video'
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              Video
            </button>
          </span>

          {/* Attach */}
          <button
            onClick={onAttach}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
            aria-label="Attach file"
          >
            <Paperclip size={16} />
          </button>

          {/* Tools */}
          <button
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
            aria-label="AI tools"
          >
            <Wrench size={16} />
          </button>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-1">
          {/* Settings */}
          <button
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
            aria-label="Settings"
          >
            <Settings2 size={16} />
          </button>

          {/* Web search */}
          <button
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
            aria-label="Web search"
          >
            <Globe size={16} />
          </button>

          {/* Voice */}
          <button
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
            aria-label="Voice input"
          >
            <Mic size={16} />
          </button>

          {/* Send / Stop */}
          {isStreaming ? (
            <button
              onClick={onStop}
              className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
              aria-label="Stop generation"
            >
              <Square size={16} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!text.trim() || disabled}
              className={cn(
                'p-2.5 rounded-xl transition-all',
                text.trim()
                  ? 'bg-[var(--accent)] text-white hover:opacity-90 shadow-sm'
                  : 'bg-[var(--bg-hover)] text-[var(--text-muted)]',
              )}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
