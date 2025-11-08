'use client';

import React from 'react';
import { motion } from 'motion/react';
import { BookingTMSIcon } from '../ui/icons';
import { useTheme } from './ThemeContext';

interface PageLoadingScreenProps {
  message?: string;
}

export const PageLoadingScreen: React.FC<PageLoadingScreenProps> = ({
  message = 'Loading BookingTMS...'
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`fixed inset-0 z-[5000] flex flex-col items-center justify-center px-6 transition-colors ${
        isDark ? 'bg-[#0a0a0a] text-white' : 'bg-white text-gray-900'
      }`}
    >
      <motion.div
        className="relative mb-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <BookingTMSIcon size={80} animated />
      </motion.div>

      <div className={`w-64 h-1 mb-8 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
        <motion.div
          className={`${isDark ? 'bg-white' : 'bg-gray-900'} h-full`}
          animate={{ width: ['0%', '65%', '100%'] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.p
        className={`text-sm ${isDark ? 'text-white/70' : 'text-gray-600'} text-center`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {message}
      </motion.p>
    </div>
  );
};
