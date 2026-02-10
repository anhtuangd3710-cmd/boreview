import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || 'Admin123!',
    12
  );

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@example.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  console.log('Created admin user:', admin.email);

  // Create default categories for Bơ Review
  const categories = [
    { name: 'Phim & Drama', slug: 'phim-drama' },
    { name: 'Anime & Hoạt Hình', slug: 'anime-hoat-hinh' },
    { name: 'Tâm Lý & Kinh Dị', slug: 'tam-ly-kinh-di' },
    { name: 'Hài Hước', slug: 'hai-huoc' },
    { name: 'Review Hot', slug: 'review-hot' },
    { name: 'Tổng Hợp', slug: 'tong-hop' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
  }

  console.log('Created default categories');

  // Create sample post in Vietnamese
  const samplePost = await prisma.post.upsert({
    where: { slug: 'chao-mung-den-bo-review' },
    update: {},
    create: {
      title: 'Chào mừng đến Bơ Review',
      slug: 'chao-mung-den-bo-review',
      excerpt: 'Đây là bài viết đầu tiên trên website Bơ Review. Chúng tôi rất vui được chia sẻ những bài tóm tắt và phân tích video thú vị từ kênh YouTube Bơ Review.',
      content: `<h2>Chào mừng đến Bơ Review!</h2>
<p>Chúng tôi rất vui mừng ra mắt website chính thức của kênh <strong>Bơ Review</strong> - nơi tổng hợp những bài tóm tắt, phân tích và bình luận video từ kênh YouTube của chúng tôi.</p>
<h3>Nội dung bạn sẽ tìm thấy</h3>
<p>Website sẽ cung cấp:</p>
<ul>
<li><strong>Tóm tắt phim & drama</strong> - Những bản review ngắn gọn, súc tích về các bộ phim hot</li>
<li><strong>Phân tích anime</strong> - Đánh giá chi tiết các bộ anime đang được yêu thích</li>
<li><strong>Review video hot</strong> - Bình luận về những video viral trên mạng</li>
<li><strong>Góc nhìn độc đáo</strong> - Những quan điểm và phân tích riêng của Bơ Review</li>
</ul>
<h3>Cam kết của chúng tôi</h3>
<p>Chúng tôi cam kết mang đến nội dung chất lượng, thú vị và bổ ích cho cộng đồng. Mọi bài viết đều được biên soạn cẩn thận dựa trên video từ kênh YouTube chính thức.</p>
<p>Cảm ơn bạn đã là một phần của cộng đồng Bơ Review!</p>
<p>Hãy theo dõi để không bỏ lỡ những nội dung hấp dẫn sắp tới nhé! 🎬</p>`,
      published: true,
      featured: true,
      publishedAt: new Date(),
      authorId: admin.id,
    },
  });

  console.log('Created sample post:', samplePost.title);

  // Create Daily Tasks
  const dailyTasks = [
    {
      name: 'Đọc 1 bài viết',
      description: 'Đọc ít nhất 1 bài viết hôm nay',
      icon: '📖',
      taskType: 'read',
      requirement: 1,
      xpReward: 10,
      sortOrder: 1,
    },
    {
      name: 'Thả cảm xúc',
      description: 'React 1 lần cho bất kỳ bài viết nào',
      icon: '❤️',
      taskType: 'react',
      requirement: 1,
      xpReward: 5,
      sortOrder: 2,
    },
    {
      name: 'Bình luận',
      description: 'Viết 1 bình luận về bài viết',
      icon: '💬',
      taskType: 'comment',
      requirement: 1,
      xpReward: 15,
      sortOrder: 3,
    },
    {
      name: 'Khám phá',
      description: 'Đọc bài viết từ 2 chuyên mục khác nhau',
      icon: '🔍',
      taskType: 'explore',
      requirement: 2,
      xpReward: 20,
      sortOrder: 4,
    },
  ];

  // Delete existing daily tasks and recreate
  await prisma.dailyTask.deleteMany({});
  for (const task of dailyTasks) {
    await prisma.dailyTask.create({ data: task });
  }
  console.log('Created daily tasks');

  // Create Badges
  const badges = [
    // Category Badges
    {
      name: 'Mọt Phim',
      slug: 'mot-phim',
      description: 'Đọc 10 bài review phim & drama',
      icon: '🎬',
      category: 'category',
      rarity: 'common',
      requirement: JSON.stringify({ type: 'read_category', category: 'phim-drama', count: 10 }),
      xpReward: 50,
    },
    {
      name: 'Otaku Chân Chính',
      slug: 'otaku-chan-chinh',
      description: 'Đọc 20 bài review anime',
      icon: '🎌',
      category: 'category',
      rarity: 'rare',
      requirement: JSON.stringify({ type: 'read_category', category: 'anime-hoat-hinh', count: 20 }),
      xpReward: 100,
    },
    {
      name: 'Tâm Hồn Can Đảm',
      slug: 'tam-hon-can-dam',
      description: 'Đọc 10 bài tâm lý & kinh dị',
      icon: '👻',
      category: 'category',
      rarity: 'rare',
      requirement: JSON.stringify({ type: 'read_category', category: 'tam-ly-kinh-di', count: 10 }),
      xpReward: 75,
    },

    // Engagement Badges
    {
      name: 'Người Mới',
      slug: 'nguoi-moi',
      description: 'Tạo tài khoản thành công',
      icon: '🌟',
      category: 'engagement',
      rarity: 'common',
      requirement: JSON.stringify({ type: 'signup' }),
      xpReward: 25,
    },
    {
      name: 'Bình Luận Gia',
      slug: 'binh-luan-gia',
      description: 'Viết 10 bình luận',
      icon: '💬',
      category: 'engagement',
      rarity: 'common',
      requirement: JSON.stringify({ type: 'comment_count', count: 10 }),
      xpReward: 50,
    },
    {
      name: 'Người Hào Phóng',
      slug: 'nguoi-hao-phong',
      description: 'Thả 50 reactions',
      icon: '❤️',
      category: 'engagement',
      rarity: 'common',
      requirement: JSON.stringify({ type: 'react_count', count: 50 }),
      xpReward: 50,
    },
    {
      name: 'Độc Giả Siêng Năng',
      slug: 'doc-gia-sieng-nang',
      description: 'Đọc 50 bài viết',
      icon: '📚',
      category: 'engagement',
      rarity: 'rare',
      requirement: JSON.stringify({ type: 'read_count', count: 50 }),
      xpReward: 100,
    },

    // Streak Badges (slug format: streak-{days})
    {
      name: 'Bắt Đầu Hành Trình',
      slug: 'streak-3',
      description: 'Duy trì streak 3 ngày',
      icon: '🔥',
      category: 'streak',
      rarity: 'common',
      requirement: JSON.stringify({ type: 'streak', days: 3 }),
      xpReward: 30,
    },
    {
      name: 'Một Tuần Không Nghỉ',
      slug: 'streak-7',
      description: 'Duy trì streak 7 ngày',
      icon: '⚡',
      category: 'streak',
      rarity: 'rare',
      requirement: JSON.stringify({ type: 'streak', days: 7 }),
      xpReward: 75,
    },
    {
      name: 'Hai Tuần Liền',
      slug: 'streak-14',
      description: 'Duy trì streak 14 ngày',
      icon: '✨',
      category: 'streak',
      rarity: 'rare',
      requirement: JSON.stringify({ type: 'streak', days: 14 }),
      xpReward: 100,
    },
    {
      name: 'Kiên Trì Một Tháng',
      slug: 'streak-30',
      description: 'Duy trì streak 30 ngày',
      icon: '💪',
      category: 'streak',
      rarity: 'epic',
      requirement: JSON.stringify({ type: 'streak', days: 30 }),
      xpReward: 200,
    },
    {
      name: 'Bền Bỉ 60 Ngày',
      slug: 'streak-60',
      description: 'Duy trì streak 60 ngày',
      icon: '🌟',
      category: 'streak',
      rarity: 'epic',
      requirement: JSON.stringify({ type: 'streak', days: 60 }),
      xpReward: 300,
    },
    {
      name: 'Huyền Thoại',
      slug: 'streak-100',
      description: 'Duy trì streak 100 ngày',
      icon: '👑',
      category: 'streak',
      rarity: 'legendary',
      requirement: JSON.stringify({ type: 'streak', days: 100 }),
      xpReward: 500,
    },
    {
      name: 'Một Năm Không Nghỉ',
      slug: 'streak-365',
      description: 'Duy trì streak 365 ngày',
      icon: '🏆',
      category: 'streak',
      rarity: 'legendary',
      requirement: JSON.stringify({ type: 'streak', days: 365 }),
      xpReward: 1000,
    },

    // Special Badges
    {
      name: 'Early Bird',
      slug: 'early-bird',
      description: 'Một trong 100 thành viên đầu tiên',
      icon: '🐣',
      category: 'special',
      rarity: 'legendary',
      requirement: JSON.stringify({ type: 'early_adopter', count: 100 }),
      xpReward: 300,
    },
    {
      name: 'Vua Bình Luận Tuần',
      slug: 'vua-binh-luan-tuan',
      description: 'Top 1 bình luận trong tuần',
      icon: '🏆',
      category: 'special',
      rarity: 'epic',
      requirement: JSON.stringify({ type: 'weekly_top', category: 'comments', rank: 1 }),
      xpReward: 150,
    },
    {
      name: 'Level 10',
      slug: 'level-10',
      description: 'Đạt level 10',
      icon: '🎖️',
      category: 'special',
      rarity: 'rare',
      requirement: JSON.stringify({ type: 'level', level: 10 }),
      xpReward: 100,
    },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: badge,
      create: badge,
    });
  }
  console.log('Created badges');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

