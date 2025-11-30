/**
 * MarketingPro 1.1 - Review Card Component
 * @description Individual review card with response capability
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, ThumbsUp, ExternalLink, CheckCircle } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import { getThemeClasses, getBadgeClasses } from '../../utils/theme';

interface ReviewCardProps {
  customerName: string;
  initials: string;
  rating: number;
  content: string;
  source: 'google' | 'facebook' | 'yelp' | 'tripadvisor';
  date: string;
  isVerified?: boolean;
  needsResponse?: boolean;
  response?: {
    content: string;
    date: string;
  };
  initialsColor?: 'blue' | 'purple' | 'red' | 'green';
}

export function ReviewCard({
  customerName,
  initials,
  rating,
  content,
  source,
  date,
  isVerified = false,
  needsResponse = false,
  response,
  initialsColor = 'blue',
}: ReviewCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const classes = getThemeClasses(isDark);

  const colorMap = {
    blue: isDark ? 'bg-[#4f46e5]/20 text-[#6366f1]' : 'bg-blue-100 text-blue-600',
    purple: isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600',
    red: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600',
    green: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-600',
  };

  const sourceLabels: Record<string, { label: string; color: string }> = {
    google: { label: 'Google', color: getBadgeClasses('scheduled', isDark) },
    facebook: { label: 'Facebook', color: isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700' },
    yelp: { label: 'Yelp', color: getBadgeClasses('scheduled', isDark) },
    tripadvisor: { label: 'TripAdvisor', color: getBadgeClasses('active', isDark) },
  };

  const cardBorderClass = needsResponse 
    ? isDark ? 'border-red-500/30 bg-red-500/10' : 'border-red-200 bg-red-50'
    : classes.border;

  return (
    <div className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${cardBorderClass}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorMap[initialsColor]}`}>
            <span className="text-sm">{initials}</span>
          </div>
          <div>
            <p className={`text-sm ${classes.text}`}>{customerName}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-3 h-3 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : isDark ? 'text-[#525252]' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className={`text-xs ${classes.textMuted}`}>{date}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Badge variant="secondary" className={`text-xs ${sourceLabels[source].color}`}>
            {sourceLabels[source].label}
          </Badge>
          {isVerified && (
            <Badge variant="secondary" className={`text-xs ${getBadgeClasses('verified', isDark)}`}>
              Verified
            </Badge>
          )}
          {needsResponse && (
            <Badge variant="secondary" className={`text-xs ${getBadgeClasses('needsResponse', isDark)}`}>
              Needs Response
            </Badge>
          )}
        </div>
      </div>
      
      <p className={`text-sm mb-3 ${classes.textSecondary}`}>{content}</p>
      
      {response && (
        <div className={`p-3 mb-3 rounded border-l-4 ${isDark ? 'bg-[#4f46e5]/10 border-[#4f46e5]' : 'bg-blue-50 border-blue-600'}`}>
          <div className="flex items-start gap-2">
            <MessageSquare className={`w-4 h-4 mt-0.5 flex-shrink-0 ${classes.primary}`} />
            <div>
              <p className={`text-xs mb-1 ${classes.textMuted}`}>Your Response:</p>
              <p className={`text-sm ${classes.text}`}>{response.content}</p>
              <p className={`text-xs mt-1 ${classes.textMuted}`}>{response.date}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-wrap items-center gap-2">
        {response ? (
          <Button size="sm" variant="outline" disabled>
            <CheckCircle className="w-3 h-3 mr-2" />
            Responded
          </Button>
        ) : (
          <Button 
            size="sm" 
            className={needsResponse ? classes.primaryBtn : ''}
            variant={needsResponse ? 'default' : 'outline'}
          >
            <MessageSquare className="w-3 h-3 mr-2" />
            {needsResponse ? 'Respond Now' : 'Reply'}
          </Button>
        )}
        {!needsResponse && (
          <Button size="sm" variant="ghost">
            <ThumbsUp className="w-3 h-3 mr-2" />
            Mark Helpful
          </Button>
        )}
        <Button size="sm" variant="ghost">
          <ExternalLink className="w-3 h-3 mr-2" />
          View on {sourceLabels[source].label}
        </Button>
      </div>
    </div>
  );
}
