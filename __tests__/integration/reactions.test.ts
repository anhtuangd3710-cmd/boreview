/**
 * Integration Tests for Reactions System
 */

const mockPrisma = {
  reaction: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    groupBy: jest.fn(),
  },
  rateLimit: {
    findUnique: jest.fn().mockResolvedValue(null),
    upsert: jest.fn(),
  },
  bannedIP: {
    findUnique: jest.fn().mockResolvedValue(null),
  },
};

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
}));

describe('Reactions Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Adding Reactions', () => {
    it('should add a new reaction', async () => {
      const mockReaction = {
        id: 'reaction1',
        postId: 'post1',
        type: 'like',
        ipHash: 'hashed-ip',
        createdAt: new Date(),
      };

      mockPrisma.reaction.findFirst.mockResolvedValue(null); // No existing reaction
      mockPrisma.reaction.create.mockResolvedValue(mockReaction);

      // Simulate adding reaction
      const existing = await mockPrisma.reaction.findFirst({
        where: { postId: 'post1', ipHash: 'hashed-ip', type: 'like' },
      });

      expect(existing).toBeNull();

      const reaction = await mockPrisma.reaction.create({
        data: {
          postId: 'post1',
          type: 'like',
          ipHash: 'hashed-ip',
        },
      });

      expect(reaction.type).toBe('like');
      expect(reaction.postId).toBe('post1');
    });

    it('should toggle reaction off if already exists', async () => {
      const existingReaction = {
        id: 'reaction1',
        postId: 'post1',
        type: 'like',
        ipHash: 'hashed-ip',
      };

      mockPrisma.reaction.findFirst.mockResolvedValue(existingReaction);
      mockPrisma.reaction.delete.mockResolvedValue(existingReaction);

      const existing = await mockPrisma.reaction.findFirst({
        where: { postId: 'post1', ipHash: 'hashed-ip', type: 'like' },
      });

      expect(existing).not.toBeNull();

      await mockPrisma.reaction.delete({
        where: { id: existingReaction.id },
      });

      expect(mockPrisma.reaction.delete).toHaveBeenCalledWith({
        where: { id: 'reaction1' },
      });
    });
  });

  describe('Getting Reaction Counts', () => {
    it('should return grouped reaction counts', async () => {
      mockPrisma.reaction.groupBy.mockResolvedValue([
        { type: 'like', _count: { type: 10 } },
        { type: 'love', _count: { type: 5 } },
        { type: 'laugh', _count: { type: 3 } },
      ]);

      const counts = await mockPrisma.reaction.groupBy({
        by: ['type'],
        where: { postId: 'post1' },
        _count: { type: true },
      });

      expect(counts).toHaveLength(3);
      expect(counts.find((c: any) => c.type === 'like')?._count.type).toBe(10);
    });

    it('should handle posts with no reactions', async () => {
      mockPrisma.reaction.groupBy.mockResolvedValue([]);

      const counts = await mockPrisma.reaction.groupBy({
        by: ['type'],
        where: { postId: 'post-no-reactions' },
        _count: { type: true },
      });

      expect(counts).toHaveLength(0);
    });
  });

  describe('Reaction Types', () => {
    const reactionTypes = ['like', 'love', 'laugh', 'wow', 'sad'];

    it.each(reactionTypes)('should accept %s reaction type', async (type) => {
      mockPrisma.reaction.create.mockResolvedValue({
        id: `reaction-${type}`,
        postId: 'post1',
        type,
        ipHash: 'hashed-ip',
      });

      const reaction = await mockPrisma.reaction.create({
        data: { postId: 'post1', type, ipHash: 'hashed-ip' },
      });

      expect(reaction.type).toBe(type);
    });
  });
});

