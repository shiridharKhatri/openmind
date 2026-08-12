import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { LibraryItem } from '@/lib/models/LibraryItem';

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

    const item = await LibraryItem.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Item deleted' });
  } catch (error) {
    console.error('Library DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
