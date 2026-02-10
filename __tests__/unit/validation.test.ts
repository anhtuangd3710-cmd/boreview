import { commentSchema, postSchema, reactionSchema, pollVoteSchema } from '@/lib/validation';

describe('Validation - commentSchema', () => {
  it('should validate valid comment', () => {
    const validComment = {
      postId: 'abc123',
      authorName: 'Nguyễn Văn A',
      content: 'Đây là một bình luận hợp lệ',
    };
    expect(() => commentSchema.parse(validComment)).not.toThrow();
  });

  it('should reject empty author name', () => {
    const invalidComment = {
      postId: 'abc123',
      authorName: '',
      content: 'Valid content',
    };
    expect(() => commentSchema.parse(invalidComment)).toThrow();
  });

  it('should reject short content', () => {
    const invalidComment = {
      postId: 'abc123',
      authorName: 'Test User',
      content: 'ab',
    };
    expect(() => commentSchema.parse(invalidComment)).toThrow();
  });

  it('should reject content over 1000 characters', () => {
    const invalidComment = {
      postId: 'abc123',
      authorName: 'Test User',
      content: 'a'.repeat(1001),
    };
    expect(() => commentSchema.parse(invalidComment)).toThrow();
  });

  it('should reject missing postId', () => {
    const invalidComment = {
      authorName: 'Test User',
      content: 'Valid content',
    };
    expect(() => commentSchema.parse(invalidComment)).toThrow();
  });
});

describe('Validation - reactionSchema', () => {
  it('should validate valid reaction', () => {
    const validReaction = {
      postId: 'abc123',
      type: 'like',
    };
    expect(() => reactionSchema.parse(validReaction)).not.toThrow();
  });

  it('should accept all valid reaction types', () => {
    const types = ['like', 'love', 'laugh', 'wow', 'sad'];
    types.forEach((type) => {
      expect(() => reactionSchema.parse({ postId: 'abc123', type })).not.toThrow();
    });
  });

  it('should reject invalid reaction type', () => {
    const invalidReaction = {
      postId: 'abc123',
      type: 'invalid',
    };
    expect(() => reactionSchema.parse(invalidReaction)).toThrow();
  });
});

describe('Validation - pollVoteSchema', () => {
  it('should validate valid poll vote', () => {
    const validVote = {
      optionId: 'option123',
    };
    expect(() => pollVoteSchema.parse(validVote)).not.toThrow();
  });

  it('should reject empty optionId', () => {
    const invalidVote = {
      optionId: '',
    };
    expect(() => pollVoteSchema.parse(invalidVote)).toThrow();
  });

  it('should reject missing optionId', () => {
    const invalidVote = {};
    expect(() => pollVoteSchema.parse(invalidVote)).toThrow();
  });
});

describe('Validation - postSchema', () => {
  it('should validate valid post', () => {
    const validPost = {
      title: 'Tiêu đề bài viết đầy đủ',
      content: 'Nội dung bài viết đầy đủ với nhiều từ để đạt yêu cầu tối thiểu',
      excerpt: 'Mô tả ngắn gọn về bài viết với đầy đủ thông tin cần thiết để đạt yêu cầu tối thiểu 50 ký tự.',
    };
    expect(() => postSchema.parse(validPost)).not.toThrow();
  });

  it('should reject short title', () => {
    const invalidPost = {
      title: 'Short',
      content: 'Valid content here',
      excerpt: 'Mô tả ngắn gọn về bài viết với đầy đủ thông tin cần thiết để đạt yêu cầu tối thiểu 50 ký tự.',
    };
    expect(() => postSchema.parse(invalidPost)).toThrow();
  });

  it('should reject short excerpt', () => {
    const invalidPost = {
      title: 'Valid Title Here Long Enough',
      content: 'Valid content here',
      excerpt: 'Too short',
    };
    expect(() => postSchema.parse(invalidPost)).toThrow();
  });
});

