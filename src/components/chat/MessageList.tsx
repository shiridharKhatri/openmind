'use client';

import { useRef, useEffect } from 'react';
import { IMessage } from '@/types';
import { MessageBubble } from './MessageBubble';
import { MarkdownRenderer } from './MarkdownRenderer';
import { AlertCircle } from 'lucide-react';

interface MessageListProps {
  messages: IMessage[];
  isStreaming: boolean;
  streamingContent: string;
  streamingThinking?: string;
  model?: string;
  onRetry?: () => void;
  onCopy?: (content: string) => void;
  onLike?: (messageId: string, liked: boolean) => void;
  onEdit?: (messageId: string, content: string) => void;
  error?: string | null;
}

export function MessageList({
  messages,
  isStreaming,
  streamingContent,
  streamingThinking = '',
  model,
  onRetry,
  onCopy,
  onLike,
  onEdit,
  error,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages, streamingContent, streamingThinking]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-[800px] mx-auto flex flex-col" style={{ gap: 'var(--chat-message-gap, 24px)' }}>
        {messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            onCopy={onCopy}
            onLike={onLike}
            onRetry={message.role === 'assistant' ? onRetry : undefined}
            onEdit={onEdit}
          />
        ))}

        {/* Streaming message */}
        {isStreaming && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center overflow-hidden mt-0.5">
              <img
                src="/omlogo.png"
                alt="OpenMind AI"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0 space-y-3">
              {streamingThinking && (
                <details className="group" open>
                  <summary className="flex items-center gap-2 text-[12px] text-lavender-400 font-semibold cursor-pointer list-none select-none hover:opacity-90">
                    <span className="inline-block transition-transform duration-200 group-open:rotate-90">
                      ▶
                    </span>
                    <span>Thinking Process</span>
                  </summary>
                  <div className="mt-2 pl-3 border-l-2 border-lavender-400/30 text-[12.5px] text-[var(--text-secondary)] font-mono leading-relaxed whitespace-pre-wrap">
                    {streamingThinking}
                  </div>
                </details>
              )}

              {streamingContent ? (
                <div className="text-[14.5px] leading-relaxed text-[var(--text-primary)] streaming-cursor">
                  <MarkdownRenderer content={streamingContent} />
                </div>
              ) : !streamingThinking && (
                <div className="flex items-center gap-1.5 h-7 pl-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-lavender-400/80 animate-[bounce_1.4s_infinite_0ms]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-lavender-400/60 animate-[bounce_1.4s_infinite_200ms]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-lavender-400/40 animate-[bounce_1.4s_infinite_400ms]" />
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="flex gap-3 items-start bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 dark:border-red-500/10 rounded-2xl p-4 text-red-600 dark:text-red-400 text-[13.5px] shadow-sm max-w-full">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold mb-1 text-[14px]">Connection Error</p>
              <p className="text-[13px] opacity-90 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
