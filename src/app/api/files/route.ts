import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { FileModel } from '@/lib/models/File';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const query: Record<string, unknown> = { userId: session.user.id };
    if (search) query.name = { $regex: search, $options: 'i' };

    const files = await FileModel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Files GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    await connectDB();

    const uploadDir = path.join(process.cwd(), 'uploads', session.user.id);
    await mkdir(uploadDir, { recursive: true });

    const savedFiles = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uniqueName = `${Date.now()}-${file.name}`;
      const filePath = path.join(uploadDir, uniqueName);

      await writeFile(filePath, buffer);

      const savedFile = await FileModel.create({
        userId: session.user.id,
        name: uniqueName,
        originalName: file.name,
        type: file.name.split('.').pop() || 'unknown',
        size: file.size,
        mimeType: file.type,
        path: filePath,
      });

      savedFiles.push(savedFile);
    }

    return NextResponse.json({ files: savedFiles }, { status: 201 });
  } catch (error) {
    console.error('Files POST error:', error);
    return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 });
  }
}
