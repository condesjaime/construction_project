import { NextRequest, NextResponse } from 'next/server';
import { getProjects, createProject, updateProject } from '@/lib/db-service';

export async function GET() {
  try {
    const projects = await getProjects();
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {

  try {
    const data = await request.json();
    console.log('📦 Received request to create project:', data);
    const project = await createProject(data);
    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
      console.error('❌ FULL PROJECT ERROR:', error);
      console.error('❌ ERROR MESSAGE:', error.message);
      console.error('❌ ERROR CAUSE:', error.cause);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
