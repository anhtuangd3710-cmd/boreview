// ============================================
// ADMIN IMAGE UPLOAD API
// Secure image upload with Supabase Storage
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getClientIP, hashIP, isIPBanned, checkRateLimit } from '@/lib/security';
import {
  supabaseAdmin,
  STORAGE_BUCKET,
  MAX_FILE_SIZE,
  isValidImageType,
  getFileExtension,
  getPublicImageUrl,
  isSupabaseConfigured,
} from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // 1. Check session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    // 2. Check admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // 3. Check IP ban
    const clientIP = getClientIP(request);
    const ipHash = hashIP(clientIP);
    const banned = await isIPBanned(ipHash);
    if (banned) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // 4. Rate limiting (10 uploads per minute)
    const { allowed } = await checkRateLimit(ipHash, 'upload');
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many uploads. Please try again later.' },
        { status: 429 }
      );
    }

    // 5. Check if Supabase is configured
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      return NextResponse.json(
        { error: 'Storage service not configured' },
        { status: 503 }
      );
    }

    // 6. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 7. Validate file type
    if (!isValidImageType(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PNG, JPG, JPEG, WEBP' },
        { status: 400 }
      );
    }

    // 8. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 2MB' },
        { status: 400 }
      );
    }

    // 9. Generate unique filename with UUID
    const extension = getFileExtension(file.type);
    const filename = `${uuidv4()}.${extension}`;
    const filePath = `uploads/${filename}`;

    // 10. Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 11. Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      );
    }

    // 12. Get public URL
    const publicUrl = getPublicImageUrl(data.path);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: data.path,
      filename,
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

