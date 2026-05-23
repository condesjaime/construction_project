import { NextRequest, NextResponse } from 'next/server';
import { getTeams, getTeamsById, createTeam, updateTeam, deleteTeam} from '@/lib/db-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const teamId = searchParams.get('id');
    if (teamId) {
        const team = await getTeamsById(teamId);
        return NextResponse.json(team);
    }
    const teams = await getTeams();
    return NextResponse.json(teams);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const team = await createTeam(data);
    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id } = data;
    const team = await updateTeam(id, data);
    return NextResponse.json(team, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const teamId = searchParams.get('id');
    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    } else {
      await deleteTeam(teamId);
      return NextResponse.json(
        { message: 'Team deleted successfully' },
        { status: 200 }
      );
    }
    } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete team' },
      { status: 500 }
    );
  }
}