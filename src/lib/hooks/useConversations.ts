'use client';

import { useConversationsContext } from '@/providers/ConversationsProvider';

export function useConversations() {
  return useConversationsContext();
}
