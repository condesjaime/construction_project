import { NextRequest, NextResponse } from 'next/server';
import { getSubTasksAssignment } from '@/lib/db-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const projectId =
      searchParams.get('projectId') || undefined;

    const data = await getSubTasksAssignment({
      projectId,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      '❌ Error fetching subtask assignments:',
      error
    );

    return NextResponse.json(
      {
        error: 'Failed to fetch subtask assignments',
        details:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      },
      { status: 500 }
    );
  }
}