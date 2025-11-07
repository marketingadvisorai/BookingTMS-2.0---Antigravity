'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BookingTMSIcon } from '../ui/icons';

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Delay slightly before calling complete
          setTimeout(() => {
            onLoadingComplete?.();
          }, 300);
          return 100;
        }
        // Accelerate progress toward the end
        const increment = prev < 60 ? 2 : prev < 90 ? 5 : 10;
        return Math.min(prev + increment, 100);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a]"
      initial={{ opacity: 1 }}
      animate={{ opacity: progress >= 100 ? 0 : 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Animated BookingTMS Icon */}
      <motion.div
        className="relative mb-12"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <BookingTMSIcon size={80} animated={true} />
      </motion.div>

      {/* Progress bar container */}
      <div className="w-64 h-1 bg-[#1e1e1e] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-white rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Optional: Loading text */}
      <motion.p
        className="mt-8 text-white/60 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Loading BookingTMS...
      </motion.p>
    </motion.div>
  );
};
