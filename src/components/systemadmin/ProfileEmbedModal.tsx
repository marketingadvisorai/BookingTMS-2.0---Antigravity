import { useState } from 'react';
import { X, Copy, Check, Code } from 'lucide-react';
import { Button } from '../ui/button';
import { useTheme } from '../layout/ThemeContext';
import { toast } from 'sonner@2.0.3';

interface ProfileEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  owner: {
    ownerName: string;
    organizationName: string;
    profileSlug: string;
  };
}

export const ProfileEmbedModal = ({ isOpen, onClose, owner }: ProfileEmbedModalProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [copied, setCopied] = useState(false);

  // Theme classes
  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';
  const codeBgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-100';

  const profileUrl = `${window.location.origin}/v/${owner.profileSlug}`;
  
  const embedCode = `<!-- BookingTMS Profile Widget -->
<iframe 
  src="${profileUrl}"
  width="100%"
  height="800"
  frameborder="0"
  style="border: none; border-radius: 12px;"
  title="${owner.organizationName}"
></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success('Embed code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`${bgClass} rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${borderColor}`}>
          <div>
            <h2 className={`text-2xl font-bold ${textClass} flex items-center gap-2`}>
              <Code className="w-6 h-6" />
              Profile Embed Code
            </h2>
            <p className={`text-sm ${mutedTextClass} mt-1`}>
              {owner.ownerName} • {owner.organizationName}
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
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-indigo-950/50 border border-indigo-900' : 'bg-indigo-50 border border-indigo-200'}`}>
            <h3 className={`text-sm font-semibold ${isDark ? 'text-indigo-300' : 'text-indigo-900'} mb-2`}>
              How to use this code
            </h3>
            <ul className={`text-sm ${isDark ? 'text-indigo-200' : 'text-indigo-800'} space-y-1`}>
              <li>• Copy the embed code below</li>
              <li>• Paste it into your website's HTML</li>
              <li>• The profile will appear as an embedded widget</li>
              <li>• Customize width and height as needed</li>
            </ul>
          </div>

          {/* Profile URL */}
          <div className="space-y-2">
            <label className={`text-sm font-medium ${textClass}`}>
              Profile URL
            </label>
            <div className={`flex items-center gap-2 p-3 rounded-lg ${codeBgClass} border ${borderColor}`}>
              <code className={`flex-1 text-sm ${mutedTextClass} font-mono`}>
                {profileUrl}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(profileUrl);
                  toast.success('URL copied to clipboard');
                }}
                className={`${isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-gray-200'}`}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Embed Code */}
          <div className="space-y-2">
            <label className={`text-sm font-medium ${textClass}`}>
              Embed Code
            </label>
            <div className={`relative rounded-lg ${codeBgClass} border ${borderColor} overflow-hidden`}>
              <pre className="p-4 overflow-x-auto">
                <code className={`text-sm ${mutedTextClass} font-mono`}>
                  {embedCode}
                </code>
              </pre>
              <div className="absolute top-2 right-2">
                <Button
                  size="sm"
                  onClick={handleCopy}
                  className={`${
                    copied 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <label className={`text-sm font-medium ${textClass}`}>
              Preview
            </label>
            <div className={`aspect-video rounded-lg border ${borderColor} overflow-hidden`}>
              <iframe
                src={profileUrl}
                className="w-full h-full"
                title={`${owner.organizationName} Preview`}
              />
            </div>
          </div>

          {/* Customization Options */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-[#1a1a1a] border border-[#333]' : 'bg-gray-50 border border-gray-200'}`}>
            <h3 className={`text-sm font-semibold ${textClass} mb-3`}>
              Customization Options
            </h3>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className={`font-mono ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    width
                  </span>
                  <p className={mutedTextClass}>Set width (e.g., "100%", "800px")</p>
                </div>
                <div>
                  <span className={`font-mono ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    height
                  </span>
                  <p className={mutedTextClass}>Set height (e.g., "800px", "600px")</p>
                </div>
                <div>
                  <span className={`font-mono ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    frameborder
                  </span>
                  <p className={mutedTextClass}>Show/hide border (0 or 1)</p>
                </div>
                <div>
                  <span className={`font-mono ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    style
                  </span>
                  <p className={mutedTextClass}>Add custom CSS styling</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end gap-3 p-6 border-t ${borderColor}`}>
          <Button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
