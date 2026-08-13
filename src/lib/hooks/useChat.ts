'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { IMessage } from '@/types';

interface UseChatOptions {
  conversationId?: string | null;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  isDeepResearch?: boolean;
  systemPrompt?: string;
  onConversationCreated?: (id: string) => void;
}

interface UseChatReturn {
  messages: IMessage[];
  setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>;
  isStreaming: boolean;
  streamingContent: string;
  streamingThinking: string;
  sendMessage: (content: string, modelOverride?: string) => Promise<void>;
  stopGeneration: () => void;
  retryLastMessage: () => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  error: string | null;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingThinking, setStreamingThinking] = useState('');
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeConversationIdRef = useRef<string | null>(null);
  const prevConversationIdRef = useRef<string | null | undefined>(options.conversationId);

  // Clear messages and status when conversationId changes (e.g. New chat clicked)
  useEffect(() => {
    const prevId = prevConversationIdRef.current;
    prevConversationIdRef.current = options.conversationId;

    // If transitioning between empty IDs (new chat), do not reset or abort
    if (!prevId && !options.conversationId) {
      return;
    }

    // If transitioning to the conversation ID we are currently creating/streaming, do not reset!
    if (options.conversationId && options.conversationId === activeConversationIdRef.current) {
      return;
    }

    setMessages([]);
    setStreamingContent('');
    setStreamingThinking('');
    setIsStreaming(false);
    setError(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, [options.conversationId]);

  const sendMessage = useCallback(
    async (content: string, modelOverride?: string) => {
      if (!content.trim() || isStreaming) return;

      setError(null);
      setIsStreaming(true);
      setStreamingContent('');
      activeConversationIdRef.current = null;

      const userMessage: IMessage = {
        _id: `temp-${Date.now()}`,
        conversationId: options.conversationId || '',
        role: 'user',
        content,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Build message history
      const allMessages = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content },
      ];

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: allMessages,
            model: modelOverride || options.model || 'openmind:latest',
            conversationId: options.conversationId,
            temperature: options.temperature,
            maxTokens: options.maxTokens,
            isDeepResearch: options.isDeepResearch,
            systemPrompt: options.systemPrompt,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to send message');
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';
        let newConversationId = options.conversationId;
        let buffer = '';
        let accumulatedThinking = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          
          // The last element is either empty (if the string ended with \n) 
          // or a partial line (if it did not). Keep it in the buffer.
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line);
              
              if (parsed.progress !== undefined) {
                setStreamingContent(`[GENERATING_IMAGE_PROGRESS:${JSON.stringify({
                  progress: parsed.progress,
                  step: parsed.step,
                  totalSteps: parsed.totalSteps,
                  preview: parsed.preview
                })}]`);
              } else if (parsed.content) {
                accumulated += parsed.content;
                setStreamingContent(accumulated);
              }

              if (parsed.thinking) {
                accumulatedThinking += parsed.thinking;
                setStreamingThinking(accumulatedThinking);
              }

              if (parsed.conversationId && !newConversationId) {
                newConversationId = parsed.conversationId;
                activeConversationIdRef.current = parsed.conversationId;
                options.onConversationCreated?.(parsed.conversationId);
              }

              if (parsed.done) {
                const assistantMessage: IMessage = {
                  _id: `msg-${Date.now()}`,
                  conversationId: newConversationId || '',
                  role: 'assistant',
                  content: accumulated,
                  model: parsed.model,
                  tokenUsage: parsed.tokenUsage,
                  createdAt: new Date(),
                };

                setMessages((prev) => [...prev, assistantMessage]);
              }
            } catch {
              // Skip unparseable lines
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // User cancelled — save partial content as message
          if (accumulated.length > 0) {
            const partialMessage: IMessage = {
              _id: `msg-${Date.now()}`,
              conversationId: options.conversationId || '',
              role: 'assistant',
              content: accumulated,
              model: options.model,
              createdAt: new Date(),
            };
            setMessages((prev) => [...prev, partialMessage]);
          }
        } else {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        setIsStreaming(false);
        setStreamingContent('');
        setStreamingThinking('');
        abortControllerRef.current = null;
      }
    },
    [messages, options, isStreaming]
  );

  // We need accumulated in the closure for abort handling
  let accumulated = '';
  // The accumulated variable above is unused because it's tracked in sendMessage's closure
  void accumulated;

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const retryLastMessage = useCallback(async () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMessage) return;

    // Remove the last assistant message
    setMessages((prev) => {
      const lastAssistantIdx = prev.findLastIndex((m) => m.role === 'assistant');
      if (lastAssistantIdx >= 0) {
        return prev.slice(0, lastAssistantIdx);
      }
      return prev;
    });

    await sendMessage(lastUserMessage.content);
  }, [messages, sendMessage]);

  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      console.log("editMessage Hook Triggered:", { messageId, newContent });
      if (!newContent.trim() || isStreaming) {
        console.log("editMessage early return: empty content or isStreaming");
        return;
      }

      console.log("Current messages in state:", messages);
      const msgIndex = messages.findIndex((m) => m._id === messageId);
      console.log("Match index found:", msgIndex);
      if (msgIndex === -1) {
        console.log("editMessage early return: message index not found");
        return;
      }

      const updatedUserMessage = { ...messages[msgIndex], content: newContent };
      const newHistory = [...messages.slice(0, msgIndex), updatedUserMessage];

      setMessages(newHistory);
      setIsStreaming(true);
      setStreamingContent('');
      setStreamingThinking('');
      activeConversationIdRef.current = options.conversationId || null;

      const allMessages = newHistory.map((m) => ({ role: m.role, content: m.content }));

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: allMessages,
            model: options.model || 'openmind:latest',
            conversationId: options.conversationId,
            temperature: options.temperature,
            maxTokens: options.maxTokens,
            isDeepResearch: options.isDeepResearch,
            editMessageId: messageId,
            systemPrompt: options.systemPrompt,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to send message');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) {
          throw new Error('No reader');
        }

        let accumulated = '';
        let newConversationId = options.conversationId;
        let buffer = '';
        let accumulatedThinking = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line);
              accumulated += parsed.content || '';
              setStreamingContent(accumulated);

              if (parsed.thinking) {
                accumulatedThinking += parsed.thinking;
                setStreamingThinking(accumulatedThinking);
              }

              if (parsed.conversationId && !newConversationId) {
                newConversationId = parsed.conversationId;
                activeConversationIdRef.current = parsed.conversationId;
                options.onConversationCreated?.(parsed.conversationId);
              }

              if (parsed.done) {
                const assistantMessage: IMessage = {
                  _id: `msg-${Date.now()}`,
                  conversationId: newConversationId || '',
                  role: 'assistant',
                  content: accumulated,
                  model: parsed.model,
                  tokenUsage: parsed.tokenUsage,
                  createdAt: new Date(),
                };

                setMessages((prev) => [...prev, assistantMessage]);
                setStreamingContent('');
                setStreamingThinking('');
              }
            } catch (err) {
              console.error('Failed to parse line:', err);
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('Stream aborted');
        } else {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [messages, options, isStreaming]
  );

  return {
    messages,
    setMessages,
    isStreaming,
    streamingContent,
    streamingThinking,
    sendMessage,
    stopGeneration,
    retryLastMessage,
    editMessage,
    error,
  };
}
