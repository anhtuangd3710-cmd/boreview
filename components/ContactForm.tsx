'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormState>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSubmitted(true);
      } else {
        setError(data.error || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Không thể kết nối. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
        >
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Cảm ơn bạn! 🎉
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Tin nhắn của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất có thể!
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setFormData({ name: '', email: '', subject: '', message: '' });
          }}
          className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
        >
          Gửi tin nhắn khác
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name Field */}
        <div className="relative">
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="peer w-full px-4 py-4 pt-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 
              bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white 
              focus:ring-0 focus:border-primary-500 dark:focus:border-primary-400 transition-colors
              placeholder-transparent"
            placeholder="Họ và tên"
          />
          <label
            htmlFor="name"
            className="absolute left-4 top-2 text-xs font-medium text-gray-500 dark:text-gray-400
              peer-placeholder-shown:text-base peer-placeholder-shown:top-4
              peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-500 transition-all"
          >
            Họ và tên
          </label>
        </div>

        {/* Email Field */}
        <div className="relative">
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="peer w-full px-4 py-4 pt-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 
              bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white 
              focus:ring-0 focus:border-primary-500 dark:focus:border-primary-400 transition-colors
              placeholder-transparent"
            placeholder="Email"
          />
          <label
            htmlFor="email"
            className="absolute left-4 top-2 text-xs font-medium text-gray-500 dark:text-gray-400
              peer-placeholder-shown:text-base peer-placeholder-shown:top-4
              peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-500 transition-all"
          >
            Địa chỉ Email
          </label>
        </div>
      </div>

      {/* Subject Field */}
      <div className="relative">
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          className="peer w-full px-4 py-4 pt-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 
            bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white 
            focus:ring-0 focus:border-primary-500 dark:focus:border-primary-400 transition-colors
            placeholder-transparent"
          placeholder="Tiêu đề"
        />
        <label
          htmlFor="subject"
          className="absolute left-4 top-2 text-xs font-medium text-gray-500 dark:text-gray-400
            peer-placeholder-shown:text-base peer-placeholder-shown:top-4
            peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-500 transition-all"
        >
          Tiêu đề
        </label>
      </div>

      {/* Message Field */}
      <div className="relative">
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={5}
          required
          className="peer w-full px-4 py-4 pt-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 
            bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white 
            focus:ring-0 focus:border-primary-500 dark:focus:border-primary-400 transition-colors
            placeholder-transparent resize-none"
          placeholder="Nội dung"
        />
        <label
          htmlFor="message"
          className="absolute left-4 top-2 text-xs font-medium text-gray-500 dark:text-gray-400
            peer-placeholder-shown:text-base peer-placeholder-shown:top-4
            peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-500 transition-all"
        >
          Nội dung tin nhắn
        </label>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm"
          >
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold
          rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all duration-300
          disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <AnimatePresence mode="wait">
          {isSubmitting ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Đang gửi...
            </motion.span>
          ) : (
            <motion.span
              key="send"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Gửi tin nhắn
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </form>
  );
}

