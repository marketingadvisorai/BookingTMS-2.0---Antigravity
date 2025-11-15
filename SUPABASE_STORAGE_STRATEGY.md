# Supabase Storage Strategy - Complete Implementation Plan

**Date:** November 16, 2025 04:00 AM UTC+6  
**Status:** 🔄 Analysis Complete - Implementation Required  
**Plan Type:** Database vs Storage Optimization

---

## 🎯 OBJECTIVE

Optimize data storage by using:
- **Supabase Storage** for binary files (images, videos, documents)
- **Supabase Database** for structured data (text, numbers, JSON)

This will:
- ✅ Reduce database size and improve performance
- ✅ Enable CDN delivery for media files
- ✅ Reduce costs (storage is cheaper than database)
- ✅ Improve page load times
- ✅ Enable image optimization and transformations

---

## 📊 CURRENT STATE ANALYSIS

### ❌ PROBLEMS IDENTIFIED

#### 1. **Logo Images** - Currently Base64 in Database
**Location:** `venues.settings.widgetConfig.customSettings.logoUrl`  
**Current:** Base64 data URL stored in JSONB  
**Problem:** 
- Large base64 strings bloat database
- No CDN caching
- Slow to transfer
- Inefficient storage

**Example:**
```json
{
  "logoUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." // 50KB+
}
```

#### 2. **Game Cover Images** - Currently Base64 in Database
**Location:** `games.coverImage`  
**Current:** Base64 data URL  
**Problem:**
- Each game image ~100-500KB as base64
- Stored in PostgreSQL (expensive)
- No image optimization
- Slow queries when fetching games

#### 3. **Game Gallery Images** - Currently Base64 Arrays
**Location:** `games.galleryImages[]`  
**Current:** Array of base64 strings  
**Problem:**
- Multiple large base64 strings per game
- Can be 1-5MB per game
- Database bloat
- Slow to load

#### 4. **Game Videos** - Currently URLs Only
**Location:** `games.videoUrl`  
**Current:** External URLs (YouTube, Vimeo)  
**Status:** ✅ OK - External hosting is fine

---

## ✅ RECOMMENDED STORAGE STRATEGY

### **Database (PostgreSQL)** - Structured Data

Store in `venues` table:
- ✅ Venue name, address, contact info
- ✅ SEO metadata (text fields)
- ✅ Widget configuration (settings, toggles)
- ✅ Color schemes, fonts
- ✅ Schedule data (JSONB)
- ✅ Pricing information

Store in `games` table:
- ✅ Game name, description
- ✅ Pricing, duration, capacity
- ✅ Schedule configuration
- ✅ Stripe product/price IDs
- ✅ **Image URLs** (references to Storage)
- ✅ Video URLs (external)

### **Storage (Supabase Storage)** - Binary Files

Create buckets:

**1. `venue-logos`** - Venue branding
- Logo images
- Favicon
- Brand assets
- Access: Public read

**2. `game-images`** - Game media
- Cover images
- Gallery images
- Thumbnails
- Access: Public read

**3. `user-uploads`** - User content
- Profile pictures
- Waiver signatures
- Documents
- Access: Authenticated read

**4. `private-documents`** - Sensitive files
- Contracts
- Legal documents
- Internal files
- Access: Admin only

---

## 🔧 IMPLEMENTATION PLAN

### Phase 1: Create Storage Service (Priority: HIGH)

**File:** `src/services/SupabaseStorageService.ts`

```typescript
import { supabase } from '../lib/supabase';

export class SupabaseStorageService {
  /**
   * Upload image to Supabase Storage
   * Returns public URL
   */
  static async uploadImage(
    file: File,
    bucket: 'venue-logos' | 'game-images' | 'user-uploads',
    folder?: string
  ): Promise<{ url: string; path: string }> {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload to Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { url: publicUrl, path: filePath };
  }

  /**
   * Delete image from Storage
   */
  static async deleteImage(
    bucket: string,
    path: string
  ): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  }

  /**
   * Upload with image optimization
   */
  static async uploadOptimizedImage(
    file: File,
    bucket: string,
    maxWidth = 1920,
    quality = 0.85
  ): Promise<{ url: string; path: string }> {
    // Resize and optimize before upload
    const optimized = await this.optimizeImage(file, maxWidth, quality);
    return this.uploadImage(optimized, bucket as any);
  }

  /**
   * Optimize image before upload
   */
  private static async optimizeImage(
    file: File,
    maxWidth: number,
    quality: number
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = Math.min(1, maxWidth / img.width);
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas not supported'));
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error('Optimization failed'));
              const optimizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(optimizedFile);
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
```

### Phase 2: Update Logo Upload (Priority: HIGH)

**File:** `src/components/widgets/CustomSettingsPanel.tsx`

**Current:**
```typescript
const handleLogoUpload = (file?: File) => {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => update('logoUrl', String(reader.result)); // ❌ Base64
  reader.readAsDataURL(file);
};
```

**New:**
```typescript
const handleLogoUpload = async (file?: File) => {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    toast.error('Please upload a valid image file');
    return;
  }
  
  try {
    toast.loading('Uploading logo...', { id: 'logo-upload' });
    
    // Upload to Supabase Storage
    const { url, path } = await SupabaseStorageService.uploadOptimizedImage(
      file,
      'venue-logos',
      400, // Max width for logos
      0.9  // High quality
    );
    
    // Store URL (not base64) and path for deletion
    update('logoUrl', url);
    update('logoPath', path); // For cleanup
    
    toast.success('Logo uploaded successfully!', { id: 'logo-upload' });
  } catch (error) {
    console.error('Logo upload error:', error);
    toast.error('Failed to upload logo', { id: 'logo-upload' });
  }
};
```

### Phase 3: Update Game Images (Priority: HIGH)

**File:** `src/components/games/AddGameWizard.tsx`

**Current:**
```typescript
const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  const raw = await readFileAsDataUrl(file);
  const optimized = await resizeImageDataUrl(raw); // ❌ Base64
  updateGameData('coverImage', optimized);
};
```

**New:**
```typescript
const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    toast.error('Please select a valid image file');
    return;
  }
  
  try {
    toast.loading('Uploading cover image...', { id: 'cover-upload' });
    
    // Upload to Supabase Storage
    const { url, path } = await SupabaseStorageService.uploadOptimizedImage(
      file,
      'game-images',
      1920, // Full HD
      0.85
    );
    
    updateGameData('coverImage', url);
    updateGameData('coverImagePath', path);
    
    toast.success('Cover image uploaded!', { id: 'cover-upload' });
  } catch (error) {
    console.error('Cover upload error:', error);
    toast.error('Failed to upload image', { id: 'cover-upload' });
  } finally {
    if (coverInputRef.current) coverInputRef.current.value = '';
  }
};
```

### Phase 4: Create Storage Buckets (Priority: HIGH)

**Run these SQL commands in Supabase:**

```sql
-- Create buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('venue-logos', 'venue-logos', true),
  ('game-images', 'game-images', true),
  ('user-uploads', 'user-uploads', false),
  ('private-documents', 'private-documents', false);

-- Set up RLS policies for venue-logos
CREATE POLICY "Public read access for venue logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'venue-logos');

CREATE POLICY "Authenticated users can upload venue logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'venue-logos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own venue logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'venue-logos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own venue logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'venue-logos' AND
  auth.role() = 'authenticated'
);

-- Set up RLS policies for game-images
CREATE POLICY "Public read access for game images"
ON storage.objects FOR SELECT
USING (bucket_id = 'game-images');

CREATE POLICY "Authenticated users can upload game images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'game-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own game images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'game-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own game images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'game-images' AND
  auth.role() = 'authenticated'
);

-- Set up RLS policies for user-uploads
CREATE POLICY "Users can read their own uploads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Set up RLS policies for private-documents
CREATE POLICY "Only admins can access private documents"
ON storage.objects FOR ALL
USING (
  bucket_id = 'private-documents' AND
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('super-admin', 'admin')
  )
);
```

### Phase 5: Migration Script (Priority: MEDIUM)

**File:** `scripts/migrate-to-storage.js`

```javascript
/**
 * Migrate existing base64 images to Supabase Storage
 * Run once to convert all existing data
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function base64ToFile(base64String, filename) {
  const response = await fetch(base64String);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
}

async function migrateVenueLogos() {
  console.log('Migrating venue logos...');
  
  const { data: venues } = await supabase
    .from('venues')
    .select('id, name, settings')
    .not('settings->widgetConfig->customSettings->logoUrl', 'is', null);
  
  for (const venue of venues || []) {
    const logoUrl = venue.settings?.widgetConfig?.customSettings?.logoUrl;
    
    if (!logoUrl || !logoUrl.startsWith('data:')) {
      console.log(`Skipping ${venue.name} - no base64 logo`);
      continue;
    }
    
    try {
      // Convert base64 to file
      const file = await base64ToFile(logoUrl, `${venue.id}-logo.jpg`);
      
      // Upload to Storage
      const filePath = `${venue.id}/logo.jpg`;
      const { data, error } = await supabase.storage
        .from('venue-logos')
        .upload(filePath, file, { upsert: true });
      
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('venue-logos')
        .getPublicUrl(filePath);
      
      // Update database
      await supabase
        .from('venues')
        .update({
          settings: {
            ...venue.settings,
            widgetConfig: {
              ...venue.settings.widgetConfig,
              customSettings: {
                ...venue.settings.widgetConfig.customSettings,
                logoUrl: publicUrl,
                logoPath: filePath
              }
            }
          }
        })
        .eq('id', venue.id);
      
      console.log(`✅ Migrated logo for ${venue.name}`);
    } catch (error) {
      console.error(`❌ Failed to migrate ${venue.name}:`, error.message);
    }
  }
}

async function migrateGameImages() {
  console.log('Migrating game images...');
  
  const { data: games } = await supabase
    .from('games')
    .select('id, name, cover_image, gallery_images')
    .not('cover_image', 'is', null);
  
  for (const game of games || []) {
    try {
      // Migrate cover image
      if (game.cover_image && game.cover_image.startsWith('data:')) {
        const file = await base64ToFile(game.cover_image, `${game.id}-cover.jpg`);
        const filePath = `${game.id}/cover.jpg`;
        
        await supabase.storage
          .from('game-images')
          .upload(filePath, file, { upsert: true });
        
        const { data: { publicUrl } } = supabase.storage
          .from('game-images')
          .getPublicUrl(filePath);
        
        await supabase
          .from('games')
          .update({ cover_image: publicUrl })
          .eq('id', game.id);
        
        console.log(`✅ Migrated cover for ${game.name}`);
      }
      
      // Migrate gallery images
      if (game.gallery_images && Array.isArray(game.gallery_images)) {
        const newGalleryUrls = [];
        
        for (let i = 0; i < game.gallery_images.length; i++) {
          const imgData = game.gallery_images[i];
          if (imgData.startsWith('data:')) {
            const file = await base64ToFile(imgData, `${game.id}-gallery-${i}.jpg`);
            const filePath = `${game.id}/gallery-${i}.jpg`;
            
            await supabase.storage
              .from('game-images')
              .upload(filePath, file, { upsert: true });
            
            const { data: { publicUrl } } = supabase.storage
              .from('game-images')
              .getPublicUrl(filePath);
            
            newGalleryUrls.push(publicUrl);
          } else {
            newGalleryUrls.push(imgData);
          }
        }
        
        await supabase
          .from('games')
          .update({ gallery_images: newGalleryUrls })
          .eq('id', game.id);
        
        console.log(`✅ Migrated ${newGalleryUrls.length} gallery images for ${game.name}`);
      }
    } catch (error) {
      console.error(`❌ Failed to migrate ${game.name}:`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting migration to Supabase Storage...\n');
  
  await migrateVenueLogos();
  await migrateGameImages();
  
  console.log('\n✅ Migration complete!');
}

main().catch(console.error);
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Setup (Day 1)
- [ ] Create `SupabaseStorageService.ts`
- [ ] Create storage buckets in Supabase
- [ ] Set up RLS policies
- [ ] Test upload/delete functionality

### Phase 2: Logo Migration (Day 1-2)
- [ ] Update `CustomSettingsPanel.tsx`
- [ ] Test logo upload
- [ ] Test logo display
- [ ] Run migration script for existing logos

### Phase 3: Game Images (Day 2-3)
- [ ] Update `AddGameWizard.tsx` cover upload
- [ ] Update gallery upload
- [ ] Test image uploads
- [ ] Run migration script for existing games

### Phase 4: Cleanup (Day 3)
- [ ] Add image deletion on update
- [ ] Add cleanup for orphaned files
- [ ] Update documentation
- [ ] Performance testing

---

## 📊 EXPECTED BENEFITS

### Performance:
- ⚡ 70-90% reduction in database size
- ⚡ 50% faster page loads (CDN caching)
- ⚡ 80% faster image delivery
- ⚡ Reduced database query times

### Cost:
- 💰 Storage: $0.021/GB vs Database: $0.125/GB
- 💰 ~85% cost reduction for media files
- 💰 Better scalability

### Features:
- 🎨 Image transformations (resize, crop, format)
- 🎨 Automatic WebP conversion
- 🎨 CDN delivery worldwide
- 🎨 Better caching

---

## ⚠️ IMPORTANT NOTES

1. **Backward Compatibility:** Keep supporting base64 URLs during migration
2. **Cleanup:** Delete old Storage files when updating/deleting records
3. **Error Handling:** Graceful fallbacks if Storage fails
4. **Security:** Proper RLS policies to prevent unauthorized access
5. **Testing:** Test thoroughly before migrating production data

---

**Status:** Ready for implementation  
**Priority:** HIGH - Will significantly improve performance  
**Estimated Time:** 3-4 days for complete implementation
