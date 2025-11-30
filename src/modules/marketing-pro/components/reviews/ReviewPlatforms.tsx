/**
 * MarketingPro 1.1 - Review Platforms Component
 * @description Connected platforms and rating distribution
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Facebook } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import { getThemeClasses, getStatCardColors, getBadgeClasses } from '../../utils/theme';

// Sample platform data
const PLATFORMS = [
  { id: 'google', name: 'Google Reviews', count: 876, connected: true, color: 'blue' },
  { id: 'facebook', name: 'Facebook Reviews', count: 234, connected: true, color: 'blue' },
  { id: 'yelp', name: 'Yelp', count: 124, connected: true, color: 'red' },
  { id: 'tripadvisor', name: 'TripAdvisor', count: 0, connected: false, color: 'green' },
];

const RATING_DISTRIBUTION = [
  { rating: 5, percentage: 72 },
  { rating: 4, percentage: 17 },
  { rating: 3, percentage: 8 },
  { rating: 2, percentage: 2 },
  { rating: 1, percentage: 1 },
];

export function ReviewPlatforms() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const classes = getThemeClasses(isDark);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Connected Platforms */}
      <Card className={`${classes.cardBg} border ${classes.border} shadow-sm`}>
        <CardHeader>
          <CardTitle className={classes.text}>Connected Review Platforms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {PLATFORMS.map((platform) => {
            const colors = getStatCardColors(platform.color as any, isDark);
            const Icon = platform.id === 'facebook' ? Facebook : Star;
            
            return (
              <div 
                key={platform.id} 
                className={`flex items-center justify-between p-3 border rounded-lg ${classes.border}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colors.bg}`}>
                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                  </div>
                  <div>
                    <p className={`text-sm ${classes.text}`}>{platform.name}</p>
                    <p className={`text-xs ${classes.textMuted}`}>
                      {platform.connected ? `${platform.count} reviews` : 'Not connected'}
                    </p>
                  </div>
                </div>
                {platform.connected ? (
                  <Badge className={getBadgeClasses('active', isDark)}>Connected</Badge>
                ) : (
                  <Button size="sm" variant="outline">Connect</Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Rating Distribution */}
      <Card className={`${classes.cardBg} border ${classes.border} shadow-sm`}>
        <CardHeader>
          <CardTitle className={classes.text}>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {RATING_DISTRIBUTION.map(({ rating, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-16">
                <span className={`text-sm ${classes.text}`}>{rating}</span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex-1">
                <div className={`w-full rounded-full h-2 ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200'}`}>
                  <div 
                    className="bg-yellow-400 h-2 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <span className={`text-sm w-12 text-right ${classes.textMuted}`}>{percentage}%</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
