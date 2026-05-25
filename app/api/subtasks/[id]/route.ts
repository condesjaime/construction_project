import { NextRequest, NextResponse } from 'next/server';
import { updateSubTask, deleteSubTask } from '@/lib/db-service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const data = await request.json();
    console.log('Updating subtask with data:', data);
    const task = await updateSubTask(id, data);

    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update subtask' },
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

    await deleteSubTask(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete subtask' },
      { status: 500 }
    );
  }
}