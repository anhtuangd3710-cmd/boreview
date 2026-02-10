import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '@/lib/prisma';
import { aiQuestionSchema } from '@/lib/validation';
import { hashIP, getClientIP, checkRateLimit, containsProfanity } from '@/lib/security';

// AI Q&A for an article
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = aiQuestionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { question, postId } = validation.data;
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

    // Check for profanity
    if (containsProfanity(question)) {
      return NextResponse.json({ error: 'Câu hỏi không phù hợp' }, { status: 400 });
    }

    // Get post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, title: true, content: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Không tìm thấy bài viết' }, { status: 404 });
    }

    // Check if Gemini API key is configured
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        answer: 'AI Q&A chưa được cấu hình. Vui lòng đọc bài viết để biết thêm thông tin.',
        available: false,
      });
    }

    const textContent = post.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    // Generate answer using Google Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const prompt = `Bạn là một trợ lý hữu ích trả lời câu hỏi về một bài viết cụ thể.
QUY TẮC QUAN TRỌNG:
1. Chỉ trả lời dựa trên nội dung bài viết được cung cấp
2. Nếu câu hỏi không thể trả lời từ bài viết, hãy nói "Thông tin này không có trong bài viết."
3. Không bịa đặt thông tin hoặc sử dụng kiến thức bên ngoài
4. Giữ câu trả lời ngắn gọn (tối đa 2-3 câu)
5. Hữu ích và chính xác
6. Trả lời bằng tiếng Việt

Tiêu đề bài viết: ${post.title}
Nội dung bài viết: ${textContent.slice(0, 6000)}

Câu hỏi của người dùng: ${question}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text() || 'Không thể tạo câu trả lời.';

    return NextResponse.json({ answer, available: true });
  } catch (error) {
    console.error('AI Q&A error:', error);
    return NextResponse.json({ error: 'Không thể xử lý câu hỏi' }, { status: 500 });
  }
}

