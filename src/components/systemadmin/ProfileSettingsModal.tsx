import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useTheme } from '../layout/ThemeContext';
import { toast } from 'sonner';
import { ProfileEmbedSettings } from './ProfileEmbedSettings';
import { LandingPageEditor } from './LandingPageEditor';
import { LandingPagePreview } from './LandingPagePreview';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  owner: {
    id: number;
    ownerName: string;
    organizationName: string;
    organizationId: string;
    website: string;
    email: string;
    profileSlug: string;
  };
}

export const ProfileSettingsModal = ({ isOpen, onClose, owner }: ProfileSettingsModalProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState({
    organizationName: owner.organizationName,
    tagline: 'Mind-Bending Puzzles & Thrilling Adventures',
    description: 'Experience the ultimate escape room challenge with our award-winning games.',
    website: owner.website,
    phone: '+1 (555) 123-4567',
    email: owner.email,
    address: '123 Mystery Lane, New York, NY 10001',
    coverImage: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=1200&h=600&fit=crop',
    logoImage: 'https://images.unsplash.com/photo-1472289065668-ce650ac443d2?w=400&h=400&fit=crop',
    facebook: '',
    twitter: '',
    instagram: '',
    weekdayHours: '10:00 AM - 10:00 PM',
    weekendHours: '9:00 AM - 11:00 PM',
    games: [],
  });

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(`landingPage_${owner.profileSlug}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData({ ...formData, ...parsed });
      } catch (e) {
        console.error('Error loading saved landing page data:', e);
      }
    }
  }, [owner.profileSlug]);

  // Theme classes
  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem(`landingPage_${owner.profileSlug}`, JSON.stringify(formData));
    toast.success('Profile settings saved successfully');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`${bgClass} rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${borderColor}`}>
          <div>
            <h2 className={`text-2xl font-bold ${textClass}`}>Profile Settings</h2>
            <p className={`text-sm ${mutedTextClass} mt-1`}>
              {owner.ownerName} • {owner.organizationId}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-gray-100'} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-4 w-full mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="landing">Landing Page</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="embed">Embed</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6 mt-0">
              {/* Organization Name */}
              <div className="space-y-2">
                <Label className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Organization Name *
                </Label>
                <Input
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  className={`h-12 ${isDark ? 'bg-[#1a1a1a] border-[#333]' : 'bg-gray-100 border-gray-300'} ${isDark ? 'text-white' : 'text-gray-900'} placeholder:text-gray-500`}
                />
              </div>

              {/* Tagline */}
              <div className="space-y-2">
                <Label className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tagline
                </Label>
                <Input
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g., Mind-Bending Puzzles & Thrilling Adventures"
                  className={`h-12 ${isDark ? 'bg-[#1a1a1a] border-[#333]' : 'bg-gray-100 border-gray-300'} ${isDark ? 'text-white' : 'text-gray-900'} placeholder:text-gray-500`}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className={`${isDark ? 'bg-[#1a1a1a] border-[#333]' : 'bg-gray-100 border-gray-300'} ${isDark ? 'text-white' : 'text-gray-900'} placeholder:text-gray-500`}
                />
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Website
                </Label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                  className={`h-12 ${isDark ? 'bg-[#1a1a1a] border-[#333]' : 'bg-gray-100 border-gray-300'} ${isDark ? 'text-white' : 'text-gray-900'} placeholder:text-gray-500`}
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Phone
                  </Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`h-12 ${isDark ? 'bg-[#1a1a1a] border-[#333]' : 'bg-gray-100 border-gray-300'} ${isDark ? 'text-white' : 'text-gray-900'} placeholder:text-gray-500`}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`h-12 ${isDark ? 'bg-[#1a1a1a] border-[#333]' : 'bg-gray-100 border-gray-300'} ${isDark ? 'text-white' : 'text-gray-900'} placeholder:text-gray-500`}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Address
                </Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`h-12 ${isDark ? 'bg-[#1a1a1a] border-[#333]' : 'bg-gray-100 border-gray-300'} ${isDark ? 'text-white' : 'text-gray-900'} placeholder:text-gray-500`}
                />
              </div>

              {/* Profile URL */}
              <div className="space-y-2">
                <Label className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Profile URL
                </Label>
                <div className={`flex items-center gap-2 p-3 rounded-lg ${isDark ? 'bg-[#1a1a1a] border border-[#333]' : 'bg-gray-100 border border-gray-300'}`}>
                  <span className={mutedTextClass}>
                    {window.location.origin}/v/{owner.profileSlug}
                  </span>
                </div>
              </div>
            </TabsContent>

            {/* Landing Page Editor Tab */}
            <TabsContent value="landing" className="mt-0">
              <LandingPageEditor formData={formData} setFormData={setFormData} />
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="mt-0">
              <LandingPagePreview venueSlug={owner.profileSlug} formData={formData} />
            </TabsContent>

            {/* Embed Tab */}
            <TabsContent value="embed" className="mt-0">
              <ProfileEmbedSettings owner={owner} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end gap-3 p-6 border-t ${borderColor}`}>
          <Button
            variant="outline"
            onClick={onClose}
            className={`${isDark ? 'border-[#333] text-white hover:bg-[#1a1a1a]' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
