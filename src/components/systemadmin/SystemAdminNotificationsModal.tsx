'use client';

import { useState } from 'react';
import { useTheme } from '../layout/ThemeContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Bell,
  Search,
  Check,
  X,
  Trash2,
  Filter,
  AlertCircle,
  CheckCircle2,
  Info,
  Shield,
  Users,
  DollarSign,
  Building2
} from 'lucide-react';

interface SystemAdminNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    title: 'New Organization Signup',
    message: 'Cipher City Games has joined the platform',
    type: 'organization' as const,
    priority: 'high' as const,
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
  },
  {
    id: 2,
    title: 'Plan Upgrade',
    message: 'Riddle Me This upgraded to Pro plan',
    type: 'billing' as const,
    priority: 'medium' as const,
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
  },
  {
    id: 3,
    title: 'Security Alert',
    message: 'Failed login attempt detected for admin@bookingtms.com',
    type: 'security' as const,
    priority: 'high' as const,
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
  },
  {
    id: 4,
    title: 'Payment Received',
    message: 'Monthly payment received from Mystery Manor Games',
    type: 'billing' as const,
    priority: 'low' as const,
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
  },
  {
    id: 5,
    title: 'New Feature Request',
    message: 'Organization requested custom branding feature',
    type: 'system' as const,
    priority: 'medium' as const,
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
];

export function SystemAdminNotificationsModal({ isOpen, onClose }: SystemAdminNotificationsModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Semantic classes
  const bgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderColor = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const hoverBgClass = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(mockNotifications);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'organization':
        return <Building2 className="w-5 h-5" />;
      case 'billing':
        return <DollarSign className="w-5 h-5" />;
      case 'security':
        return <Shield className="w-5 h-5" />;
      case 'system':
        return <Info className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') {
      return isDark ? 'text-red-400' : 'text-red-600';
    }
    
    switch (type) {
      case 'organization':
        return isDark ? 'text-blue-400' : 'text-blue-600';
      case 'billing':
        return isDark ? 'text-green-400' : 'text-green-600';
      case 'security':
        return isDark ? 'text-orange-400' : 'text-orange-600';
      case 'system':
        return isDark ? 'text-purple-400' : 'text-purple-600';
      default:
        return isDark ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: isDark ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-100 text-red-700 border-red-200',
      medium: isDark ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-orange-100 text-orange-700 border-orange-200',
      low: isDark ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = 
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'unread' && !notif.read) ||
      (activeTab === 'important' && notif.priority === 'high');
    
    return matchesSearch && matchesTab;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-3xl max-h-[90vh] overflow-hidden flex flex-col ${cardBgClass} ${borderColor}`}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className={`flex items-center gap-2 ${textClass}`}>
              <Bell className="w-5 h-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white border-0">
                  {unreadCount}
                </Badge>
              )}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <Check className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          </div>
        </DialogHeader>

        {/* Search */}
        <div className="px-6">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMutedClass}`} />
            <Input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 h-10 ${isDark ? 'bg-[#161616] border-[#333]' : 'bg-gray-100 border-gray-300'}`}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="important">
              Important ({notifications.filter(n => n.priority === 'high').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto px-6 space-y-2">
          {filteredNotifications.length === 0 ? (
            <div className={`text-center py-12 ${textMutedClass}`}>
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No notifications found</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <Card
                key={notif.id}
                className={`${cardBgClass} border ${borderColor} ${!notif.read ? (isDark ? 'bg-[#1a1a1a]' : 'bg-blue-50/50') : ''} ${hoverBgClass} transition-colors cursor-pointer`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 ${getNotificationColor(notif.type, notif.priority)}`}>
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`${textClass} ${!notif.read ? 'font-semibold' : ''}`}>
                          {notif.title}
                        </h4>
                        <Badge className={`${getPriorityBadge(notif.priority)} text-xs`}>
                          {notif.priority}
                        </Badge>
                      </div>
                      <p className={`text-sm ${textMutedClass} mb-2`}>
                        {notif.message}
                      </p>
                      <p className={`text-xs ${textMutedClass}`}>
                        {formatTimestamp(notif.timestamp)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {!notif.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notif.id);
                          }}
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notif.id);
                        }}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${borderColor} flex justify-end`}>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
