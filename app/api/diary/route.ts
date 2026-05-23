import { NextRequest, NextResponse } from 'next/server';
import { getDiaryEntries,getDiaryEntriesAll, createDiaryEntry, updateDiaryEntry, deleteDiaryEntry } from '@/lib/db-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');

    if (projectId) {
      const entries = await getDiaryEntries(projectId);
      return NextResponse.json(entries);
    }

    const entries = await getDiaryEntriesAll();
    console.log(entries);
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching diary entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch diary entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const entry = await createDiaryEntry(data);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.log('Error creating diary entry:', error);
    return NextResponse.json(
      { error: 'Failed to create diary entry' },
      { status: 500 }
    );
  }
}
