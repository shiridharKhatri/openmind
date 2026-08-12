'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ChatView } from '@/components/chat/ChatView';

export default function ChatPage({
  params,
}: {
  params: Promise<{ id?: string[] }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  const conversationId = resolvedParams.id && resolvedParams.id.length > 0 ? resolvedParams.id[0] : null;

  const handleConversationCreated = (newId: string) => {
    window.history.replaceState(null, '', `/chat/${newId}`);
  };

  const handleStreamFinished = (finalId: string) => {
    router.replace(`/chat/${finalId}`, { scroll: false });
  };

  return (
    <ChatView
      conversationId={conversationId}
      model="qwen3"
      onConversationCreated={handleConversationCreated}
      onStreamFinished={handleStreamFinished}
    />
  );
}
