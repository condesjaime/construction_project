import {
  generateAccessToken,
  verifyRefreshToken,
} from '@/lib/auth/auth';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const refreshToken =
      body.refreshToken;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'NO_REFRESH_TOKEN' },
        { status: 401 }
      );
    }

    const decoded: any =
      verifyRefreshToken(refreshToken);

    const newAccessToken =
      generateAccessToken({
        userId: decoded.userId,
        email: decoded.email,
        status: 'active',
      });

    return NextResponse.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'INVALID_REFRESH_TOKEN' },
      { status: 401 }
    );
  }
}