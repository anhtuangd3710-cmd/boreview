import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { awardXP } from '@/lib/gamification';
import { withPublicRateLimit, withCacheHeaders } from '@/lib/api-middleware';

// Get today's start date (reset at midnight Vietnam time)
function getTodayStart(): Date {
  const now = new Date();
  // Vietnam is UTC+7
  const vietnamOffset = 7 * 60 * 60 * 1000;
  const vietnamNow = new Date(now.getTime() + vietnamOffset);
  vietnamNow.setUTCHours(0, 0, 0, 0);
  return new Date(vietnamNow.getTime() - vietnamOffset);
}

// GET daily tasks with progress (Public with rate limiting)
export const GET = withPublicRateLimit(
  async (request: NextRequest) => {
    const visitorId = request.headers.get('x-visitor-id');

    if (!visitorId) {
      return NextResponse.json({ error: 'Visitor ID required' }, { status: 401 });
    }

    const todayStart = getTodayStart();
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // Get all active daily tasks - only safe fields
    const tasks = await prisma.dailyTask.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        taskType: true,
        requirement: true,
        xpReward: true,
        icon: true,
        sortOrder: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Get user's progress for today
    const userProgress = await prisma.userDailyTask.findMany({
      where: {
        visitorId,
        date: { gte: todayStart, lt: tomorrowStart },
      },
    });

    // Merge tasks with progress
    const tasksWithProgress = tasks.map(task => {
      const progress = userProgress.find(p => p.taskId === task.id);
      return {
        name: task.name,
        description: task.description,
        taskType: task.taskType,
        requirement: task.requirement,
        xpReward: task.xpReward,
        icon: task.icon,
        progress: progress?.progress || 0,
        completed: progress?.completed || false,
        completedAt: progress?.completedAt,
        xpAwarded: progress?.xpAwarded || false,
      };
    });

    // Calculate bonus eligibility
    const completedCount = tasksWithProgress.filter(t => t.completed).length;
    const allCompleted = completedCount === tasks.length;
    const bonusAwarded = userProgress.some(p => p.xpAwarded && p.progress === -1); // Special marker for bonus

    const response = NextResponse.json({
      tasks: tasksWithProgress,
      summary: {
        total: tasks.length,
        completed: completedCount,
        allCompleted,
        bonusAwarded,
      },
    });

    // Short cache since daily tasks are personalized
    return withCacheHeaders(response, { maxAge: 10, staleWhileRevalidate: 30 });
  },
  { rateLimit: 'public' }
);

// POST to update task progress (Public with rate limiting)
export const POST = withPublicRateLimit(
  async (request: NextRequest) => {
    const visitorId = request.headers.get('x-visitor-id');

    if (!visitorId) {
      return NextResponse.json({ error: 'Visitor ID required' }, { status: 401 });
    }

    const { taskType, increment = 1 } = await request.json();
    const todayStart = getTodayStart();
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // Find matching tasks
    const matchingTasks = await prisma.dailyTask.findMany({
      where: { taskType, isActive: true },
    });

    const results = [];

    for (const task of matchingTasks) {
      // Get or create progress record
      let progress = await prisma.userDailyTask.findFirst({
        where: {
          visitorId,
          taskId: task.id,
          date: { gte: todayStart, lt: tomorrowStart },
        },
      });

      if (!progress) {
        progress = await prisma.userDailyTask.create({
          data: {
            visitorId,
            taskId: task.id,
            date: todayStart,
            progress: 0,
          },
        });
      }

      if (progress.completed) {
        results.push({ taskName: task.name, alreadyCompleted: true });
        continue;
      }

      // Update progress
      const newProgress = progress.progress + increment;
      const completed = newProgress >= task.requirement;

      let xpResult = null;
      if (completed && !progress.xpAwarded) {
        xpResult = await awardXP(visitorId, 'daily_task', undefined, task.xpReward);
      }

      await prisma.userDailyTask.update({
        where: { id: progress.id },
        data: {
          progress: newProgress,
          completed,
          completedAt: completed ? new Date() : null,
          xpAwarded: completed,
        },
      });

      results.push({
        taskName: task.name,
        progress: newProgress,
        target: task.requirement,
        completed,
        xpResult,
      });
    }

    return NextResponse.json({ success: true, results });
  },
  { rateLimit: 'public' }
);

