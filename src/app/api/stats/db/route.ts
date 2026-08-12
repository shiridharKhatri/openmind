import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Conversation } from '@/lib/models/Conversation';
import { Message } from '@/lib/models/Message';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const conversationCount = await Conversation.countDocuments({ userId: session.user.id });
    const conversations = await Conversation.find({ userId: session.user.id }, '_id');
    const conversationIds = conversations.map(c => c._id.toString());
    const messageCount = await Message.countDocuments({ conversationId: { $in: conversationIds } });

    let dataSizeMB = 0;
    try {
      const db = mongoose.connection.db;
      if (db) {
        const stats = await db.command({ dbStats: 1 });
        dataSizeMB = stats.dataSize / (1024 * 1024);
      }
    } catch {
      // Fallback if dbStats command fails or isn't permitted
    }

    return NextResponse.json({
      conversations: conversationCount,
      messages: messageCount,
      storageSize: dataSizeMB > 0 ? `${dataSizeMB.toFixed(2)} MB` : 'Under 1 MB'
    });
  } catch (error) {
    console.error('Storage stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch storage stats' }, { status: 500 });
  }
}
