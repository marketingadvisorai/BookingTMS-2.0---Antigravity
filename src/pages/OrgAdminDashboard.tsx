import React from 'react';
import { useTheme } from '../components/layout/ThemeContext';
import { useAuth } from '../lib/auth/AuthContext';
import { useOrganization, useOrganizationMetrics } from '../features/system-admin/hooks/useOrganizations';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, Users, DollarSign, Settings, Plus, TrendingUp } from 'lucide-react';

interface OrgAdminDashboardProps {
    onNavigate?: (page: string) => void;
}

export const OrgAdminDashboard = ({ onNavigate }: OrgAdminDashboardProps) => {
    const { theme } = useTheme();
    const { currentUser } = useAuth();
    const { organization } = useOrganization(currentUser?.organizationId || undefined);
    const { metrics, isLoading: metricsLoading } = useOrganizationMetrics(currentUser?.organizationId || undefined);
    const isDark = theme === 'dark';

    const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
    const textClass = isDark ? 'text-white' : 'text-gray-900';
    const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
    const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';

    const handleNavigate = (page: string) => {
        if (onNavigate) {
            onNavigate(page);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={`text-3xl font-bold ${textClass}`}>
                        {organization?.name || 'Dashboard'}
                    </h1>
                    <p className={mutedTextClass}>
                        Manage your venue and bookings
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => handleNavigate('bookings')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Booking
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className={`${bgClass} ${borderColor}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className={`text-sm font-medium ${mutedTextClass}`}>
                            Total Bookings
                        </CardTitle>
                        <Calendar className="w-4 h-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${textClass}`}>
                            {metricsLoading ? '...' : metrics?.total_bookings || 0}
                        </div>
                        <p className={`text-xs ${mutedTextClass} mt-1`}>
                            Lifetime bookings
                        </p>
                    </CardContent>
                </Card>

                <Card className={`${bgClass} ${borderColor}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className={`text-sm font-medium ${mutedTextClass}`}>
                            Total Games
                        </CardTitle>
                        <Users className="w-4 h-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${textClass}`}>
                            {metricsLoading ? '...' : metrics?.total_games || 0}
                        </div>
                        <p className={`text-xs ${mutedTextClass} mt-1`}>
                            Available for booking
                        </p>
                    </CardContent>
                </Card>

                <Card className={`${bgClass} ${borderColor}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className={`text-sm font-medium ${mutedTextClass}`}>
                            Total Revenue
                        </CardTitle>
                        <DollarSign className="w-4 h-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${textClass}`}>
                            {metricsLoading ? '...' : `$${(metrics?.total_revenue || 0).toLocaleString()}`}
                        </div>
                        <p className={`text-xs ${mutedTextClass} mt-1`}>
                            Lifetime revenue
                        </p>
                    </CardContent>
                </Card>

                <Card className={`${bgClass} ${borderColor}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className={`text-sm font-medium ${mutedTextClass}`}>
                            Venue Status
                        </CardTitle>
                        <Settings className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${textClass}`}>
                            {organization?.status === 'active' ? 'Active' : 'Inactive'}
                        </div>
                        <p className={`text-xs ${mutedTextClass} mt-1`}>
                            {metrics?.active_venues || 0} Active Venue(s)
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className={`text-lg font-semibold mb-4 ${textClass}`}>Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card
                        className={`${bgClass} ${borderColor} cursor-pointer hover:border-indigo-500 transition-colors`}
                        onClick={() => handleNavigate('events')}
                    >
                        <CardContent className="p-6 flex items-center space-x-4">
                            <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-500">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className={`font-medium ${textClass}`}>Manage Games</h3>
                                <p className={`text-sm ${mutedTextClass}`}>Add or edit your games</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`${bgClass} ${borderColor} cursor-pointer hover:border-emerald-500 transition-colors`}
                        onClick={() => handleNavigate('bookings')}
                    >
                        <CardContent className="p-6 flex items-center space-x-4">
                            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className={`font-medium ${textClass}`}>View Calendar</h3>
                                <p className={`text-sm ${mutedTextClass}`}>Check upcoming bookings</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`${bgClass} ${borderColor} cursor-pointer hover:border-amber-500 transition-colors`}
                        onClick={() => handleNavigate('settings')}
                    >
                        <CardContent className="p-6 flex items-center space-x-4">
                            <div className="p-3 rounded-full bg-amber-500/10 text-amber-500">
                                <Settings className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className={`font-medium ${textClass}`}>Settings</h3>
                                <p className={`text-sm ${mutedTextClass}`}>Configure your venue</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
