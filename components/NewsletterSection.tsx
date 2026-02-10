'use client';

import NewsletterForm from './NewsletterForm';

export default function NewsletterSection() {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 rounded-2xl md:rounded-3xl p-8 md:p-12 lg:p-14 mt-12"
      aria-labelledby="newsletter-heading"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" aria-hidden="true" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" aria-hidden="true" />

      <div className="relative z-10 text-center text-white max-w-xl mx-auto">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-xl mb-5" aria-hidden="true">
          <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h2 id="newsletter-heading" className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
          Đăng ký nhận tin
        </h2>
        <p className="mb-6 text-white/90 text-base md:text-lg leading-relaxed">
          Nhận thông báo bài viết mới nhất vào email của bạn.
        </p>

        <div className="relative max-w-md mx-auto">
          <NewsletterForm source="homepage" />
        </div>

        {/* Trust indicators */}
        <p className="mt-6 text-white/70 text-xs">
          🔒 Cam kết bảo mật thông tin
        </p>
      </div>
    </section>
  );
}

