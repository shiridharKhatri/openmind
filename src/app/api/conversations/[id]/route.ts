import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Conversation } from '@/lib/models/Conversation';
import { Message } from '@/lib/models/Message';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const conversation = await Conversation.findOne({
      _id: id,
      userId: session.user.id,
    }).lean();

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const messages = await Message.find({ conversationId: id })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({ conversation, messages });
  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const updates = await req.json();

    await connectDB();

    const allowedUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) allowedUpdates.title = updates.title;
    if (updates.pinned !== undefined) allowedUpdates.pinned = updates.pinned;
    if (updates.archived !== undefined) allowedUpdates.archived = updates.archived;
    if (updates.model !== undefined) allowedUpdates.modelId = updates.model;

    const conversation = await Conversation.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: allowedUpdates },
      { new: true }
    ).lean();

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Update conversation error:', error);
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const conversation = await Conversation.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Delete all messages in the conversation
    await Message.deleteMany({ conversationId: id });

    return NextResponse.json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
  }
}
