'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { useTheme } from '../layout/ThemeContext';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { 
  Building2, 
  Mail, 
  Globe, 
  Crown, 
  CheckCircle, 
  XCircle, 
  Calendar,
  MapPin,
  Phone,
  Users,
  ExternalLink,
  Edit,
  Trash2
} from 'lucide-react';

interface ViewOwnerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  owner: any;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ViewOwnerDialog = ({ isOpen, onClose, owner, onEdit, onDelete }: ViewOwnerDialogProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';
  const secondaryBgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50';

  if (!owner) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${bgClass} ${textClass} border ${borderColor} max-w-3xl max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className={textClass}>Owner Details</DialogTitle>
          <DialogDescription className={mutedTextClass}>
            View complete owner information and account details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className={`p-6 rounded-xl border ${borderColor} ${secondaryBgClass}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className={`text-xl ${textClass} mb-1`}>{owner.organizationName}</h3>
                <p className={`text-sm ${mutedTextClass}`}>Owner: {owner.ownerName}</p>
              </div>
              <Badge variant={owner.status === 'active' ? 'default' : 'secondary'} className="text-sm">
                {owner.status === 'active' ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <XCircle className="w-3 h-3 mr-1" />
                )}
                {owner.status}
              </Badge>
            </div>

            <div className={`p-4 rounded-lg border ${borderColor} bg-indigo-600/5 mb-4`}>
              <div className="flex items-center gap-2 mb-1">
                <code className="text-xs bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded">
                  {owner.organizationId}
                </code>
              </div>
              <p className={`text-xs ${mutedTextClass}`}>Organization ID</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Badge
                  style={{
                    backgroundColor: owner.plan === 'Pro' 
                      ? '#4f46e5' 
                      : owner.plan === 'Growth' 
                      ? '#10b981' 
                      : '#6b7280'
                  }}
                  className="text-white text-sm"
                >
                  <Crown className="w-3 h-3 mr-1" />
                  {owner.plan} Plan
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className={`w-4 h-4 ${mutedTextClass}`} />
                <span className={textClass}>{owner.venues} Venues</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className={`text-sm uppercase tracking-wider mb-4 ${mutedTextClass}`}>Contact Information</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className={`w-4 h-4 ${mutedTextClass}`} />
                <a href={`mailto:${owner.email}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                  {owner.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Globe className={`w-4 h-4 ${mutedTextClass}`} />
                <a 
                  href={owner.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  {owner.website}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <Separator className={borderColor} />

          {/* Key Features */}
          <div>
            <h4 className={`text-sm uppercase tracking-wider mb-4 ${mutedTextClass}`}>Enabled Features</h4>
            <div className="flex flex-wrap gap-2">
              {owner.features.map((feature: string, idx: number) => (
                <span 
                  key={idx} 
                  className="px-3 py-1.5 text-sm bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-600/20 rounded-lg"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <Separator className={borderColor} />

          {/* Statistics */}
          <div>
            <h4 className={`text-sm uppercase tracking-wider mb-4 ${mutedTextClass}`}>Account Statistics</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border ${borderColor} ${secondaryBgClass}`}>
                <div className={`text-2xl mb-1 ${textClass}`}>
                  {owner.venues}
                </div>
                <div className={`text-sm ${mutedTextClass}`}>Total Venues</div>
              </div>
              <div className={`p-4 rounded-lg border ${borderColor} ${secondaryBgClass}`}>
                <div className={`text-2xl mb-1 ${textClass}`}>
                  {owner.features.length}
                </div>
                <div className={`text-sm ${mutedTextClass}`}>Active Features</div>
              </div>
              <div className={`p-4 rounded-lg border ${borderColor} ${secondaryBgClass}`}>
                <div className={`text-2xl mb-1 ${textClass}`}>
                  {owner.status === 'active' ? '100%' : '0%'}
                </div>
                <div className={`text-sm ${mutedTextClass}`}>Uptime</div>
              </div>
            </div>
          </div>

          {/* Public Profile */}
          <div className={`p-4 rounded-lg border ${borderColor} bg-blue-600/5`}>
            <div className="flex items-start justify-between">
              <div>
                <h4 className={`text-sm mb-1 ${textClass}`}>Public Venue Profile</h4>
                <p className={`text-xs ${mutedTextClass}`}>
                  /v/{owner.profileSlug}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/v/${owner.profileSlug}`, '_blank')}
                className={`border ${borderColor}`}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Profile
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-[#333]">
            <Button
              variant="outline"
              onClick={onClose}
              className={`border ${borderColor}`}
            >
              Close
            </Button>
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  onClick={onEdit}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Owner
                </Button>
              )}
              {onDelete && (
                <Button
                  onClick={onDelete}
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-600/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
