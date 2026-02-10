'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsletterFormProps {
  source?: string;
  variant?: 'default' | 'inline' | 'compact';
  className?: string;
}

export default function NewsletterForm({ source = 'homepage', variant = 'default', className = '' }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Đăng ký thành công!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Không thể kết nối. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email của bạn"
          required
          className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium text-sm rounded-xl 
            shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all disabled:opacity-50"
        >
          {isSubmitting ? '...' : 'Gửi'}
        </button>
        {status !== 'idle' && (
          <span className={`text-xs self-center ${status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
            {status === 'success' ? '✓' : '✗'}
          </span>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      <div className="flex-grow">
        <label htmlFor={`email-${source}`} className="sr-only">Địa chỉ email</label>
        <input
          id={`email-${source}`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email của bạn"
          required
          disabled={isSubmitting}
          className="w-full px-4 py-3 rounded-xl border-2 border-white/20 bg-white/15 backdrop-blur-sm
            text-white placeholder-white/60 text-sm
            focus:ring-2 focus:ring-white focus:border-white/40 focus:bg-white/25 transition-all duration-300
            disabled:opacity-50"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-6 py-3 bg-white text-primary-600 font-bold text-sm rounded-xl
          hover:bg-gray-50 hover:shadow-xl shadow-lg shadow-black/10
          transition-all duration-300 whitespace-nowrap
          focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-500
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Đang gửi...' : 'Đăng ký'}
      </button>
      
      <AnimatePresence>
        {status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`absolute -bottom-8 left-0 right-0 text-center text-sm
              ${status === 'success' ? 'text-green-300' : 'text-red-300'}`}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

