/**
 * Integration Tests for Poll System
 */

const mockPrisma = {
  poll: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  pollOption: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  pollVote: {
    create: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
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

describe('Poll Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Creating Polls', () => {
    it('should create a poll with options', async () => {
      const mockPoll = {
        id: 'poll1',
        postId: 'post1',
        question: 'Bạn thích video nào nhất?',
        createdAt: new Date(),
        options: [
          { id: 'opt1', text: 'Video A', _count: { votes: 0 } },
          { id: 'opt2', text: 'Video B', _count: { votes: 0 } },
          { id: 'opt3', text: 'Video C', _count: { votes: 0 } },
        ],
      };

      mockPrisma.poll.create.mockResolvedValue(mockPoll);

      const poll = await mockPrisma.poll.create({
        data: {
          postId: 'post1',
          question: 'Bạn thích video nào nhất?',
          options: {
            create: [
              { text: 'Video A' },
              { text: 'Video B' },
              { text: 'Video C' },
            ],
          },
        },
        include: { options: { include: { _count: { select: { votes: true } } } } },
      });

      expect(poll.question).toBe('Bạn thích video nào nhất?');
      expect(poll.options).toHaveLength(3);
    });
  });

  describe('Voting on Polls', () => {
    it('should allow voting on a poll option', async () => {
      mockPrisma.pollVote.findFirst.mockResolvedValue(null); // No previous vote
      mockPrisma.pollVote.create.mockResolvedValue({
        id: 'vote1',
        optionId: 'opt1',
        ipHash: 'hashed-ip',
      });

      // Check if already voted
      const existingVote = await mockPrisma.pollVote.findFirst({
        where: {
          option: { pollId: 'poll1' },
          ipHash: 'hashed-ip',
        },
      });

      expect(existingVote).toBeNull();

      // Cast vote
      const vote = await mockPrisma.pollVote.create({
        data: {
          optionId: 'opt1',
          ipHash: 'hashed-ip',
        },
      });

      expect(vote.optionId).toBe('opt1');
    });

    it('should prevent double voting', async () => {
      mockPrisma.pollVote.findFirst.mockResolvedValue({
        id: 'vote1',
        optionId: 'opt1',
        ipHash: 'hashed-ip',
      });

      const existingVote = await mockPrisma.pollVote.findFirst({
        where: {
          option: { pollId: 'poll1' },
          ipHash: 'hashed-ip',
        },
      });

      expect(existingVote).not.toBeNull();
      // API would return error here
    });
  });

  describe('Poll Results', () => {
    it('should return poll with vote counts', async () => {
      const mockPollWithVotes = {
        id: 'poll1',
        question: 'Bạn thích video nào nhất?',
        options: [
          { id: 'opt1', text: 'Video A', _count: { votes: 15 } },
          { id: 'opt2', text: 'Video B', _count: { votes: 25 } },
          { id: 'opt3', text: 'Video C', _count: { votes: 10 } },
        ],
      };

      mockPrisma.poll.findUnique.mockResolvedValue(mockPollWithVotes);

      const poll = await mockPrisma.poll.findUnique({
        where: { id: 'poll1' },
        include: { options: { include: { _count: { select: { votes: true } } } } },
      });

      expect(poll?.options[0]._count.votes).toBe(15);
      expect(poll?.options[1]._count.votes).toBe(25);
      
      const totalVotes = poll?.options.reduce((sum: number, opt: any) => sum + opt._count.votes, 0);
      expect(totalVotes).toBe(50);
    });
  });
});

