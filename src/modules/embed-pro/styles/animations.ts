/**
 * Widget Animation Presets
 * @module embed-pro/styles/animations
 * 
 * Pre-built CSS animations and keyframes for widget components.
 * Supports both CSS and Framer Motion variants.
 */

// =====================================================
// CSS KEYFRAME DEFINITIONS
// =====================================================

export const CSS_KEYFRAMES = `
@keyframes bw-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes bw-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes bw-slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bw-slide-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bw-scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bw-scale-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

@keyframes bw-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes bw-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes bw-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes bw-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes bw-progress {
  0% { width: 0%; }
  100% { width: 100%; }
}
`;

// =====================================================
// CSS ANIMATION CLASSES
// =====================================================

export const CSS_ANIMATION_CLASSES = `
.bw-animate-fade-in {
  animation: bw-fade-in 0.3s ease-out forwards;
}

.bw-animate-fade-out {
  animation: bw-fade-out 0.3s ease-out forwards;
}

.bw-animate-slide-up {
  animation: bw-slide-up 0.3s ease-out forwards;
}

.bw-animate-slide-down {
  animation: bw-slide-down 0.3s ease-out forwards;
}

.bw-animate-scale-in {
  animation: bw-scale-in 0.2s ease-out forwards;
}

.bw-animate-scale-out {
  animation: bw-scale-out 0.2s ease-out forwards;
}

.bw-animate-pulse {
  animation: bw-pulse 2s ease-in-out infinite;
}

.bw-animate-bounce {
  animation: bw-bounce 1s ease-in-out infinite;
}

.bw-animate-spin {
  animation: bw-spin 1s linear infinite;
}

.bw-animate-shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.4) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 200% 100%;
  animation: bw-shimmer 1.5s infinite;
}
`;

// =====================================================
// FRAMER MOTION VARIANTS
// =====================================================

export const FRAMER_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },

  slideUp: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  slideDown: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },

  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  },

  staggerItem: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
};

// =====================================================
// TRANSITION PRESETS
// =====================================================

export const TRANSITIONS = {
  default: {
    type: 'tween',
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
  },
  fast: {
    type: 'tween',
    duration: 0.15,
    ease: [0.4, 0, 0.2, 1],
  },
  slow: {
    type: 'tween',
    duration: 0.5,
    ease: [0.4, 0, 0.2, 1],
  },
  spring: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  },
  springBounce: {
    type: 'spring',
    stiffness: 300,
    damping: 20,
  },
};

// =====================================================
// INJECT ANIMATIONS
// =====================================================

/**
 * Injects animation CSS into the document head.
 */
export function injectAnimationCSS(): HTMLStyleElement {
  const styleElement = document.createElement('style');
  styleElement.id = 'bookflow-widget-animations';
  styleElement.textContent = CSS_KEYFRAMES + CSS_ANIMATION_CLASSES;

  // Remove existing if present
  const existing = document.getElementById('bookflow-widget-animations');
  if (existing) {
    existing.remove();
  }

  document.head.appendChild(styleElement);
  return styleElement;
}

/**
 * Gets the complete animation CSS string.
 */
export function getAnimationCSS(): string {
  return CSS_KEYFRAMES + CSS_ANIMATION_CLASSES;
}
