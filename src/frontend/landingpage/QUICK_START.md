# Landing Page Quick Start Guide ⚡

## 🎯 Create a Landing Page Component in 5 Minutes

### Step 1: Create Component File

```bash
# Create a new component
touch /frontend/landingpage/components/Hero.tsx
```

### Step 2: Copy Template

```tsx
'use client';

import { useTheme } from '@/components/layout/ThemeContext';
import { Button } from '@/components/ui/button';

interface HeroProps {
  title: string;
  subtitle: string;
  ctaText?: string;
  secondaryCtaText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

export const Hero = ({
  title,
  subtitle,
  ctaText = 'Get Started',
  secondaryCtaText = 'Learn More',
  onPrimaryClick,
  onSecondaryClick,
}: HeroProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Semantic class variables (required for consistency)
  const bgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const subtextClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';

  return (
    <section className={`min-h-screen flex items-center justify-center ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Headline - No explicit font sizing (use globals.css) */}
          <h1 className={`mb-6 ${textClass}`}>
            {title}
          </h1>

          {/* Subheadline */}
          <p className={`mb-8 max-w-2xl mx-auto ${subtextClass}`}>
            {subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Primary CTA - Always use vibrant blue in dark mode */}
            <Button
              size="lg"
              style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
              className={`
                min-h-[44px] w-full sm:w-auto
                ${isDark 
                  ? 'text-white hover:bg-[#4338ca]' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }
              `}
              onClick={onPrimaryClick}
            >
              {ctaText}
            </Button>

            {/* Secondary CTA */}
            <Button
              size="lg"
              variant="outline"
              className="min-h-[44px] w-full sm:w-auto"
              onClick={onSecondaryClick}
            >
              {secondaryCtaText}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
```

### Step 3: Use Component

```tsx
// In your landing page
import { Hero } from '@/frontend/landingpage/components/Hero';

function LandingPage() {
  const handleGetStarted = () => {
    // Navigate to signup or demo request
    window.location.href = '/signup';
  };

  const handleLearnMore = () => {
    // Scroll to features section
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      <Hero
        title="Streamline Your Booking Management"
        subtitle="BookingTMS helps escape rooms and experience venues manage bookings, payments, and customer relationships with ease."
        onPrimaryClick={handleGetStarted}
        onSecondaryClick={handleLearnMore}
      />
      {/* More sections... */}
    </div>
  );
}
```

---

## 📋 Common Components Cheat Sheet

### 1. Feature Card

```tsx
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const subtextClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';

  return (
    <div className={`p-6 rounded-lg border ${borderClass} ${cardBgClass} shadow-sm`}>
      <div className="mb-4 text-blue-600 dark:text-[#6366f1]">
        {icon}
      </div>
      <h3 className={`mb-2 ${textClass}`}>{title}</h3>
      <p className={subtextClass}>{description}</p>
    </div>
  );
};

// Usage:
<FeatureCard
  icon={<Calendar className="w-8 h-8" />}
  title="Smart Scheduling"
  description="Automated booking management with conflict detection and availability optimization."
/>
```

### 2. Pricing Card

```tsx
interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  features: string[];
  popular?: boolean;
  ctaText?: string;
  onCtaClick?: () => void;
}

export const PricingCard = ({
  title,
  price,
  period = '/month',
  features,
  popular = false,
  ctaText = 'Get Started',
  onCtaClick,
}: PricingCardProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';

  return (
    <div className={`
      relative p-6 rounded-lg border-2 ${cardBgClass} shadow-sm
      ${popular 
        ? isDark 
          ? 'border-[#4f46e5]' 
          : 'border-blue-600'
        : borderClass
      }
    `}>
      {popular && (
        <div className={`
          absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-sm
          ${isDark ? 'bg-[#4f46e5] text-white' : 'bg-blue-600 text-white'}
        `}>
          Most Popular
        </div>
      )}

      <h3 className={`mb-2 ${textClass}`}>{title}</h3>
      <div className="mb-4">
        <span className={`text-4xl ${textClass}`}>{price}</span>
        <span className={isDark ? 'text-[#a3a3a3]' : 'text-gray-600'}>{period}</span>
      </div>

      <ul className="mb-6 space-y-2">
        {features.map((feature, i) => (
          <li key={i} className={`flex items-start gap-2 ${isDark ? 'text-[#a3a3a3]' : 'text-gray-600'}`}>
            <Check className="w-5 h-5 flex-shrink-0 text-green-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        className="w-full min-h-[44px]"
        style={{ backgroundColor: popular && isDark ? '#4f46e5' : undefined }}
        variant={popular ? 'default' : 'outline'}
        onClick={onCtaClick}
      >
        {ctaText}
      </Button>
    </div>
  );
};
```

### 3. Testimonial Card

```tsx
interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar?: string;
}

export const Testimonial = ({
  quote,
  author,
  role,
  company,
  avatar,
}: TestimonialProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const subtextClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';

  return (
    <div className={`p-6 rounded-lg border ${borderClass} ${cardBgClass} shadow-sm`}>
      <div className="mb-4">
        <Quote className={`w-8 h-8 ${isDark ? 'text-[#4f46e5]' : 'text-blue-600'}`} />
      </div>
      <p className={`mb-4 ${textClass}`}>{quote}</p>
      <div className="flex items-center gap-3">
        {avatar && (
          <img
            src={avatar}
            alt={author}
            className="w-12 h-12 rounded-full"
          />
        )}
        <div>
          <p className={textClass}>{author}</p>
          <p className={subtextClass}>{role} at {company}</p>
        </div>
      </div>
    </div>
  );
};
```

---

## 🎨 Color Quick Reference

```tsx
// Always use semantic class variables
const { theme } = useTheme();
const isDark = theme === 'dark';

// Backgrounds
const bgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-white';           // Main
const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';        // Cards
const elevatedBgClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';  // Modals

// Text
const textClass = isDark ? 'text-white' : 'text-gray-900';       // Primary
const subtextClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600'; // Secondary

// Borders
const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';

// Buttons - Primary action
const buttonStyle = { backgroundColor: isDark ? '#4f46e5' : undefined };
const buttonClass = isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700';
```

---

## 📱 Responsive Patterns

```tsx
// Container
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

// Grid (mobile-first)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Flex (mobile-first)
<div className="flex flex-col sm:flex-row gap-4">

// Text sizes (use sparingly - prefer globals.css)
<h1 className="text-4xl sm:text-5xl lg:text-6xl">
<h2 className="text-3xl sm:text-4xl lg:text-5xl">
<p className="text-base sm:text-lg">

// Spacing
<div className="py-12 sm:py-16 lg:py-24">  // Section padding
<div className="mb-6 sm:mb-8 lg:mb-12">     // Element spacing
```

---

## ✅ Component Checklist

Before shipping any component:

- [ ] **Dark mode works** - Toggle and test
- [ ] **Responsive** - Test at 375px, 768px, 1024px
- [ ] **Semantic classes** - Use variables, not hardcoded values
- [ ] **Touch targets** - Buttons minimum 44x44px
- [ ] **TypeScript types** - All props properly typed
- [ ] **Accessibility** - ARIA labels, keyboard nav
- [ ] **Vibrant blue** - #4f46e5 for primary actions in dark mode
- [ ] **No typography classes** - Let globals.css handle it (unless specifically needed)

---

## 🚀 Common Patterns

### Scroll to Section

```tsx
const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ 
    behavior: 'smooth',
    block: 'start'
  });
};

<Button onClick={() => scrollToSection('pricing')}>
  View Pricing
</Button>
```

### External Navigation

```tsx
const navigateToSignup = () => {
  window.location.href = '/signup';
};

const navigateToDemo = () => {
  window.location.href = '/demo-request';
};
```

### Form Submission

```tsx
const handleContactSubmit = async (data: ContactFormData) => {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (response.ok) {
      toast.success('Message sent successfully!');
    }
  } catch (error) {
    toast.error('Failed to send message');
  }
};
```

---

## 🎯 Quick Tips

1. **Always test dark mode** - Toggle after every change
2. **Mobile-first** - Start with mobile layout, enhance for desktop
3. **Semantic variables** - Never hardcode colors
4. **High contrast** - Ensure 4.5:1 ratio minimum
5. **Large touch targets** - 44x44px minimum for mobile
6. **CTAs above fold** - Primary action always visible
7. **Social proof early** - Build trust immediately
8. **Clear value prop** - Within 3 seconds of landing

---

**Ready to build? Start with the Hero component and work your way down the page!** 🚀

**Questions?** Check `/frontend/landingpage/README.md` or `/guidelines/DESIGN_SYSTEM.md`
