/**
 * Credit Info Section
 * Explains how credits work
 * @module billing/components
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, MessageSquare } from 'lucide-react';

interface CreditInfoSectionProps {
  isDark?: boolean;
}

export function CreditInfoSection({ isDark = false }: CreditInfoSectionProps) {
  const textClass = isDark ? 'text-[#e0e7ff]' : 'text-blue-900';
  const mutedClass = isDark ? 'text-[#c7d2fe]' : 'text-blue-700';
  const cardBg = isDark ? 'bg-[#161616] border-[#2a2a2a]' : 'bg-white border-blue-200';
  const badgeClass = isDark 
    ? 'bg-[#4f46e5]/20 text-[#6366f1] border-0 text-xs' 
    : 'bg-blue-100 text-blue-700 border-0 text-xs';

  const creditItems = [
    {
      icon: Calendar,
      title: 'Bookings',
      description: (
        <>
          Free: Unlimited (3.9% fee)<br />
          Starter: 30 free/month<br />
          Professional: 60 free/month<br />
          Enterprise: Unlimited
        </>
      ),
      cost: '2 credits per extra booking',
    },
    {
      icon: FileText,
      title: 'Waivers',
      description: 'All plans can create and manage unlimited waiver templates',
      cost: '2 credits per waiver signed',
    },
    {
      icon: MessageSquare,
      title: 'AI Conversations',
      description: (
        <>
          Free: Not included<br />
          Starter: 30 free/month<br />
          Professional: 60 free/month<br />
          Enterprise: Unlimited
        </>
      ),
      cost: '2 credits per extra conversation',
    },
  ];

  return (
    <Card className={`border shadow-sm ${
      isDark 
        ? 'border-[#4f46e5]/30 bg-[#4f46e5]/10' 
        : 'border-blue-200 bg-blue-50'
    }`}>
      <CardHeader className="p-6">
        <CardTitle className={textClass}>How Credits Work</CardTitle>
        <CardDescription className={mutedClass}>
          Understanding your credit allocation and usage
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {creditItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className={`p-4 rounded-lg border ${cardBg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                  <p className={`text-sm font-medium ${textClass}`}>{item.title}</p>
                </div>
                <p className={`text-xs mb-2 ${isDark ? 'text-[#a3a3a3]' : 'text-gray-600'}`}>
                  {item.description}
                </p>
                <Badge className={badgeClass}>
                  {item.cost}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default CreditInfoSection;
