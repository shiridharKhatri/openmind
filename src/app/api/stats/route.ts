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

    // 1. Get all conversation IDs for the user
    const conversations = await Conversation.find({ userId: session.user.id }, '_id');
    const conversationIds = conversations.map(c => c._id.toString());

    if (conversationIds.length === 0) {
      return NextResponse.json({
        summary: { prompt: 0, completion: 0, total: 0 },
        daily: []
      });
    }

    // 2. Aggregate overall token usage
    const overallResult = await Message.aggregate([
      {
        $match: {
          conversationId: { $in: conversationIds },
          'tokenUsage.total': { $exists: true, $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          prompt: { $sum: '$tokenUsage.prompt' },
          completion: { $sum: '$tokenUsage.completion' },
          total: { $sum: '$tokenUsage.total' }
        }
      }
    ]);

    const stats = overallResult[0] || { prompt: 0, completion: 0, total: 0 };

    // 3. Aggregate daily token usage for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyResult = await Message.aggregate([
      {
        $match: {
          conversationId: { $in: conversationIds },
          'tokenUsage.total': { $exists: true, $gt: 0 },
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          prompt: { $sum: '$tokenUsage.prompt' },
          completion: { $sum: '$tokenUsage.completion' },
          total: { $sum: '$tokenUsage.total' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Create a map of the last 7 days to fill in zeros
    const dailyMap = new Map();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      dailyMap.set(dateString, { date: dateString, label: dayName, prompt: 0, completion: 0, total: 0 });
    }

    // Populate actual stats
    dailyResult.forEach(item => {
      if (dailyMap.has(item._id)) {
        const entry = dailyMap.get(item._id);
        entry.prompt = item.prompt || 0;
        entry.completion = item.completion || 0;
        entry.total = item.total || 0;
      }
    });

    const dailyData = Array.from(dailyMap.values());

    return NextResponse.json({
      summary: {
        prompt: stats.prompt || 0,
        completion: stats.completion || 0,
        total: stats.total || 0
      },
      daily: dailyData
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
