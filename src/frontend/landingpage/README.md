# Landing Page - BookingTMS

## 📋 Overview

This directory contains the customer-facing landing page for BookingTMS - the public website that showcases the platform and converts visitors into customers.

## 🎯 Purpose

The landing page serves as:
- **Marketing hub** - Showcase BookingTMS features and benefits
- **Lead generation** - Convert visitors into demo requests or sign-ups
- **Brand presence** - Establish professional, trustworthy image
- **SEO optimization** - Rank for booking management keywords

## 🏗️ Structure

```
/frontend/landingpage/
├── components/          # Landing page components
│   ├── Hero.tsx        # Hero section with CTA
│   ├── Features.tsx    # Feature showcase
│   ├── Pricing.tsx     # Pricing plans
│   ├── Testimonials.tsx # Customer testimonials
│   ├── FAQ.tsx         # Frequently asked questions
│   ├── CTA.tsx         # Call-to-action sections
│   └── Footer.tsx      # Landing page footer
├── sections/           # Full page sections
│   ├── HeroSection.tsx
│   ├── FeaturesSection.tsx
│   └── ...
├── assets/             # Landing page assets
│   ├── images/         # Hero images, screenshots
│   └── icons/          # Feature icons
└── README.md           # This file
```

## 🎨 Design Guidelines

### Colors
- **Primary**: Vibrant Blue (#4f46e5 / #6366f1)
- **Success**: Emerald (#10b981)
- **Neutral**: Gray scale for text and backgrounds
- **Dark Mode**: Full support required

### Typography
- **Headlines**: Bold, attention-grabbing
- **Body**: Clear, readable (16px base)
- **CTAs**: Action-oriented, prominent

### Components to Use
- Hero with large heading and CTA
- Feature cards with icons
- Social proof (testimonials, logos, stats)
- Pricing comparison table
- FAQ accordion
- Footer with links and contact

## 🚀 Implementation Approach

### Phase 1: Basic Structure
1. Hero section with main CTA
2. Features overview (3-4 key features)
3. Simple pricing section
4. Contact/demo request form
5. Basic footer

### Phase 2: Enhanced Content
1. Customer testimonials
2. Detailed feature sections
3. Integration showcase
4. FAQ section
5. Blog/resources section

### Phase 3: Optimization
1. SEO optimization
2. Performance optimization
3. A/B testing setup
4. Analytics integration
5. Lead tracking

## 📐 Layout Patterns

### Hero Section
```tsx
- Full viewport height
- Centered content
- Large headline (h1)
- Subheadline
- Primary CTA button
- Secondary CTA (optional)
- Hero image/illustration
```

### Features Section
```tsx
- 3-column grid (desktop)
- 1-column stack (mobile)
- Icon + Heading + Description
- Visual consistency
- Clear benefits
```

### Pricing Section
```tsx
- Card-based layout
- 3 tiers (Starter, Pro, Enterprise)
- Feature comparison
- Highlighted "Popular" option
- CTAs for each tier
```

## 🎯 Key CTAs

1. **Primary**: "Start Free Trial" / "Book Demo"
2. **Secondary**: "See Pricing" / "View Features"
3. **Footer**: "Contact Sales" / "Get Started"

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px (single column)
- **Tablet**: 768px - 1024px (2 columns)
- **Desktop**: > 1024px (3-4 columns)

### Mobile-First Approach
```tsx
// ✅ Correct
<div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// ❌ Wrong
<div className="grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
```

## 🌓 Dark Mode Support

**All landing page components MUST support dark mode:**

```tsx
import { useTheme } from '@/components/layout/ThemeContext';

const Component = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const bgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  
  return (
    <div className={`${bgClass} ${textClass}`}>
      {/* Content */}
    </div>
  );
};
```

## 🎨 Component Template

```tsx
'use client';

import { useTheme } from '@/components/layout/ThemeContext';
import { Button } from '@/components/ui/button';

interface HeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  onCtaClick: () => void;
}

export const Hero = ({ title, subtitle, ctaText, onCtaClick }: HeroProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Semantic class variables
  const bgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const subtextClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  
  return (
    <section className={`min-h-screen flex items-center justify-center ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className={`text-4xl sm:text-5xl lg:text-6xl mb-6 ${textClass}`}>
          {title}
        </h1>
        <p className={`text-lg sm:text-xl mb-8 max-w-2xl mx-auto ${subtextClass}`}>
          {subtitle}
        </p>
        <Button
          size="lg"
          style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
          className={`min-h-[44px] ${isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}`}
          onClick={onCtaClick}
        >
          {ctaText}
        </Button>
      </div>
    </section>
  );
};
```

## 📊 SEO Checklist

- [ ] Semantic HTML (h1, h2, section, article)
- [ ] Meta tags (title, description, keywords)
- [ ] Open Graph tags (social sharing)
- [ ] Alt text on all images
- [ ] Clean URLs
- [ ] Fast loading speed
- [ ] Mobile-friendly
- [ ] Schema.org markup

## 🔗 Navigation

### Landing Page Header
```tsx
- Logo (links to home)
- Features (anchor link)
- Pricing (anchor link)
- Login (links to /login)
- Get Started (primary CTA)
```

### Footer
```tsx
- Company links (About, Careers, Contact)
- Product links (Features, Pricing, Integrations)
- Resources (Blog, Docs, Support)
- Legal (Privacy, Terms, Security)
- Social media links
```

## 🎯 Conversion Optimization

### Above the Fold
- Clear value proposition
- Strong headline
- Visible CTA
- Social proof (if available)

### Throughout Page
- Multiple CTAs (every 2-3 sections)
- Trust signals (security badges, certifications)
- Customer logos/testimonials
- Clear pricing

### Before Footer
- Final CTA section
- Contact information
- Newsletter signup

## 📝 Content Guidelines

### Headlines
- Clear and benefit-focused
- Action-oriented
- Keywords for SEO
- Maximum 10-12 words

### Body Copy
- Short paragraphs (2-3 sentences)
- Bullet points for features
- Active voice
- Customer-focused ("you" language)

### CTAs
- Action verbs (Start, Get, Try, Book)
- Value proposition (Free Trial, No Credit Card)
- High contrast buttons
- Above the fold placement

## 🚀 Getting Started

1. **Review Design System**: `/guidelines/DESIGN_SYSTEM.md`
2. **Check Component Library**: `/guidelines/COMPONENT_LIBRARY.md`
3. **Start with Hero**: Create `Hero.tsx` component
4. **Add Sections**: Build out features, pricing, etc.
5. **Test Responsive**: Mobile, tablet, desktop
6. **Verify Dark Mode**: Toggle and test all sections

## 🔧 Development Workflow

```bash
# 1. Create component
touch /frontend/landingpage/components/Hero.tsx

# 2. Import and use
import { Hero } from '@/frontend/landingpage/components/Hero';

# 3. Test dark mode
# Toggle theme and verify styling

# 4. Test responsive
# Resize browser to test breakpoints

# 5. Deploy
# Follow deployment guide
```

## 📚 Resources

- **Design Inspiration**: Stripe, Linear, Shopify
- **Component Patterns**: `/guidelines/COMPONENT_LIBRARY.md`
- **Color System**: `/guidelines/DESIGN_SYSTEM.md`
- **Icons**: lucide-react (consistent with admin)

## ✅ Pre-Launch Checklist

### Design
- [ ] Consistent with brand guidelines
- [ ] Dark mode fully functional
- [ ] Mobile responsive (tested at 375px)
- [ ] Touch targets ≥ 44x44px
- [ ] Proper contrast ratios

### Content
- [ ] All copy proofread
- [ ] CTAs clear and prominent
- [ ] Images optimized
- [ ] Alt text on all images
- [ ] Links working

### Technical
- [ ] Fast loading (<3 seconds)
- [ ] SEO optimized
- [ ] Analytics tracking
- [ ] Form submissions working
- [ ] Error handling implemented

### Testing
- [ ] Tested on Chrome, Firefox, Safari
- [ ] Mobile devices tested
- [ ] Dark mode tested
- [ ] All CTAs tested
- [ ] Forms validated

---

**Status**: 🚧 Directory Created - Ready for Implementation  
**Priority**: Phase 1 - After MVP Admin Portal Complete  
**Owner**: Marketing & Development Teams  
**Last Updated**: November 5, 2025
