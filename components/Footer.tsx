'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import NewsletterForm from './NewsletterForm';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    navigation: [
      { href: '/', label: 'Trang chủ', icon: '🏠' },
      { href: '/blog', label: 'Blog', icon: '📖' },
      { href: '/about', label: 'Về chúng tôi', icon: '💡' },
      { href: '/contact', label: 'Liên hệ', icon: '✉️' },
    ],
    legal: [
      { href: '/privacy-policy', label: 'Chính sách bảo mật' },
      { href: '/terms', label: 'Điều khoản sử dụng' },
    ],
  };

  const socialLinks = [
    { href: 'https://www.youtube.com/@BoRiViu67', label: 'YouTube', icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.5,6.19a3.02,3.02,0,0,0-2.12-2.14C19.5,3.5,12,3.5,12,3.5s-7.5,0-9.38.55A3.02,3.02,0,0,0,.5,6.19,31.35,31.35,0,0,0,0,12a31.35,31.35,0,0,0,.5,5.81A3.02,3.02,0,0,0,2.62,19.95c1.88.55,9.38.55,9.38.55s7.5,0,9.38-.55a3.02,3.02,0,0,0,2.12-2.14A31.35,31.35,0,0,0,24,12,31.35,31.35,0,0,0,23.5,6.19ZM9.55,15.57V8.43L15.82,12Z"/>
      </svg>
    )},
    { href: '#', label: 'Facebook', icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z"/>
      </svg>
    )},
    { href: '#', label: 'TikTok', icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59,6.69a4.83,4.83,0,0,1-3.77-4.25V2h-3.45V15.94a2.91,2.91,0,1,1-2-2.76V9.65a6.36,6.36,0,1,0,5.48,6.29V9.62a8.16,8.16,0,0,0,4.77,1.52V7.72A4.85,4.85,0,0,1,19.59,6.69Z"/>
      </svg>
    )},
  ];

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 mt-auto">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200/20 dark:bg-primary-900/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-200/20 dark:bg-accent-900/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="Bơ Review"
                width={180}
                height={60}
                className="h-14 w-auto"
              />
            </Link>
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-md leading-relaxed">
              Tóm tắt & phân tích nội dung video từ kênh Bơ Review - Nơi tổng hợp những câu chuyện thú vị, review và góc nhìn độc đáo.
            </p>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith('http') ? '_blank' : undefined}
                  rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800
                    text-gray-600 dark:text-gray-400 hover:bg-primary-100 hover:text-primary-600
                    dark:hover:bg-primary-900/30 dark:hover:text-primary-400 transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Navigation Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5">
              Điều hướng
            </h3>
            <ul className="space-y-3">
              {footerLinks.navigation.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <span className="text-sm opacity-60 group-hover:opacity-100 transition-opacity">{link.icon}</span>
                    <span className="font-medium">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal & Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5">
              Pháp lý
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Quick Subscribe */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Đăng ký nhận tin</h4>
              <NewsletterForm source="footer" variant="compact" />
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-gray-200 dark:border-gray-700 mt-12 pt-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © {currentYear} <span className="font-semibold">Bơ Review</span>. Bảo lưu mọi quyền.
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm flex items-center gap-1">
              Made with <span className="text-red-500">❤️</span> in Vietnam 🇻🇳
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

