import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { FileModel } from '@/lib/models/File';
import { unlink } from 'fs/promises';

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

    const file = await FileModel.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete physical file
    try {
      await unlink(file.path);
    } catch {
      // File may already be deleted
    }

    return NextResponse.json({ message: 'File deleted' });
  } catch (error) {
    console.error('File DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
