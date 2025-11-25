import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Upload, X, Image as ImageIcon, Film, Loader2 } from 'lucide-react';
import { StepProps } from '../types';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

// Constants
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

export default function Step4MediaUpload({ activityData, updateActivityData, t }: StepProps) {
    const [uploading, setUploading] = useState(false);

    /**
     * Validate file before upload
     */
    const validateFile = (file: File): string | null => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return `Invalid file type: ${file.type}. Allowed: JPG, PNG, GIF, WebP, SVG`;
        }
        if (file.size > MAX_FILE_SIZE) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            return `File too large: ${sizeMB}MB. Maximum: 2MB`;
        }
        return null;
    };

    /**
     * Upload file to Supabase storage
     */
    const uploadFile = async (file: File): Promise<string | null> => {
        // Validate file first
        const validationError = validateFile(file);
        if (validationError) {
            toast.error(validationError);
            return null;
        }

        try {
            const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
            // Use activities folder with timestamp for organization
            const filePath = `activities/${fileName}`;

            console.log('📤 Uploading file:', file.name, 'to', filePath);

            const { data, error: uploadError } = await supabase.storage
                .from('activity-images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('Upload error details:', uploadError);
                // Provide more specific error messages
                if (uploadError.message?.includes('Payload too large')) {
                    toast.error('File too large. Maximum size is 2MB.');
                } else if (uploadError.message?.includes('not allowed')) {
                    toast.error('File type not allowed. Use JPG, PNG, GIF, WebP, or SVG.');
                } else if (uploadError.message?.includes('row-level security')) {
                    toast.error('Permission denied. Please ensure you are logged in.');
                } else {
                    toast.error(`Upload failed: ${uploadError.message}`);
                }
                return null;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('activity-images')
                .getPublicUrl(filePath);

            console.log('✅ Upload successful:', urlData.publicUrl);
            return urlData.publicUrl;
        } catch (error: any) {
            console.error('Error uploading file:', error);
            toast.error(error?.message || 'Failed to upload image. Please try again.');
            return null;
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'coverImage' | 'galleryImages') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            if (field === 'coverImage') {
                const file = files[0];
                const url = await uploadFile(file);
                if (url) {
                    updateActivityData('coverImage', url);
                    toast.success('Cover image uploaded');
                }
            } else {
                const uploadPromises = Array.from(files).map(file => uploadFile(file));
                const urls = await Promise.all(uploadPromises);
                const validUrls = urls.filter((url): url is string => url !== null);

                if (validUrls.length > 0) {
                    updateActivityData('galleryImages', [...activityData.galleryImages, ...validUrls]);
                    toast.success(`${validUrls.length} image(s) uploaded`);
                }
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('An error occurred during upload');
        } finally {
            setUploading(false);
            // Reset input value to allow selecting the same file again
            e.target.value = '';
        }
    };

    const removeGalleryImage = (index: number) => {
        const newImages = activityData.galleryImages.filter((_, i) => i !== index);
        updateActivityData('galleryImages', newImages);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Media & Visuals</CardTitle>
                    <CardDescription>
                        Upload images and videos to showcase your {t.singular.toLowerCase()}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Cover Image */}
                    <div>
                        <Label className="mb-2 block">Cover Image <span className="text-red-500">*</span></Label>
                        <div className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors relative ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                            <Input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                onChange={(e) => handleImageUpload(e, 'coverImage')}
                                disabled={uploading}
                            />
                            {uploading && !activityData.coverImage ? (
                                <div className="flex flex-col items-center justify-center py-4">
                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                                    <p className="text-sm text-gray-500">Uploading...</p>
                                </div>
                            ) : activityData.coverImage ? (
                                <div className="relative h-48 w-full">
                                    <img
                                        src={activityData.coverImage}
                                        alt="Cover"
                                        className="h-full w-full object-cover rounded-md"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                                        <p className="text-white font-medium">Click to change</p>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8 z-10"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            updateActivityData('coverImage', '');
                                        }}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-4">
                                    <div className="bg-blue-100 p-3 rounded-full mb-3">
                                        <Upload className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">Click to upload cover image</p>
                                    <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-4">
                            <Label htmlFor="coverImageUrl" className="mb-2 block text-sm text-gray-500">Or enter image URL directly</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="coverImageUrl"
                                    placeholder="https://example.com/image.jpg"
                                    value={activityData.coverImage && activityData.coverImage.startsWith('http') ? activityData.coverImage : ''}
                                    onChange={(e) => updateActivityData('coverImage', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Gallery Images */}
                    <div>
                        <Label className="mb-2 block">Gallery Images</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {activityData.galleryImages.map((img, index) => (
                                <div key={index} className="relative group aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                    <img src={img} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeGalleryImage(index)}
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                            <div className={`border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center aspect-video hover:bg-gray-50 relative ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                    onChange={(e) => handleImageUpload(e, 'galleryImages')}
                                    disabled={uploading}
                                />
                                {uploading ? (
                                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                                ) : (
                                    <>
                                        <ImageIcon className="w-6 h-6 text-gray-400 mb-2" />
                                        <span className="text-xs text-gray-500">Add Images</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Video URL */}
                    <div>
                        <Label htmlFor="video">Promotional Video URL (YouTube/Vimeo)</Label>
                        <div className="flex gap-2 mt-1">
                            <div className="relative flex-1">
                                <Film className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    id="video"
                                    placeholder="https://youtube.com/watch?v=..."
                                    className="pl-9"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const target = e.target as HTMLInputElement;
                                            if (target.value) {
                                                updateActivityData('videos', [...activityData.videos, target.value]);
                                                target.value = '';
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const input = document.getElementById('video') as HTMLInputElement;
                                    if (input.value) {
                                        updateActivityData('videos', [...activityData.videos, input.value]);
                                        input.value = '';
                                    }
                                }}
                            >
                                Add
                            </Button>
                        </div>
                        <div className="mt-3 space-y-2">
                            {activityData.videos.map((video, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                                    <div className="flex items-center truncate mr-2">
                                        <Film className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                                        <span className="truncate text-gray-600">{video}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            const newVideos = activityData.videos.filter((_, i) => i !== index);
                                            updateActivityData('videos', newVideos);
                                        }}
                                        className="h-6 w-6 text-gray-400 hover:text-red-500"
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
