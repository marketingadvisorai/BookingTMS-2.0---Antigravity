/**
 * Notification Card Component
 * @module notifications/components/NotificationCard
 */

import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  CreditCard,
  Gamepad2,
  MapPin,
  Settings,
  AlertTriangle,
  Check,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import type { Notification, NotificationType } from '../types';

interface NotificationCardProps {
  notification: Notification;
  isDark: boolean;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate?: (link: string) => void;
}

const TYPE_ICONS: Record<NotificationType, typeof Calendar> = {
  booking: Calendar,
  payment: CreditCard,
  game: Gamepad2,
  venue: MapPin,
  system: Settings,
  alert: AlertTriangle,
};

const TYPE_COLORS: Record<NotificationType, string> = {
  booking: 'bg-blue-500',
  payment: 'bg-green-500',
  game: 'bg-purple-500',
  venue: 'bg-orange-500',
  system: 'bg-gray-500',
  alert: 'bg-red-500',
};

export function NotificationCard({
  notification,
  isDark,
  onMarkAsRead,
  onDelete,
  onNavigate,
}: NotificationCardProps) {
  const Icon = TYPE_ICONS[notification.type] || Settings;
  const colorClass = TYPE_COLORS[notification.type] || 'bg-gray-500';

  const cardBg = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

  return (
    <Card
      className={`${cardBg} border ${borderClass} p-4 ${
        !notification.is_read ? (isDark ? 'border-l-4 border-l-[#4f46e5]' : 'border-l-4 border-l-blue-600') : ''
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`${colorClass} p-2 rounded-lg flex-shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className={`font-medium ${textClass} ${!notification.is_read ? 'font-semibold' : ''}`}>
                {notification.title}
              </h4>
              <p className={`text-sm ${mutedClass} mt-1`}>{notification.message}</p>
            </div>
            <Badge variant="outline" className="text-xs flex-shrink-0">
              {notification.type}
            </Badge>
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className={`text-xs ${mutedClass}`}>{timeAgo}</span>

            <div className="flex items-center gap-2">
              {notification.link && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate?.(notification.link!)}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
              {!notification.is_read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <Check className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600"
                onClick={() => onDelete(notification.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default NotificationCard;
