import { NextRequest, NextResponse } from 'next/server';
import { updateDiaryEntry, deleteDiaryEntry, createDiaryEntry } from '@/lib/db-service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const entry = await updateDiaryEntry(id, data);

    return NextResponse.json(entry);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update diary entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await deleteDiaryEntry(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete diary entry' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ date: Date; notes: string,photo: string[], taskId: string, projectId: string }> }
) {

    console.log('Received data:', await params);
  try {
    const { date, notes, photo, taskId, projectId } = await params;

    await createDiaryEntry({ projectId, date, notes, photo, taskId });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create diary entry' },
      { status: 500 }
    );
  }
}