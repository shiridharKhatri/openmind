import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { LibraryItem } from '@/lib/models/LibraryItem';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const folder = searchParams.get('folder') || '';

    const query: Record<string, unknown> = { userId: session.user.id };
    if (search) query.title = { $regex: search, $options: 'i' };
    if (type) query.type = type;
    if (folder) query.folder = folder;

    const items = await LibraryItem.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Library GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch library items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, type, folder, tags } = await req.json();

    if (!title || !content || !type) {
      return NextResponse.json(
        { error: 'Title, content, and type are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const item = await LibraryItem.create({
      userId: session.user.id,
      title,
      content,
      type,
      folder: folder || '',
      tags: tags || [],
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Library POST error:', error);
    return NextResponse.json({ error: 'Failed to create library item' }, { status: 500 });
  }
}
