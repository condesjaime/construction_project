import { NextResponse } from 'next/server';
import { loginUser } from '@/lib/db-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await loginUser(
      body.email,
      body.password
    );
     console.log(result);
    return NextResponse.json(result);
    
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 401,
      }
    );
  }
}