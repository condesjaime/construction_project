import { NextRequest, NextResponse } from 'next/server';
import { getProjects } from '@/lib/db-service';
import { getCached, setCached, invalidatePattern } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const cacheKey = 'projects:all';
    
    // Try to get from cache first
    const cachedProjects = await getCached(cacheKey);
    if (cachedProjects) {
      return NextResponse.json(
        { data: cachedProjects, source: 'cache' },
        { status: 200 }
      );
    }

    // If not in cache, fetch from database
    const projects = await getProjects();
    
    // Cache the result for 1 hour (3600 seconds)
    await setCached(cacheKey, projects, 3600);

    return NextResponse.json(
      { data: projects, source: 'database' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Create project (existing logic would go here)
    // const project = await createProject(data);

    // Invalidate projects cache
    await invalidatePattern('projects:*');

    return NextResponse.json(
      { message: 'Project created and cache invalidated' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
