   'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { IConversation } from '@/types';

interface ConversationsContextType {
  conversations: IConversation[];
  loading: boolean;
  error: string | null;
  fetchConversations: (search?: string) => Promise<void>;
  createConversation: (title?: string, model?: string) => Promise<IConversation | null>;
  deleteConversation: (id: string) => Promise<void>;
  updateConversation: (id: string, updates: Partial<IConversation>) => Promise<IConversation | null>;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined);

export function ConversationsProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('openmind:latest');

  // Load selected model from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('om_selected_model');
      if (saved) {
        setSelectedModel(saved);
      }
    }
  }, []);

  const handleSetSelectedModel = useCallback((model: string) => {
    setSelectedModel(model);
    if (typeof window !== 'undefined') {
      localStorage.setItem('om_selected_model', model);
    }
  }, []);

  const fetchConversations = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('limit', '50');

      const res = await fetch(`/api/conversations?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  const createConversation = useCallback(async (title?: string, model?: string) => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, model }),
      });
      if (!res.ok) throw new Error('Failed to create');
      const data = await res.json();
      setConversations((prev) => [data.conversation, ...prev]);
      return data.conversation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
      return null;
    }
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setConversations((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete conversation');
    }
  }, []);

  const updateConversation = useCallback(
    async (id: string, updates: Partial<IConversation>) => {
      try {
        const res = await fetch(`/api/conversations/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Failed to update');
        const data = await res.json();
        setConversations((prev) =>
          prev.map((c) => (c._id === id ? data.conversation : c))
        );
        return data.conversation;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update conversation');
        return null;
      }
    },
    []
  );

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return (
    <ConversationsContext.Provider
      value={{
        conversations,
        loading,
        error,
        fetchConversations,
        createConversation,
        deleteConversation,
        updateConversation,
        selectedModel,
        setSelectedModel: handleSetSelectedModel,
      }}
    >
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversationsContext() {
  const context = useContext(ConversationsContext);
  if (context === undefined) {
    throw new Error('useConversationsContext must be used within a ConversationsProvider');
  }
  return context;
}
