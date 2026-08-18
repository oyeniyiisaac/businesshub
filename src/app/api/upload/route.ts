import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Extend timeout duration for Next.js App Router (Vercel)
export const maxDuration = 60; // 60 seconds

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to base64 Data URI
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'image/jpeg';
    const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;

    // Upload directly using base64 string
    const uploadResult = await cloudinary.uploader.upload(base64Data, {
      folder: 'products',
      timeout: 60000, // 60s timeout limit for Cloudinary SDK call
    });

    console.log(uploadResult.secure_url);
    return NextResponse.json({ url: uploadResult.secure_url });
} catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Image upload failed' },
      { status: 500 }
    );
  }
}