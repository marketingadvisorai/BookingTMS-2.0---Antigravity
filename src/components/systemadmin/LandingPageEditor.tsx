import { useState } from 'react';
import { useTheme } from '../layout/ThemeContext';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { 
  Image, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Plus, 
  Trash2,
  Upload,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react';
import { toast } from 'sonner';

interface Game {
  id: number;
  name: string;
  description: string;
  coverImage: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  duration: number;
  minPlayers: number;
  maxPlayers: number;
  price: number;
}

interface LandingPageEditorProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const LandingPageEditor = ({ formData, setFormData }: LandingPageEditorProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [games, setGames] = useState<Game[]>(formData.games || []);

  // Theme classes
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const labelClass = isDark ? 'text-gray-300' : 'text-gray-700';
  const inputClass = `h-12 ${isDark ? 'bg-[#1a1a1a] border-[#333] text-white' : 'bg-gray-100 border-gray-300 text-gray-900'} placeholder:text-gray-500`;
  const textareaClass = `${isDark ? 'bg-[#1a1a1a] border-[#333] text-white' : 'bg-gray-100 border-gray-300 text-gray-900'} placeholder:text-gray-500`;
  const cardBg = isDark ? 'bg-[#1a1a1a]' : 'bg-gray-50';
  const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';

  const handleAddGame = () => {
    const newGame: Game = {
      id: Date.now(),
      name: 'New Game',
      description: 'Enter game description here...',
      coverImage: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=800&h=600&fit=crop',
      difficulty: 'Medium',
      duration: 60,
      minPlayers: 2,
      maxPlayers: 8,
      price: 30,
    };
    const updatedGames = [...games, newGame];
    setGames(updatedGames);
    setFormData({ ...formData, games: updatedGames });
    toast.success('Game added');
  };

  const handleRemoveGame = (id: number) => {
    const updatedGames = games.filter(g => g.id !== id);
    setGames(updatedGames);
    setFormData({ ...formData, games: updatedGames });
    toast.success('Game removed');
  };

  const handleGameChange = (id: number, field: string, value: any) => {
    const updatedGames = games.map(g => 
      g.id === id ? { ...g, [field]: value } : g
    );
    setGames(updatedGames);
    setFormData({ ...formData, games: updatedGames });
  };

  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <div>
        <h3 className={`text-lg font-semibold ${textClass} mb-4`}>Basic Information</h3>
        <div className="space-y-4">
          {/* Organization Name */}
          <div className="space-y-2">
            <Label className={labelClass}>Organization Name *</Label>
            <Input
              value={formData.organizationName}
              onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
              placeholder="e.g., Riddle Me This Escape Rooms"
              className={inputClass}
            />
          </div>

          {/* Tagline */}
          <div className="space-y-2">
            <Label className={labelClass}>Tagline</Label>
            <Input
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="e.g., Mind-Bending Puzzles & Thrilling Adventures"
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className={labelClass}>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell visitors about your escape room venue..."
              rows={4}
              className={textareaClass}
            />
          </div>
        </div>
      </div>

      {/* Media */}
      <div>
        <h3 className={`text-lg font-semibold ${textClass} mb-4 flex items-center gap-2`}>
          <Image className="w-5 h-5" />
          Media
        </h3>
        <div className="space-y-4">
          {/* Cover Image */}
          <div className="space-y-2">
            <Label className={labelClass}>Cover Image URL</Label>
            <Input
              value={formData.coverImage || ''}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              placeholder="https://example.com/cover.jpg"
              className={inputClass}
            />
            {formData.coverImage && (
              <div className="mt-2 rounded-lg overflow-hidden">
                <img 
                  src={formData.coverImage} 
                  alt="Cover preview" 
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=1200&h=600&fit=crop';
                  }}
                />
              </div>
            )}
          </div>

          {/* Logo Image */}
          <div className="space-y-2">
            <Label className={labelClass}>Logo Image URL</Label>
            <Input
              value={formData.logoImage || ''}
              onChange={(e) => setFormData({ ...formData, logoImage: e.target.value })}
              placeholder="https://example.com/logo.jpg"
              className={inputClass}
            />
            {formData.logoImage && (
              <div className="mt-2">
                <img 
                  src={formData.logoImage} 
                  alt="Logo preview" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-[#333]"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1472289065668-ce650ac443d2?w=400&h=400&fit=crop';
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className={`text-lg font-semibold ${textClass} mb-4 flex items-center gap-2`}>
          <Phone className="w-5 h-5" />
          Contact Information
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div className="space-y-2">
              <Label className={labelClass}>Phone</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className={labelClass}>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="info@example.com"
                className={inputClass}
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label className={labelClass}>Address</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Mystery Lane, New York, NY 10001"
              className={inputClass}
            />
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label className={labelClass}>Website</Label>
            <Input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div>
        <h3 className={`text-lg font-semibold ${textClass} mb-4`}>Social Media</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className={labelClass}>
              <Facebook className="w-4 h-4 inline mr-2" />
              Facebook
            </Label>
            <Input
              value={formData.facebook || ''}
              onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
              placeholder="https://facebook.com/yourpage"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label className={labelClass}>
              <Twitter className="w-4 h-4 inline mr-2" />
              Twitter
            </Label>
            <Input
              value={formData.twitter || ''}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
              placeholder="https://twitter.com/yourpage"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label className={labelClass}>
              <Instagram className="w-4 h-4 inline mr-2" />
              Instagram
            </Label>
            <Input
              value={formData.instagram || ''}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              placeholder="https://instagram.com/yourpage"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Opening Hours */}
      <div>
        <h3 className={`text-lg font-semibold ${textClass} mb-4 flex items-center gap-2`}>
          <Clock className="w-5 h-5" />
          Opening Hours
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className={labelClass}>Weekday Hours</Label>
            <Input
              value={formData.weekdayHours || '10:00 AM - 10:00 PM'}
              onChange={(e) => setFormData({ ...formData, weekdayHours: e.target.value })}
              placeholder="10:00 AM - 10:00 PM"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label className={labelClass}>Weekend Hours</Label>
            <Input
              value={formData.weekendHours || '9:00 AM - 11:00 PM'}
              onChange={(e) => setFormData({ ...formData, weekendHours: e.target.value })}
              placeholder="9:00 AM - 11:00 PM"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Games/Rooms */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${textClass}`}>Escape Rooms / Games</h3>
          <Button
            onClick={handleAddGame}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Game
          </Button>
        </div>

        <div className="space-y-4">
          {games.length === 0 ? (
            <div className={`p-8 rounded-lg ${cardBg} border ${borderColor} text-center`}>
              <p className={mutedTextClass}>No games added yet. Click "Add Game" to create your first escape room.</p>
            </div>
          ) : (
            games.map((game, index) => (
              <div key={game.id} className={`p-6 rounded-lg ${cardBg} border ${borderColor} space-y-4`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`font-semibold ${textClass}`}>Game {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveGame(game.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Game Name */}
                  <div className="space-y-2">
                    <Label className={labelClass}>Game Name *</Label>
                    <Input
                      value={game.name}
                      onChange={(e) => handleGameChange(game.id, 'name', e.target.value)}
                      placeholder="e.g., The Haunted Mansion"
                      className={inputClass}
                    />
                  </div>

                  {/* Difficulty */}
                  <div className="space-y-2">
                    <Label className={labelClass}>Difficulty</Label>
                    <select
                      value={game.difficulty}
                      onChange={(e) => handleGameChange(game.id, 'difficulty', e.target.value)}
                      className={`w-full ${inputClass}`}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label className={labelClass}>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={game.duration}
                      onChange={(e) => handleGameChange(game.id, 'duration', parseInt(e.target.value))}
                      className={inputClass}
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <Label className={labelClass}>Price ($)</Label>
                    <Input
                      type="number"
                      value={game.price}
                      onChange={(e) => handleGameChange(game.id, 'price', parseInt(e.target.value))}
                      className={inputClass}
                    />
                  </div>

                  {/* Min Players */}
                  <div className="space-y-2">
                    <Label className={labelClass}>Min Players</Label>
                    <Input
                      type="number"
                      value={game.minPlayers}
                      onChange={(e) => handleGameChange(game.id, 'minPlayers', parseInt(e.target.value))}
                      className={inputClass}
                    />
                  </div>

                  {/* Max Players */}
                  <div className="space-y-2">
                    <Label className={labelClass}>Max Players</Label>
                    <Input
                      type="number"
                      value={game.maxPlayers}
                      onChange={(e) => handleGameChange(game.id, 'maxPlayers', parseInt(e.target.value))}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className={labelClass}>Description</Label>
                  <Textarea
                    value={game.description}
                    onChange={(e) => handleGameChange(game.id, 'description', e.target.value)}
                    rows={3}
                    placeholder="Describe the game experience..."
                    className={textareaClass}
                  />
                </div>

                {/* Cover Image */}
                <div className="space-y-2">
                  <Label className={labelClass}>Cover Image URL</Label>
                  <Input
                    value={game.coverImage}
                    onChange={(e) => handleGameChange(game.id, 'coverImage', e.target.value)}
                    placeholder="https://example.com/game-cover.jpg"
                    className={inputClass}
                  />
                  {game.coverImage && (
                    <div className="mt-2 rounded-lg overflow-hidden">
                      <img 
                        src={game.coverImage} 
                        alt={game.name} 
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=800&h=600&fit=crop';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-[#1a1a1a] border border-[#333]' : 'bg-blue-50 border border-blue-200'}`}>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-blue-900'}`}>
          💡 <strong>Tip:</strong> All changes are saved automatically. Use the Preview tab to see how your landing page looks.
        </p>
      </div>
    </div>
  );
};
