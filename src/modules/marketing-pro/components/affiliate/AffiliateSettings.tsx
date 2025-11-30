/**
 * MarketingPro 1.1 - Affiliate Settings Component
 * @description Program settings and referral link management
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Copy, Save } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import { getThemeClasses } from '../../utils/theme';
import { toast } from 'sonner';

export function AffiliateSettings() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const classes = getThemeClasses(isDark);

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://yourdomain.com/ref/');
    toast.success('Referral link copied!');
  };

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Program Settings */}
      <Card className={`${classes.cardBg} border ${classes.border} shadow-sm`}>
        <CardHeader>
          <CardTitle className={classes.text}>Program Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default-commission" className={classes.text}>Default Commission Rate (%)</Label>
            <Input id="default-commission" type="number" defaultValue="15" min="0" max="100" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cookie-days" className={classes.text}>Cookie Duration (days)</Label>
            <Input id="cookie-days" type="number" defaultValue="30" min="1" />
            <p className={`text-xs ${classes.textMuted}`}>How long referral cookies last</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="min-payout" className={classes.text}>Minimum Payout ($)</Label>
            <Input id="min-payout" type="number" defaultValue="50" min="0" />
          </div>
          <div className={`flex items-center justify-between p-3 rounded-lg border ${classes.border}`}>
            <div>
              <Label className={classes.text}>Auto-approve Affiliates</Label>
              <p className={`text-xs ${classes.textMuted} mt-1`}>Skip manual approval step</p>
            </div>
            <Switch />
          </div>
          <div className={`flex items-center justify-between p-3 rounded-lg border ${classes.border}`}>
            <div>
              <Label className={classes.text}>Send Welcome Email</Label>
              <p className={`text-xs ${classes.textMuted} mt-1`}>Email new affiliates with details</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Button className={classes.primaryBtn} onClick={handleSaveSettings}>
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Referral Links */}
      <Card className={`${classes.cardBg} border ${classes.border} shadow-sm`}>
        <CardHeader>
          <CardTitle className={classes.text}>Referral Link Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="base-url" className={classes.text}>Base Referral URL</Label>
            <div className="flex gap-2">
              <Input 
                id="base-url" 
                value="https://yourdomain.com/ref/" 
                readOnly 
                className={classes.codeBg}
              />
              <Button variant="outline" onClick={handleCopyLink}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="landing-page" className={classes.text}>Default Landing Page</Label>
            <Input id="landing-page" placeholder="/book" defaultValue="/book" />
          </div>
          <div className={`p-4 rounded-lg border ${classes.border} ${classes.bgElevated}`}>
            <p className={`text-sm ${classes.text} mb-2`}>Example Affiliate Links:</p>
            <div className="space-y-2">
              <code className={`text-xs block ${classes.textMuted}`}>
                https://yourdomain.com/ref/TRAVEL15
              </code>
              <code className={`text-xs block ${classes.textMuted}`}>
                https://yourdomain.com/ref/TRAVEL15?utm_source=blog
              </code>
            </div>
          </div>
          <div className={`flex items-center justify-between p-3 rounded-lg border ${classes.border}`}>
            <div>
              <Label className={classes.text}>Track UTM Parameters</Label>
              <p className={`text-xs ${classes.textMuted} mt-1`}>Include UTM data in reports</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
