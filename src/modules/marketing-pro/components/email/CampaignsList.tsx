/**
 * MarketingPro 1.1 - Campaigns List Component
 * @description List of email campaigns with stats
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Eye, Copy, Download, Pencil, Send, XCircle } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import { getThemeClasses, getBadgeClasses } from '../../utils/theme';

interface CampaignsListProps {
  onCreateCampaign: () => void;
}

const CAMPAIGNS = [
  {
    id: '1',
    name: 'Summer Special - 25% Off Weekend Bookings',
    status: 'sent',
    sentTo: 12450,
    sentDate: 'Nov 15, 2025',
    stats: { delivered: 12234, opened: 4123, openRate: 33.7, clicked: 1567, clickRate: 12.8, conversions: 89 },
  },
  {
    id: '2',
    name: 'Black Friday Mega Sale - 50% Off All Rooms',
    status: 'scheduled',
    scheduledDate: 'Nov 24, 2025 at 9:00 AM',
    targetAudience: 15234,
  },
  {
    id: '3',
    name: 'Weekly Newsletter - New Mystery Manor Update',
    status: 'sent',
    sentTo: 13120,
    sentDate: 'Nov 8, 2025',
    stats: { delivered: 12987, opened: 4567, openRate: 35.2, clicked: 1789, clickRate: 13.8, conversions: 67 },
  },
];

export function CampaignsList({ onCreateCampaign }: CampaignsListProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const classes = getThemeClasses(isDark);

  return (
    <Card className={`${classes.cardBg} border ${classes.border} shadow-sm`}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className={classes.text}>Email Campaigns</CardTitle>
            <p className={`text-sm mt-1 ${classes.textMuted}`}>Create and send email marketing campaigns</p>
          </div>
          <Button className={`${classes.primaryBtn} w-full sm:w-auto`} onClick={onCreateCampaign}>
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {CAMPAIGNS.map((campaign) => {
            const isScheduled = campaign.status === 'scheduled';
            const cardClass = isScheduled 
              ? isDark ? 'border-[#4f46e5]/30 bg-[#4f46e5]/10' : 'border-blue-200 bg-blue-50'
              : classes.border;

            return (
              <div key={campaign.id} className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${cardClass}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className={`text-sm ${classes.text}`}>{campaign.name}</h4>
                      <Badge className={getBadgeClasses(campaign.status, isDark)}>
                        {campaign.status === 'sent' ? 'Sent' : 'Scheduled'}
                      </Badge>
                    </div>
                    <p className={`text-xs mb-2 ${classes.textMuted}`}>
                      {isScheduled 
                        ? `Scheduled for ${campaign.scheduledDate}` 
                        : `Sent to ${campaign.sentTo?.toLocaleString()} subscribers on ${campaign.sentDate}`}
                    </p>
                    {!isScheduled && campaign.stats && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <p className={`text-xs ${classes.textMuted}`}>Delivered</p>
                          <p className={`text-sm ${classes.text}`}>{campaign.stats.delivered.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className={`text-xs ${classes.textMuted}`}>Opened</p>
                          <p className={`text-sm ${classes.text}`}>{campaign.stats.opened.toLocaleString()} ({campaign.stats.openRate}%)</p>
                        </div>
                        <div>
                          <p className={`text-xs ${classes.textMuted}`}>Clicked</p>
                          <p className={`text-sm ${classes.text}`}>{campaign.stats.clicked.toLocaleString()} ({campaign.stats.clickRate}%)</p>
                        </div>
                        <div>
                          <p className={`text-xs ${classes.textMuted}`}>Conversions</p>
                          <p className={`text-sm ${classes.success}`}>{campaign.stats.conversions} bookings</p>
                        </div>
                      </div>
                    )}
                    {isScheduled && (
                      <p className={`text-xs ${classes.textMuted}`}>Target audience: {campaign.targetAudience?.toLocaleString()} subscribers</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isScheduled ? (
                        <>
                          <DropdownMenuItem><Pencil className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                          <DropdownMenuItem><Send className="w-4 h-4 mr-2" />Send Test</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600"><XCircle className="w-4 h-4 mr-2" />Cancel</DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem><Eye className="w-4 h-4 mr-2" />View Report</DropdownMenuItem>
                          <DropdownMenuItem><Copy className="w-4 h-4 mr-2" />Duplicate</DropdownMenuItem>
                          <DropdownMenuItem><Download className="w-4 h-4 mr-2" />Export Data</DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
