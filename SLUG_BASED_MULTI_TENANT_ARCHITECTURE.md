# Slug-Based Multi-Tenant Architecture

## Overview

BookingTMS now implements **industry-standard slug-based routing** similar to platforms like Shopify, Calendly, and Square. Each organization gets a unique, SEO-friendly URL path.

---

## URL Structure

### Public Venue Profile
```
https://bookingtms.com/optimal-escape-location
```
- **SEO-optimized** public profile
- Schema.org LocalBusiness markup
- Open Graph meta tags for social sharing
- Canonical URLs
- Accessible to everyone

### Owner Admin Login
```
https://bookingtms.com/optimal-escape-location/admin
```
- Secure login portal for venue owners
- Validates ownership before granting access
- Beautiful, modern UI
- Password reset flow

### Owner Admin Dashboard
```
https://bookingtms.com/optimal-escape-location/admin/dashboard
```
- Full admin dashboard after authentication
- Only accessible to verified owners
- Role-based access control

---

## How Slugs Work

### Automatic Slug Generation

When an organization is created, a slug is **automatically generated** from the organization name:

**Example:**
- Organization Name: `"Optimal Escape Location"`
- Generated Slug: `"optimal-escape-location"`

**Rules:**
1. Convert to lowercase
2. Replace spaces and special characters with hyphens
3. Remove leading/trailing hyphens
4. Limit to 50 characters
5. Handle duplicates by appending numbers (e.g., `optimal-escape-location-2`)

### Database Implementation

```sql
-- Organizations table has slug column
ALTER TABLE organizations ADD COLUMN slug VARCHAR(255) UNIQUE;

-- Auto-generate slug on insert/update
CREATE TRIGGER trigger_set_organization_slug
  BEFORE INSERT OR UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_slug();
```

### Slug Function

```sql
CREATE FUNCTION generate_slug(name TEXT) RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert to lowercase, replace special chars
  base_slug := lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  base_slug := substring(base_slug from 1 for 50);
  
  final_slug := base_slug;
  
  -- Handle duplicates
  WHILE EXISTS (SELECT 1 FROM organizations WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;
```

---

## SEO Optimization

### 1. Meta Tags

Each venue profile includes:

```html
<title>Optimal Escape Location - Book Your Experience | BookingTMS</title>
<meta name="description" content="Experience mind-bending puzzles..." />
<meta name="keywords" content="escape room, booking, entertainment..." />

<!-- Open Graph (Facebook) -->
<meta property="og:type" content="business.business" />
<meta property="og:url" content="https://bookingtms.com/optimal-escape-location" />
<meta property="og:title" content="Optimal Escape Location" />
<meta property="og:image" content="[cover_image_url]" />

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:title" content="Optimal Escape Location" />

<!-- Canonical -->
<link rel="canonical" href="https://bookingtms.com/optimal-escape-location" />
```

### 2. Structured Data (Schema.org)

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://bookingtms.com/optimal-escape-location",
  "name": "Optimal Escape Location",
  "description": "Mind-bending puzzles and thrilling adventures",
  "image": "[cover_image_url]",
  "logo": "[logo_url]",
  "url": "https://bookingtms.com/optimal-escape-location",
  "telephone": "+1-555-123-4567",
  "email": "contact@example.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Mystery Lane"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127"
  }
}
```

### 3. AI Search Engine Optimization

**For ChatGPT, Claude, Perplexity, etc.:**

✅ **Clean URLs**: `bookingtms.com/venue-name` (no UUIDs or query params)  
✅ **Semantic HTML**: Proper heading hierarchy (H1, H2, H3)  
✅ **Structured Data**: JSON-LD schema markup  
✅ **Descriptive Content**: Rich descriptions, keywords  
✅ **Fast Loading**: Optimized images, lazy loading  
✅ **Mobile-First**: Responsive design  
✅ **Accessibility**: ARIA labels, alt text  

---

## Routing Architecture

### React Router Configuration

```typescript
// router.tsx
export const router = createBrowserRouter([
  {
    path: '/:slug',
    element: <VenueProfile />, // Public profile
  },
  {
    path: '/:slug/admin',
    element: <OwnerAdminLogin />, // Admin login
  },
  {
    path: '/:slug/admin/dashboard',
    element: <OwnerAdminDashboard />, // Admin dashboard
  },
]);
```

### Page Components

| Component | Route | Purpose |
|-----------|-------|---------|
| `VenueProfile.tsx` | `/:slug` | Public venue profile (SEO-optimized) |
| `OwnerAdminLogin.tsx` | `/:slug/admin` | Owner authentication |
| `OwnerAdminDashboard.tsx` | `/:slug/admin/dashboard` | Owner dashboard |

---

## Authentication Flow

### Owner Login Process

1. **Navigate**: `bookingtms.com/optimal-escape-location/admin`
2. **Enter**: Email + Password
3. **Verify**: 
   - Authenticate with Supabase Auth
   - Check `organization_members` table
   - Verify `role = 'owner'`
   - Confirm slug matches
4. **Redirect**: `bookingtms.com/optimal-escape-location/admin/dashboard`

### Security

- ✅ RLS policies enforce data isolation
- ✅ Users can only access organizations they own
- ✅ Admin routes require authentication
- ✅ Slug validation prevents unauthorized access

---

## Sitemap Generation

Generate `sitemap.xml` for search engines:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://bookingtms.com/optimal-escape-location</loc>
    <lastmod>2024-11-17</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- More venue URLs -->
</urlset>
```

**Auto-generate on deploy:**
- Query all `organizations` with `status = 'active'`
- Generate `<url>` entries for each slug
- Upload to `/public/sitemap.xml`
- Submit to Google Search Console

---

## Migration Path

### From Old System

**Old URL:**
```
bookingtms.com/v/venue-uuid-1234
```

**New URL:**
```
bookingtms.com/optimal-escape-location
```

**Migration Steps:**

1. ✅ Run slug generation migration
2. ✅ Update all internal links
3. ✅ Add 301 redirects from old URLs
4. ✅ Update sitemap.xml
5. ✅ Submit to search engines

---

## Best Practices

### 1. Slug Design
- ✅ Use business name (not generic)
- ✅ Keep it short (< 50 characters)
- ✅ Readable and memorable
- ✅ No special characters or spaces
- ✅ Hyphen-separated words

### 2. SEO
- ✅ Unique page titles
- ✅ Compelling meta descriptions
- ✅ High-quality images with alt text
- ✅ Fast page load times
- ✅ Mobile-responsive
- ✅ HTTPS enabled

### 3. Performance
- ✅ CDN for static assets
- ✅ Image optimization
- ✅ Lazy loading
- ✅ Code splitting
- ✅ Server-side rendering (future)

---

## Testing

### Manual Testing

1. **Create organization**: "Test Escape Room"
2. **Verify slug**: `test-escape-room`
3. **Visit**: `localhost:5173/test-escape-room`
4. **Check**:
   - Page loads correctly
   - Meta tags are present
   - Structured data is valid
5. **Visit**: `localhost:5173/test-escape-room/admin`
6. **Login** with owner credentials
7. **Verify** redirect to dashboard

### Automated Testing

```typescript
describe('Slug-based Routing', () => {
  it('generates correct slug from organization name', () => {
    const slug = generateSlug('Optimal Escape Location');
    expect(slug).toBe('optimal-escape-location');
  });

  it('handles duplicate slugs', async () => {
    const slug1 = await createOrganization({ name: 'Test' });
    const slug2 = await createOrganization({ name: 'Test' });
    expect(slug2).toBe('test-2');
  });

  it('loads venue profile by slug', async () => {
    const response = await fetch('/optimal-escape-location');
    expect(response.status).toBe(200);
  });
});
```

---

## Future Enhancements

### 1. Custom Domains
```
optimal-escape.com → bookingtms.com/optimal-escape-location
```

### 2. Multilingual Slugs
```
bookingtms.com/fr/optimal-escape-location
```

### 3. Slug History
- Track slug changes
- Maintain 301 redirects
- Preserve SEO value

### 4. Vanity URLs
- Premium feature
- Custom slugs
- Brand protection

---

## Support

For questions or issues:
- **Email**: support@bookingtms.com
- **Docs**: https://docs.bookingtms.com
- **GitHub**: https://github.com/bookingtms

---

## Changelog

### v0.2.0 - 2024-11-17
- ✅ Added slug-based routing
- ✅ Implemented SEO optimization
- ✅ Created owner admin login portal
- ✅ Added Schema.org markup
- ✅ Generated sitemap support

---

**This architecture follows industry best practices used by Shopify, Calendly, Square, and other leading SaaS platforms.**
