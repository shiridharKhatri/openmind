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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const archived = searchParams.get('archived') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const query: Record<string, unknown> = {
      userId: session.user.id,
      archived,
    };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const conversations = await Conversation.find(query)
      .sort({ pinned: -1, updatedAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    const total = await Conversation.countDocuments(query);

    return NextResponse.json({ conversations, total });
  } catch (error) {
    console.error('List conversations error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { title, model } = await req.json();

    const conversation = await Conversation.create({
      userId: session.user.id,
      title: title || 'New conversation',
      modelId: model || 'openmind:latest',
    });

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find all conversation IDs for this user
    const conversations = await Conversation.find({ userId: session.user.id }).select('_id').lean();
    const conversationIds = conversations.map((c) => c._id.toString());

    // Delete all messages belonging to those conversations
    if (conversationIds.length > 0) {
      await Message.deleteMany({ conversationId: { $in: conversationIds } });
    }

    // Delete all conversations
    await Conversation.deleteMany({ userId: session.user.id });

    return NextResponse.json({ message: 'All conversations deleted', count: conversationIds.length });
  } catch (error) {
    console.error('Bulk delete conversations error:', error);
    return NextResponse.json({ error: 'Failed to delete conversations' }, { status: 500 });
  }
}
