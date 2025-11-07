import React from 'react';
import { motion } from 'motion/react';

export interface IconProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

/**
 * BookingTMS Brand Icon - Animated Calendar
 * Represents booking management with a modern calendar design
 */
export const BookingTMSIcon: React.FC<IconProps> = ({ 
  size = 80, 
  className = '',
  animated = true 
}) => {
  const Rect = animated ? motion.rect : 'rect';
  const Line = animated ? motion.line : 'line';
  const Circle = animated ? motion.circle : 'circle';

  const strokeColor = className.includes('text-') ? 'currentColor' : 'white';
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Calendar background */}
      <Rect
        x="10"
        y="15"
        width="60"
        height="55"
        rx="6"
        stroke={strokeColor}
        strokeWidth="3"
        fill="none"
        {...(animated && {
          initial: { pathLength: 0 },
          animate: { pathLength: 1 },
          transition: {
            duration: 1.5,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'loop' as const,
          }
        })}
      />
      
      {/* Calendar header bar */}
      <Line
        x1="10"
        y1="28"
        x2="70"
        y2="28"
        stroke={strokeColor}
        strokeWidth="3"
        {...(animated && {
          initial: { pathLength: 0 },
          animate: { pathLength: 1 },
          transition: {
            duration: 1.5,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'loop' as const,
            delay: 0.2,
          }
        })}
      />
      
      {/* Calendar rings */}
      <Line
        x1="25"
        y1="15"
        x2="25"
        y2="10"
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinecap="round"
        {...(animated && {
          initial: { opacity: 0, y: 5 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 1,
            ease: 'easeOut',
            repeat: Infinity,
            repeatType: 'reverse' as const,
          }
        })}
      />
      <Line
        x1="55"
        y1="15"
        x2="55"
        y2="10"
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinecap="round"
        {...(animated && {
          initial: { opacity: 0, y: 5 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 1,
            ease: 'easeOut',
            repeat: Infinity,
            repeatType: 'reverse' as const,
            delay: 0.1,
          }
        })}
      />
      
      {/* Calendar dots (booking indicators) */}
      <Circle
        cx="25"
        cy="42"
        r="3"
        fill="#4f46e5"
        {...(animated && {
          initial: { scale: 0, opacity: 0 },
          animate: { scale: [0, 1.2, 1], opacity: [0, 1, 1] },
          transition: {
            duration: 1.2,
            ease: 'easeOut',
            repeat: Infinity,
            repeatType: 'loop' as const,
            delay: 0.3,
          }
        })}
      />
      <Circle
        cx="40"
        cy="42"
        r="3"
        fill="#4f46e5"
        {...(animated && {
          initial: { scale: 0, opacity: 0 },
          animate: { scale: [0, 1.2, 1], opacity: [0, 1, 1] },
          transition: {
            duration: 1.2,
            ease: 'easeOut',
            repeat: Infinity,
            repeatType: 'loop' as const,
            delay: 0.5,
          }
        })}
      />
      <Circle
        cx="55"
        cy="42"
        r="3"
        fill="#4f46e5"
        {...(animated && {
          initial: { scale: 0, opacity: 0 },
          animate: { scale: [0, 1.2, 1], opacity: [0, 1, 1] },
          transition: {
            duration: 1.2,
            ease: 'easeOut',
            repeat: Infinity,
            repeatType: 'loop' as const,
            delay: 0.7,
          }
        })}
      />
      <Circle
        cx="25"
        cy="55"
        r="3"
        fill="#4f46e5"
        {...(animated && {
          initial: { scale: 0, opacity: 0 },
          animate: { scale: [0, 1.2, 1], opacity: [0, 1, 1] },
          transition: {
            duration: 1.2,
            ease: 'easeOut',
            repeat: Infinity,
            repeatType: 'loop' as const,
            delay: 0.9,
          }
        })}
      />
      <Circle
        cx="40"
        cy="55"
        r="3"
        fill="#4f46e5"
        {...(animated && {
          initial: { scale: 0, opacity: 0 },
          animate: { scale: [0, 1.2, 1], opacity: [0, 1, 1] },
          transition: {
            duration: 1.2,
            ease: 'easeOut',
            repeat: Infinity,
            repeatType: 'loop' as const,
            delay: 1.1,
          }
        })}
      />
    </svg>
  );
};

/**
 * Static BookingTMS Icon (No Animation)
 * Useful for logos, avatars, or static displays
 */
export const BookingTMSIconStatic: React.FC<IconProps> = ({ 
  size = 80, 
  className = '' 
}) => {
  const strokeColor = className.includes('text-') ? 'currentColor' : 'white';
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Calendar background */}
      <rect
        x="10"
        y="15"
        width="60"
        height="55"
        rx="6"
        stroke={strokeColor}
        strokeWidth="3"
        fill="none"
      />
      
      {/* Calendar header bar */}
      <line
        x1="10"
        y1="28"
        x2="70"
        y2="28"
        stroke={strokeColor}
        strokeWidth="3"
      />
      
      {/* Calendar rings */}
      <line
        x1="25"
        y1="15"
        x2="25"
        y2="10"
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="55"
        y1="15"
        x2="55"
        y2="10"
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Calendar dots (booking indicators) */}
      <circle cx="25" cy="42" r="3" fill="#4f46e5" />
      <circle cx="40" cy="42" r="3" fill="#4f46e5" />
      <circle cx="55" cy="42" r="3" fill="#4f46e5" />
      <circle cx="25" cy="55" r="3" fill="#4f46e5" />
      <circle cx="40" cy="55" r="3" fill="#4f46e5" />
    </svg>
  );
};
