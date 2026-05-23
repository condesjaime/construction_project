import { NextRequest, NextResponse } from 'next/server';
import { updateNotificationStatus } from '@/lib/db-service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const data = await request.json();
    const { status, failureReason } = data;

    if (!['sent', 'failed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const notification = await updateNotificationStatus(
      id,
      status,
      failureReason
    );

    return NextResponse.json(notification);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}