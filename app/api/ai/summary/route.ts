import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '@/lib/prisma';
import { hashIP, getClientIP, checkRateLimit } from '@/lib/security';

// Generate TL;DR summary for an article
export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const clientIP = getClientIP(request);
    const ipHash = hashIP(clientIP);

    // Check rate limit
    const rateLimit = await checkRateLimit(ipHash, 'ai');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Quá nhiều yêu cầu AI. Vui lòng chờ vài phút.' },
        { status: 429 }
      );
    }

    // Get post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, content: true, aiSummary: true, aiSummaryAt: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Không tìm thấy bài viết' }, { status: 404 });
    }

    // Check if we have a cached summary (less than 7 days old)
    if (post.aiSummary && post.aiSummaryAt) {
      const cacheAge = Date.now() - new Date(post.aiSummaryAt).getTime();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (cacheAge < sevenDays) {
        return NextResponse.json({ summary: post.aiSummary, cached: true });
      }
    }

    // Check if Gemini API key is configured
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      // Return a simple extractive summary if no API key
      const summary = generateSimpleSummary(post.content);
      return NextResponse.json({ summary, cached: false, simple: true });
    }

    // Generate summary using Google Gemini
    const textContent = post.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Bạn là một trợ lý hữu ích chuyên tạo tóm tắt TL;DR ngắn gọn.
Hãy tạo chính xác 5 điểm tóm tắt các ý chính của bài viết bằng tiếng Việt.
Mỗi điểm nên là một câu. Không thêm phần giới thiệu hoặc kết luận.
Sử dụng ký hiệu • cho mỗi điểm.

Bài viết cần tóm tắt:

${textContent.slice(0, 4000)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text() || generateSimpleSummary(post.content);

    // Cache the summary
    await prisma.post.update({
      where: { id: postId },
      data: { aiSummary: summary, aiSummaryAt: new Date() },
    });

    return NextResponse.json({ summary, cached: false });
  } catch (error) {
    console.error('AI summary error:', error);
    return NextResponse.json({ error: 'Không thể tạo tóm tắt' }, { status: 500 });
  }
}

// Simple extractive summary when AI is not available
function generateSimpleSummary(content: string): string {
  const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  const keyPoints = sentences.slice(0, 5).map(s => `• ${s.trim()}`);
  
  if (keyPoints.length < 5) {
    return keyPoints.join('\n') || '• This article provides valuable insights on the topic.';
  }
  
  return keyPoints.join('\n');
}

