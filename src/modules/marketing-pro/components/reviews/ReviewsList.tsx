/**
 * MarketingPro 1.1 - Reviews List Component
 * @description Main reviews list with filter tabs
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Send } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import { getThemeClasses } from '../../utils/theme';
import { ReviewCard } from './ReviewCard';
import { toast } from 'sonner';

// Sample review data
const REVIEWS = [
  {
    id: '1',
    customerName: 'John Doe',
    initials: 'JD',
    rating: 5,
    content: 'Amazing experience! The Mystery Manor room was so immersive and challenging. Our game master was fantastic and very helpful. Highly recommend!',
    source: 'google' as const,
    date: '2 days ago',
    isVerified: true,
    initialsColor: 'blue' as const,
  },
  {
    id: '2',
    customerName: 'Sarah Smith',
    initials: 'SS',
    rating: 4,
    content: "Great escape room! Had a lot of fun with friends. The only downside was we had to wait 15 minutes past our booking time to start.",
    source: 'facebook' as const,
    date: '1 week ago',
    response: {
      content: "Thank you for the feedback, Sarah! We apologize for the delay. We've addressed this with our team to ensure better timing. Hope to see you again!",
      date: 'Responded 5 days ago',
    },
    initialsColor: 'purple' as const,
  },
  {
    id: '3',
    customerName: 'Mike Johnson',
    initials: 'MJ',
    rating: 2,
    content: "Disappointed with our experience. Some of the puzzles were broken and the room wasn't very clean. Expected better for the price.",
    source: 'yelp' as const,
    date: '3 days ago',
    needsResponse: true,
    initialsColor: 'red' as const,
  },
];

export function ReviewsList() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const classes = getThemeClasses(isDark);

  return (
    <Card className={`${classes.cardBg} border ${classes.border} shadow-sm`}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className={classes.text}>Customer Reviews</CardTitle>
            <p className={`text-sm mt-1 ${classes.textMuted}`}>Monitor and respond to customer feedback</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              className={`${classes.primaryBtn} w-full sm:w-auto`}
              onClick={() => toast.success('Review request sent!')}
            >
              <Send className="w-4 h-4 mr-2" />
              Request Reviews
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filter Tabs */}
          <div className={`flex flex-wrap gap-2 border-b pb-3 ${classes.border}`}>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`rounded-none border-b-2 ${classes.primary} ${isDark ? 'border-[#4f46e5]' : 'border-blue-600'}`}
            >
              All (1,234)
            </Button>
            <Button variant="ghost" size="sm">Pending Response (12)</Button>
            <Button variant="ghost" size="sm">5 Stars (876)</Button>
            <Button variant="ghost" size="sm">1-3 Stars (45)</Button>
          </div>

          {/* Reviews */}
          <div className="space-y-4">
            {REVIEWS.map((review) => (
              <ReviewCard key={review.id} {...review} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
