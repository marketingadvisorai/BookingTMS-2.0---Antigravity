import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ExternalLink, Settings, Code } from 'lucide-react';
import { Button } from '../ui/button';
import { useTheme } from '../layout/ThemeContext';

interface ProfileDropdownProps {
  ownerName: string;
  profileSlug: string;
  organizationName: string;
  onViewProfile: () => void;
  onProfileSettings: () => void;
  onProfileEmbed: () => void;
}

export const ProfileDropdown = ({
  ownerName,
  profileSlug,
  organizationName,
  onViewProfile,
  onProfileSettings,
  onProfileEmbed,
}: ProfileDropdownProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Theme classes
  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const hoverBgClass = isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-gray-50';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleViewProfile = () => {
    setIsOpen(false);
    onViewProfile();
  };

  const handleProfileSettings = () => {
    setIsOpen(false);
    onProfileSettings();
  };

  const handleProfileEmbed = () => {
    setIsOpen(false);
    onProfileEmbed();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 ${textClass} ${hoverBgClass}`}
      >
        Profile
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div
          className={`
            absolute right-0 top-full mt-1 w-56 
            ${bgClass} border ${borderColor} rounded-lg shadow-lg z-50
            overflow-hidden
          `}
        >
          {/* Dropdown Header */}
          <div className={`px-4 py-3 border-b ${borderColor}`}>
            <p className={`text-sm font-medium ${textClass}`}>{ownerName}</p>
            <p className={`text-xs ${mutedTextClass}`}>{organizationName}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {/* View Profile */}
            <button
              onClick={handleViewProfile}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5
                ${textClass} ${hoverBgClass} transition-colors
                text-left
              `}
            >
              <ExternalLink className="w-4 h-4" />
              <div>
                <p className="text-sm font-medium">View Profile</p>
                <p className={`text-xs ${mutedTextClass}`}>Public landing page</p>
              </div>
            </button>

            {/* Profile Settings */}
            <button
              onClick={handleProfileSettings}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5
                ${textClass} ${hoverBgClass} transition-colors
                text-left
              `}
            >
              <Settings className="w-4 h-4" />
              <div>
                <p className="text-sm font-medium">Profile Settings</p>
                <p className={`text-xs ${mutedTextClass}`}>Customize profile</p>
              </div>
            </button>

            {/* Profile Embed */}
            <button
              onClick={handleProfileEmbed}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5
                ${textClass} ${hoverBgClass} transition-colors
                text-left
              `}
            >
              <Code className="w-4 h-4" />
              <div>
                <p className="text-sm font-medium">Profile Embed</p>
                <p className={`text-xs ${mutedTextClass}`}>Get embed code</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
