import { NextRequest, NextResponse } from 'next/server';
import { getSubTasks, createSubTask } from '@/lib/db-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    const taskId = searchParams.get('taskId');

    const tasks = await getSubTasks({
      projectId: projectId || undefined,
      taskId: taskId || undefined,
    });

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch subtasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const subtask = await createSubTask(data);
    return NextResponse.json(subtask, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Failed to create subtask' },
      { status: 500 }
    );
  }
}
