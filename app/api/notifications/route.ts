import { NextRequest, NextResponse } from 'next/server';
import { createNotification, getNotifications, updateNotificationStatus } from '@/lib/db-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const notifications = await getNotifications({
      status: status || undefined,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const notification = await createNotification(data);
    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
