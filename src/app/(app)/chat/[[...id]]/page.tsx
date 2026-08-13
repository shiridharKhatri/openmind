'use client';

import { use, Suspense } from 'react';
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
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-zinc-500">Loading Chat...</div>}>
      <ChatView
        conversationId={conversationId}
        model="openmind:latest"
        onConversationCreated={handleConversationCreated}
        onStreamFinished={handleStreamFinished}
      />
    </Suspense>
  );
}
