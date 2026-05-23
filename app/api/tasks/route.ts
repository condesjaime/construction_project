import { NextRequest, NextResponse } from 'next/server';
import { getTasks, createTask, updateTask, deleteTask } from '@/lib/db-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    const teamId = searchParams.get('teamId');

    const tasks = await getTasks({
      projectId: projectId || undefined,
      teamId: teamId || undefined,
    });

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const task = await createTask(data);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
