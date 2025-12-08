/**
 * Upgrade Banner Component
 * Encourages Free tier users to upgrade
 * @module billing/components
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, Zap, TrendingUp, ArrowRight, Gift,
  CreditCard, Shield, Clock
} from 'lucide-react';

interface UpgradeBannerProps {
  currentPlanSlug?: string;
  onUpgrade: () => void;
  isDark?: boolean;
}

export function UpgradeBanner({
  currentPlanSlug = 'free',
  onUpgrade,
  isDark = false,
}: UpgradeBannerProps) {
  // Don't show banner for paid plans
  if (currentPlanSlug !== 'free') return null;

  return (
    <Card className={`relative overflow-hidden border-0 ${
      isDark 
        ? 'bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-blue-900/40' 
        : 'bg-gradient-to-r from-purple-100 via-indigo-100 to-blue-100'
    }`}>
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500 rounded-full blur-3xl" />
      </div>

      <CardContent className="relative p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Message */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${
                isDark ? 'bg-purple-500/20' : 'bg-purple-200'
              }`}>
                <Sparkles className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <Badge className={`${
                isDark 
                  ? 'bg-amber-500/20 text-amber-400' 
                  : 'bg-amber-100 text-amber-700'
              } border-0`}>
                <Gift className="w-3 h-3 mr-1" />
                Save 20% with annual billing
              </Badge>
            </div>

            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Unlock Your Business Potential 🚀
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-[#a3a3a3]' : 'text-gray-600'}`}>
              You're currently on the <strong>Free plan</strong> with 3.9% transaction fees. 
              Upgrade to <strong>eliminate fees</strong> and unlock powerful features!
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className={`flex items-center gap-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                <CreditCard className="w-4 h-4" />
                <span>0% Transaction Fees</span>
              </div>
              <div className={`flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                <Zap className="w-4 h-4" />
                <span>AI Conversations</span>
              </div>
              <div className={`flex items-center gap-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                <TrendingUp className="w-4 h-4" />
                <span>Advanced Analytics</span>
              </div>
              <div className={`flex items-center gap-2 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                <Clock className="w-4 h-4" />
                <span>Priority Support</span>
              </div>
            </div>
          </div>

          {/* Right: CTA */}
          <div className="flex flex-col items-center gap-3">
            <Button
              onClick={onUpgrade}
              size="lg"
              className="h-12 px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-[#737373]' : 'text-gray-500'}`}>
              <Shield className="w-3 h-3" />
              <span>Cancel anytime • No hidden fees</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default UpgradeBanner;
