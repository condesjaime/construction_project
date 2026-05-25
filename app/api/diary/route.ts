import { NextRequest, NextResponse } from 'next/server';

import {
  getDiaryEntries,
  getDiaryEntriesAll,
  createDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
} from '@/lib/db-service';

import { getUserFromRequest } from '@/lib/auth/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    const searchParams =
      request.nextUrl.searchParams;

    const projectId =
      searchParams.get('projectId');

    if (projectId) {
      const entries =
        await getDiaryEntries(projectId);

      return NextResponse.json(entries);
    }

    const entries =
      await getDiaryEntriesAll();

    return NextResponse.json(entries);
  } catch (error: any) {
    console.error(
      'Error fetching diary entries:',
      error
    );

    if (
      error.message ===
        'ACCESS_TOKEN_EXPIRED' ||
      error.message ===
        'INVALID_TOKEN'
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error:
          'Failed to fetch diary entries',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {

    const user = getUserFromRequest(request);

    const data = await request.json();

    const entry = await createDiaryEntry({
      ...data,
      userId: user.userId,
    });

    return NextResponse.json(
      entry,
      {
        status: 201,
      }
    );

  } catch (error: any) {

    console.error(
      'Error creating diary entry:',
      error
    );

    if (
      error.message === 'ACCESS_TOKEN_EXPIRED'
    ) {
      return NextResponse.json(
        {
          error: 'Access token expired',
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json(
      {
        error: 'Unauthorized',
      },
      {
        status: 401,
      }
    );
  }
}