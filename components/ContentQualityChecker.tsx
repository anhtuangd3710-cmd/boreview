'use client';

import { useMemo } from 'react';

interface ContentQualityCheckerProps {
  content: string;
  excerpt: string;
  title: string;
}

interface QualityIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
}

export default function ContentQualityChecker({ content, excerpt, title }: ContentQualityCheckerProps) {
  const issues = useMemo(() => {
    const result: QualityIssue[] = [];
    
    // Strip HTML tags for word count
    const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length;
    
    // Word count check (AdSense requires substantial content)
    if (wordCount < 300) {
      result.push({
        type: 'error',
        message: `Nội dung quá ngắn (${wordCount} từ). AdSense yêu cầu ít nhất 600+ từ để được phê duyệt.`,
      });
    } else if (wordCount < 600) {
      result.push({
        type: 'warning',
        message: `Nội dung có ${wordCount} từ. Nên thêm nội dung (khuyến nghị 600+ từ cho AdSense).`,
      });
    } else {
      result.push({
        type: 'info',
        message: `Nội dung có ${wordCount} từ. ✓`,
      });
    }

    // Check for excerpt/meta description
    if (!excerpt || excerpt.length < 50) {
      result.push({
        type: 'warning',
        message: 'Mô tả ngắn quá ngắn. Mô tả meta tốt nên có 120-160 ký tự.',
      });
    } else if (excerpt.length > 160) {
      result.push({
        type: 'warning',
        message: 'Mô tả ngắn quá dài (trên 160 ký tự). Có thể bị cắt ngắn trong kết quả tìm kiếm.',
      });
    }

    // Check title length
    if (title.length < 20) {
      result.push({
        type: 'warning',
        message: 'Tiêu đề quá ngắn. Nên có tiêu đề mô tả chi tiết hơn.',
      });
    } else if (title.length > 60) {
      result.push({
        type: 'warning',
        message: 'Tiêu đề quá 60 ký tự. Có thể bị cắt ngắn trong kết quả tìm kiếm.',
      });
    }

    // Check for too many links (potential spam indicator)
    const linkCount = (content.match(/<a\s/gi) || []).length;
    if (linkCount > 10) {
      result.push({
        type: 'warning',
        message: `Nội dung có ${linkCount} liên kết. Quá nhiều liên kết có thể bị AdSense đánh giá là spam.`,
      });
    }

    // Check for images
    const imageCount = (content.match(/<img\s/gi) || []).length;
    if (imageCount === 0 && wordCount > 300) {
      result.push({
        type: 'info',
        message: 'Nên thêm hình ảnh để tăng sự hấp dẫn cho người đọc.',
      });
    }

    // Check for headings
    const headingCount = (content.match(/<h[1-6]/gi) || []).length;
    if (wordCount > 500 && headingCount < 2) {
      result.push({
        type: 'info',
        message: 'Nên thêm các tiêu đề để cấu trúc nội dung tốt hơn.',
      });
    }

    return result;
  }, [content, excerpt, title]);

  const hasErrors = issues.some(i => i.type === 'error');
  const hasWarnings = issues.some(i => i.type === 'warning');

  if (issues.length === 0) return null;

  return (
    <div className={`rounded-xl p-4 ${
      hasErrors ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
      hasWarnings ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' :
      'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
    }`}>
      <h4 className={`font-medium mb-3 ${
        hasErrors ? 'text-red-700 dark:text-red-300' :
        hasWarnings ? 'text-yellow-700 dark:text-yellow-300' :
        'text-green-700 dark:text-green-300'
      }`}>
        📊 Kiểm tra chất lượng nội dung
      </h4>
      <ul className="space-y-2">
        {issues.map((issue, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <span>
              {issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : '✅'}
            </span>
            <span className={
              issue.type === 'error' ? 'text-red-700 dark:text-red-300' :
              issue.type === 'warning' ? 'text-yellow-700 dark:text-yellow-300' :
              'text-green-700 dark:text-green-300'
            }>
              {issue.message}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

