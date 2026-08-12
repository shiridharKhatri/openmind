import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Conversation } from '@/lib/models/Conversation';
import { Message } from '@/lib/models/Message';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // 1. Fetch all conversations of the user
    const conversations = await Conversation.find({ userId: session.user.id }).lean();
    const conversationIds = conversations.map(c => c._id.toString());

    // 2. Fetch all messages belonging to these conversations
    const messages = await Message.find({ conversationId: { $in: conversationIds } }).sort({ createdAt: 1 }).lean();

    // 3. Map messages to their conversations
    const exportData = conversations.map(convo => {
      const convoMessages = messages.filter(msg => msg.conversationId === convo._id.toString());
      return {
        ...convo,
        messages: convoMessages
      };
    });

    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      userId: session.user.id,
      conversationsCount: exportData.length,
      messagesCount: messages.length,
      data: exportData
    });
  } catch (error) {
    console.error('Export data error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
