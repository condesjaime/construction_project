// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  S3Client,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.NEXT_PUBLIC_S3_REGION || 'us-east-1',
  endpoint: process.env.NEXT_PUBLIC_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY!,
    secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_KEY!,
  },
  forcePathStyle: true,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No files uploaded',
        },
        { status: 400 }
      );
    }

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const extension = file.name.split('.').pop();

        const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;

        // Optional folder organization
        const key = fileName;

        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET!,
            Key: key,
            Body: buffer,
            ContentType: file.type,
          })
        );

        // Public file URL
        const fileUrl = `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL}/${process.env.NEXT_PUBLIC_S3_BUCKET}/${key}`;

        return {
          name: file.name,
          type: file.type,
          size: file.size,
          url: fileUrl,
          key,
        };
      })
    );

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('UPLOAD ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Upload failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}