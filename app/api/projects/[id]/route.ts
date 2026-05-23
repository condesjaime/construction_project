import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, updateProject } from '@/lib/db-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {id} = await params;
    const project = await getProjectById(id);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('GET PROJECT ERROR:', error);

    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const data = await request.json();

    const project = await updateProject(id, data);

    return NextResponse.json(project);
  } catch (error) {
    console.error('UPDATE PROJECT ERROR:', error);

    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}