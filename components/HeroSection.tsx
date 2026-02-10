'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      aria-label="Hero section"
    >
      {/* Background decorations - Improved with softer, larger gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-primary-200/40 to-primary-300/20 dark:from-primary-900/30 dark:to-primary-800/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-accent-200/40 to-accent-300/20 dark:from-accent-900/30 dark:to-accent-800/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-yellow-200/25 dark:bg-yellow-900/15 rounded-full blur-3xl" />
      </div>

      {/* Main container with more generous padding */}
      <div className="container mx-auto py-20 md:py-28 lg:py-36 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
          {/* Left content - Improved spacing and hierarchy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="flex-1 text-center lg:text-left max-w-2xl lg:max-w-none"
          >
            {/* Badge - More prominent */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full shadow-lg shadow-gray-200/50 dark:shadow-gray-900/30 mb-8"
            >
              <span className="text-2xl" role="img" aria-label="Video">🎬</span>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 tracking-wide">
                Tóm tắt video hay mỗi ngày
              </span>
            </motion.div>

            {/* Headline - Better typography and spacing */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight leading-[1.1]">
              <span className="text-gray-900 dark:text-white block sm:inline">Chào mừng đến </span>
              <span className="bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 bg-clip-text text-transparent">
                Bơ Review
              </span>
            </h1>

            {/* Subheadline - Improved readability */}
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-6 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Website chuyên <strong className="text-primary-600 dark:text-primary-400 font-semibold">tóm tắt & phân tích</strong> nội dung video thú vị từ kênh Bơ Review
            </p>
            <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Nơi tổng hợp những câu chuyện hay, review và góc nhìn độc đáo. Cộng đồng chia sẻ & bình luận các video hot trên mạng.
            </p>

            {/* CTA Buttons - Improved sizing and spacing */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center lg:justify-start">
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-3 px-8 py-4 md:px-10 md:py-5 bg-gradient-to-r from-primary-500 to-primary-600
                    text-white font-semibold text-base md:text-lg rounded-2xl shadow-xl shadow-primary-500/25
                    hover:shadow-2xl hover:shadow-primary-500/35 transition-all duration-300
                    focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  <span role="img" aria-label="Book">📖</span>
                  <span>Khám phá bài viết</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <a
                  href="https://www.youtube.com/@BoRiViu67"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 md:px-10 md:py-5 bg-white dark:bg-gray-800
                    text-gray-900 dark:text-white font-semibold text-base md:text-lg rounded-2xl
                    border-2 border-gray-200 dark:border-gray-700
                    shadow-lg shadow-gray-200/50 dark:shadow-gray-900/30
                    hover:border-red-500 hover:text-red-600 dark:hover:text-red-400
                    hover:shadow-xl transition-all duration-300
                    focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                >
                  <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>Xem YouTube</span>
                </a>
              </motion.div>
            </div>

            {/* Stats - Improved visual hierarchy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex items-center justify-center lg:justify-start gap-10 md:gap-14 mt-14 pt-10 border-t border-gray-200/80 dark:border-gray-700/50"
            >
              {[
                { value: '100+', label: 'Bài viết', icon: '📝' },
                { value: '50K+', label: 'Lượt xem', icon: '👀' },
                { value: '1K+', label: 'Cộng đồng', icon: '❤️' },
              ].map((stat) => (
                <div key={stat.label} className="text-center group">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Mascot/Logo - Improved presentation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="flex-1 flex justify-center lg:justify-end"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              {/* Softer glow effect behind logo */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-primary-400/40 via-accent-400/30 to-yellow-400/20 rounded-full blur-3xl scale-125"
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 bg-gradient-to-tl from-accent-400/30 to-primary-400/20 rounded-full blur-3xl scale-110 opacity-60"
                aria-hidden="true"
              />
              <Image
                src="/logo.png"
                alt="Bơ Review Mascot - Hai nhân vật hoạt hình dễ thương"
                width={550}
                height={330}
                className="relative z-10 w-full max-w-sm sm:max-w-md lg:max-w-xl drop-shadow-2xl"
                priority
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Wave decoration at bottom - Smoother curve */}
      <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
        <svg
          className="w-full h-12 sm:h-16 md:h-20 lg:h-24"
          viewBox="0 0 1440 74"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 32L48 35C96 38 192 44 288 46.7C384 49 480 47 576 42.7C672 38 768 31 864 29.3C960 28 1056 32 1152 35.7C1248 39 1344 43 1392 45L1440 47V74H1392C1344 74 1248 74 1152 74C1056 74 960 74 864 74C768 74 672 74 576 74C480 74 384 74 288 74C192 74 96 74 48 74H0V32Z"
            className="fill-white dark:fill-gray-900"
          />
        </svg>
      </div>
    </section>
  );
}

