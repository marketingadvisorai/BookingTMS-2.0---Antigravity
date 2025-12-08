/**
 * Credit Balance Card
 * Displays credit balance with purchase option
 * @module billing/components
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Plus, Calendar, FileText, MessageSquare, Loader2, Coins } from 'lucide-react';
import type { CreditBalance } from '../types';

interface CreditBalanceCardProps {
  creditBalance: CreditBalance | null;
  loading?: boolean;
  onBuyCredits: () => void;
  isDark?: boolean;
}

export function CreditBalanceCard({
  creditBalance,
  loading,
  onBuyCredits,
  isDark = false,
}: CreditBalanceCardProps) {
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const cardBg = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';

  const balance = creditBalance?.balance || 0;
  const bookingsUsed = creditBalance?.bookings_used || 0;
  const waiversUsed = creditBalance?.waivers_used || 0;
  const aiUsed = creditBalance?.ai_conversations_used || 0;

  return (
    <Card className={`${cardBg} border ${borderClass} shadow-sm`}>
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={textClass}>Credits Balance</CardTitle>
            <CardDescription className={mutedClass}>Additional usage credits</CardDescription>
          </div>
          <Button
            onClick={onBuyCredits}
            disabled={loading}
            style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
            className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Buy Credits
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-6 pt-0">
        {/* Balance Display */}
        <div className={`p-6 rounded-xl text-white ${
          isDark 
            ? 'bg-gradient-to-br from-[#4f46e5] to-[#4338ca]' 
            : 'bg-gradient-to-br from-blue-600 to-blue-700'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <Coins className="w-4 h-4 opacity-90" />
            <p className="text-sm opacity-90">Available Credits</p>
          </div>
          <p className="text-4xl font-bold">{balance.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-2">
            Credits used for bookings, waivers, and AI conversations beyond your plan limits
          </p>
        </div>

        <Separator className={borderClass} />

        {/* Usage Breakdown */}
        <div>
          <Label className={`text-sm mb-3 block ${textClass}`}>Credit Usage This Month</Label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 ${mutedClass}`}>
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Extra Bookings (2 credits each)</span>
              </div>
              <span className={`text-sm font-medium ${textClass}`}>
                {bookingsUsed * 2} credits
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 ${mutedClass}`}>
                <FileText className="w-4 h-4" />
                <span className="text-sm">Waivers (2 credits each)</span>
              </div>
              <span className={`text-sm font-medium ${textClass}`}>
                {waiversUsed * 2} credits
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 ${mutedClass}`}>
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">Extra AI Conversations (2 credits each)</span>
              </div>
              <span className={`text-sm font-medium ${textClass}`}>
                {aiUsed * 2} credits
              </span>
            </div>
            <Separator className={borderClass} />
            <div className="flex items-center justify-between pt-2">
              <span className={`text-sm font-medium ${textClass}`}>Total Used</span>
              <span className={`text-sm font-semibold ${textClass}`}>
                {(bookingsUsed + waiversUsed + aiUsed) * 2} credits
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CreditBalanceCard;
