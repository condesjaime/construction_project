import { NextResponse } from 'next/server';
import { createUser } from '@/lib/db-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await createUser(body);
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