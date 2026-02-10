import { z } from 'zod';

// Comment validation
export const commentSchema = z.object({
  content: z
    .string()
    .min(3, 'Comment must be at least 3 characters')
    .max(1000, 'Comment must be less than 1000 characters'),
  authorName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  postId: z.string().min(1, 'Post ID is required'),
  recaptchaToken: z.string().optional(),
});

// Reaction validation
export const reactionSchema = z.object({
  type: z.enum(['like', 'love', 'laugh', 'wow', 'sad']),
  postId: z.string().min(1, 'Post ID is required'),
});

// Poll vote validation
export const pollVoteSchema = z.object({
  optionId: z.string().min(1, 'Option ID is required'),
});

// Poll creation validation
export const pollSchema = z.object({
  question: z
    .string()
    .min(5, 'Question must be at least 5 characters')
    .max(200, 'Question must be less than 200 characters'),
  options: z
    .array(z.string().min(1).max(100))
    .min(2, 'At least 2 options required')
    .max(6, 'Maximum 6 options allowed'),
  postId: z.string().min(1, 'Post ID is required'),
});

// Search validation
export const searchSchema = z.object({
  query: z
    .string()
    .min(2, 'Search query must be at least 2 characters')
    .max(100, 'Search query must be less than 100 characters'),
});

// AI Q&A validation
export const aiQuestionSchema = z.object({
  question: z
    .string()
    .min(5, 'Question must be at least 5 characters')
    .max(500, 'Question must be less than 500 characters'),
  postId: z.string().min(1, 'Post ID is required'),
});

// Post validation with content quality checks
export const postSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must be less than 100 characters'),
  excerpt: z
    .string()
    .min(50, 'Excerpt must be at least 50 characters')
    .max(300, 'Excerpt must be less than 300 characters'),
  content: z.string().min(1, 'Content is required'),
  youtubeUrl: z.string().url().optional().nullable(),
  thumbnail: z.string().url().optional().nullable(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  categories: z.array(z.string()).optional(),
});

// Content quality validation
export function validateContentQuality(content: string): {
  valid: boolean;
  warnings: string[];
  wordCount: number;
} {
  const warnings: string[] = [];
  
  // Strip HTML tags for word count
  const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textContent.split(' ').filter(w => w.length > 0).length;

  if (wordCount < 600) {
    warnings.push(`Content has only ${wordCount} words. Minimum 600 words recommended for AdSense.`);
  }

  if (wordCount < 300) {
    return { valid: false, warnings, wordCount };
  }

  // Check for missing meta description (excerpt)
  if (textContent.length < 100) {
    warnings.push('Content is very short. Consider adding more detail.');
  }

  // Check for too many links (potential spam)
  const linkCount = (content.match(/<a /gi) || []).length;
  if (linkCount > 10) {
    warnings.push(`Content has ${linkCount} links. Too many links may affect SEO.`);
  }

  return { valid: true, warnings, wordCount };
}

// Simple duplicate content check using similarity
export function checkDuplicateContent(newContent: string, existingContents: string[]): {
  isDuplicate: boolean;
  similarity: number;
  matchedIndex: number;
} {
  const newWords = new Set(newContent.toLowerCase().replace(/<[^>]*>/g, '').split(/\s+/));
  
  let maxSimilarity = 0;
  let matchedIndex = -1;

  existingContents.forEach((existing, index) => {
    const existingWords = new Set(existing.toLowerCase().replace(/<[^>]*>/g, '').split(/\s+/));
    const intersection = Array.from(newWords).filter(w => existingWords.has(w)).length;
    const union = new Set(Array.from(newWords).concat(Array.from(existingWords))).size;
    const similarity = intersection / union;

    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      matchedIndex = index;
    }
  });

  return {
    isDuplicate: maxSimilarity > 0.7, // 70% similarity threshold
    similarity: Math.round(maxSimilarity * 100),
    matchedIndex,
  };
}

