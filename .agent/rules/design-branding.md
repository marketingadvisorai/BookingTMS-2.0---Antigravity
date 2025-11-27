# BookingTMS 2.0 - Design & Branding Guidelines

> Last Updated: 2025-11-27
> Design System: Apple-inspired Liquid Glass + shadcn/ui

---

## Design Philosophy

BookingTMS follows a **clean, minimal, accessible** design language inspired by:
- Apple's Liquid Glass (iOS 26+)
- OpenAI's product interfaces
- Anthropic's Claude UI

### Core Principles
1. **Clarity** - Information hierarchy is immediately clear
2. **Responsiveness** - Works beautifully on all devices
3. **Accessibility** - WCAG 2.1 AA compliant
4. **Delight** - Subtle animations that feel alive

---

## Color System

### Primary Colors
```css
/* Brand Blue */
--primary: #3B82F6;        /* Blue 500 */
--primary-hover: #2563EB;  /* Blue 600 */
--primary-light: #EFF6FF;  /* Blue 50 */

/* Accent */
--accent: #8B5CF6;         /* Violet 500 */
```

### Semantic Colors
```css
/* Success */
--success: #22C55E;        /* Green 500 */
--success-light: #F0FDF4;  /* Green 50 */

/* Warning */
--warning: #F59E0B;        /* Amber 500 */
--warning-light: #FFFBEB;  /* Amber 50 */

/* Error */
--error: #EF4444;          /* Red 500 */
--error-light: #FEF2F2;    /* Red 50 */

/* Info */
--info: #3B82F6;           /* Blue 500 */
--info-light: #EFF6FF;     /* Blue 50 */
```

### Neutral Colors
```css
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;
```

---

## Typography

### Font Stack
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Scale
| Name | Size | Weight | Use |
|------|------|--------|-----|
| `text-xs` | 12px | 400 | Labels, hints |
| `text-sm` | 14px | 400 | Body small |
| `text-base` | 16px | 400 | Body |
| `text-lg` | 18px | 500 | Subheadings |
| `text-xl` | 20px | 600 | Section titles |
| `text-2xl` | 24px | 700 | Page titles |
| `text-3xl` | 30px | 700 | Hero text |

---

## Spacing

Use Tailwind's spacing scale consistently:

| Token | Value | Use |
|-------|-------|-----|
| `1` | 4px | Tight spacing |
| `2` | 8px | Element gaps |
| `3` | 12px | Small padding |
| `4` | 16px | Standard padding |
| `6` | 24px | Section gaps |
| `8` | 32px | Large gaps |

---

## Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `rounded` | 4px | Inputs, small elements |
| `rounded-lg` | 8px | Cards, buttons |
| `rounded-xl` | 12px | Modals, panels |
| `rounded-2xl` | 16px | Large cards |
| `rounded-3xl` | 24px | Hero sections |
| `rounded-full` | 9999px | Avatars, pills |

---

## Shadows

### Standard Shadows
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
```

### Liquid Glass Shadows
```css
/* Glass container */
box-shadow: 
  0 8px 32px rgba(31, 38, 135, 0.15),
  inset 0 2px 20px rgba(255, 255, 255, 0.4);

/* Glass button */
box-shadow: 
  0 4px 16px rgba(0, 0, 0, 0.1),
  inset 0 2px 8px rgba(255, 255, 255, 0.6);

/* Primary button glow */
box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
```

---

## Liquid Glass Effects

### Container Glass
```css
.liquid-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 
    0 8px 32px rgba(31, 38, 135, 0.15),
    inset 0 2px 20px rgba(255, 255, 255, 0.4);
}
```

### Button Glass
```css
.liquid-glass-button {
  background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 2px 8px rgba(255, 255, 255, 0.6);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.liquid-glass-button:hover {
  transform: translateY(-2px) scale(1.02);
}
```

### Primary Button
```css
.liquid-primary-button {
  background: linear-gradient(135deg, var(--primary), var(--primary-hover));
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.liquid-primary-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.3), transparent 60%);
}

.liquid-primary-button:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.5);
}
```

---

## Animation Guidelines

### Timing Functions
```css
--ease-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Duration
| Type | Duration | Use |
|------|----------|-----|
| Fast | 150ms | Hover states |
| Normal | 200ms | Transitions |
| Slow | 300ms | Page transitions |
| Deliberate | 500ms | Complex animations |

### Common Animations
```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Scale in */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* Slide up */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## Component Patterns

### Cards
```tsx
<div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
  {/* Content */}
</div>
```

### Buttons
```tsx
// Primary
<button className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors">
  Primary
</button>

// Secondary
<button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors">
  Secondary
</button>

// Ghost
<button className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
  Ghost
</button>
```

### Inputs
```tsx
<input 
  className="w-full px-3 py-2 rounded-lg border border-gray-200 
             focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
             transition-all outline-none"
/>
```

---

## Responsive Breakpoints

| Breakpoint | Width | Use |
|------------|-------|-----|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Wide screens |

---

## Icons

Use **Lucide React** for all icons:

```tsx
import { Calendar, Clock, Users, ChevronRight } from 'lucide-react';

// Standard size
<Calendar className="w-5 h-5" />

// With color
<Calendar className="w-5 h-5 text-blue-500" />
```

### Icon Sizes
| Size | Class | Use |
|------|-------|-----|
| Small | `w-4 h-4` | Inline, buttons |
| Medium | `w-5 h-5` | Standard |
| Large | `w-6 h-6` | Headers |
| XL | `w-8 h-8` | Feature icons |
