
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Badge } from '../../../ui/badge';
import { Settings, Copy, ExternalLink, X } from 'lucide-react';
import { toast } from 'sonner';
import { WidgetPaymentSettingsModal } from '../../WidgetPaymentSettingsModal';
import { useGames } from '../../../../hooks/useGames';

interface EmbedContext {
    embedKey?: string;
    primaryColor?: string;
    venueName?: string;
    baseUrl?: string;
    venueId?: string;
}

interface AdvancedSettingsTabProps {
    config: any;
    onConfigChange: (config: any) => void;
    embedContext?: EmbedContext;
}

export const AdvancedSettingsTab: React.FC<AdvancedSettingsTabProps> = ({ config, onConfigChange, embedContext }) => {
    const [showPaymentSettingsModal, setShowPaymentSettingsModal] = useState(false);
    const { updateGame: updateSupabaseGame } = useGames(embedContext?.venueId);

    return (
        <div className="space-y-6 pb-24">
            {/* Payment Settings Management Button */}
            <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                                Payment Configuration Manager
                            </CardTitle>
                            <CardDescription className="mt-1 text-sm sm:text-base">
                                Manage Stripe payment settings for all games in this widget
                            </CardDescription>
                        </div>
                        <Button
                            onClick={() => setShowPaymentSettingsModal(true)}
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-[#4f46e5] dark:hover:bg-[#4338ca] gap-2"
                        >
                            <Settings className="w-4 h-4" />
                            <span className="text-sm sm:text-base">Payment Settings</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="px-4 py-4 sm:px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                        <div className="flex items-center gap-3 p-3 sm:p-4 bg-white dark:bg-[#1e1e1e] rounded-lg border border-gray-200 dark:border-[#2a2a2a] transition-colors hover:border-blue-300 dark:hover:border-blue-700">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <span className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">{config.games?.length || 0}</span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Total Games</p>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-[#737373]">In this widget</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 sm:p-4 bg-white dark:bg-[#1e1e1e] rounded-lg border border-gray-200 dark:border-[#2a2a2a] transition-colors hover:border-green-300 dark:hover:border-green-700">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                <span className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                                    {config.games?.filter((g: any) => g.stripe_product_id || g.stripeProductId).length || 0}
                                </span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Configured</p>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-[#737373]">With Stripe</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 sm:p-4 bg-white dark:bg-[#1e1e1e] rounded-lg border border-gray-200 dark:border-[#2a2a2a] transition-colors hover:border-amber-300 dark:hover:border-amber-700">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                                <span className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400">
                                    {(config.games?.length || 0) - (config.games?.filter((g: any) => g.stripe_product_id || g.stripeProductId).length || 0)}
                                </span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">Pending</p>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-[#737373]">Need setup</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-[#2a2a2a]">
                <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
                    <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-white">Payment Settings for Widget</CardTitle>
                    <CardDescription className="text-sm sm:text-base">Games with Stripe checkout configured for this widget</CardDescription>
                </CardHeader>
                <CardContent className="px-4 py-4 sm:px-6">
                    {config.games && config.games.length > 0 ? (
                        <div className="space-y-4">
                            {config.games
                                .filter((game: any) => game.stripe_product_id || game.stripeProductId)
                                .map((game: any) => {
                                    const stripeProductId = game.stripe_product_id || game.stripeProductId;
                                    const stripePriceId = game.stripe_price_id || game.stripePriceId;
                                    const stripePrices = game.stripePrices || [];
                                    const syncStatus = game.stripe_sync_status || game.stripeSyncStatus || 'not_synced';

                                    return (
                                        <div key={game.id} className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="font-semibold text-lg">{game.name}</h4>
                                                        {syncStatus === 'synced' && (
                                                            <Badge className="bg-green-600">
                                                                ✓ Checkout Enabled
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {stripeProductId && (
                                                        <div className="space-y-2 mt-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium text-gray-700">Stripe Product:</span>
                                                                <code className="text-xs bg-white px-2 py-1 rounded border">
                                                                    {stripeProductId}
                                                                </code>
                                                            </div>

                                                            {stripePrices && stripePrices.length > 0 ? (
                                                                <div className="mt-3">
                                                                    <span className="text-sm font-medium text-gray-700 block mb-2">
                                                                        Available Prices ({stripePrices.length}):
                                                                    </span>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                        {stripePrices.map((price: any, index: number) => (
                                                                            <div key={price.priceId || index} className="bg-white p-3 rounded border">
                                                                                <div className="flex justify-between items-start">
                                                                                    <div>
                                                                                        <div className="font-semibold text-gray-900">
                                                                                            ${((price.unitAmount || 0) / 100).toFixed(2)} {price.currency?.toUpperCase() || 'USD'}
                                                                                        </div>
                                                                                        {price.lookupKey && (
                                                                                            <div className="text-xs text-blue-600 mt-1">
                                                                                                🔑 {price.lookupKey}
                                                                                            </div>
                                                                                        )}
                                                                                        {price.metadata?.pricing_type && (
                                                                                            <Badge variant="outline" className="text-xs mt-1">
                                                                                                {price.metadata.pricing_type}
                                                                                            </Badge>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                                <code className="text-xs text-gray-500 block mt-2 truncate">
                                                                                    {price.priceId}
                                                                                </code>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ) : stripePriceId ? (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-medium text-gray-700">Stripe Price:</span>
                                                                    <code className="text-xs bg-white px-2 py-1 rounded border">
                                                                        {stripePriceId}
                                                                    </code>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    )}

                                                    {/* Display Checkout URL if configured */}
                                                    {(game.stripeCheckoutUrl || game.stripe_checkout_url) && (
                                                        <div className="mt-3 p-3 bg-purple-50 rounded border border-purple-200">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-sm font-medium text-purple-900">🔗 Checkout URL:</span>
                                                            </div>
                                                            <code className="text-xs bg-white px-2 py-1 rounded border block truncate">
                                                                {game.stripeCheckoutUrl || game.stripe_checkout_url}
                                                            </code>
                                                            <p className="text-xs text-purple-700 mt-2">
                                                                Users will be redirected to this URL when clicking "Proceed to Checkout"
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                            {config.games.filter((game: any) => game.stripe_product_id || game.stripeProductId).length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-sm text-gray-500 mb-4">
                                        No games have Stripe checkout configured yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-sm text-gray-500 mb-4">No games added yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Checkout URL Configuration</CardTitle>
                        <CardDescription>Set custom Stripe checkout URLs for each game</CardDescription>
                    </div>
                    <Button
                        onClick={async () => {
                            try {
                                toast.loading('Saving checkout URLs...', { id: 'save-urls' });

                                // Update each game with its checkout URL
                                for (const game of config.games) {
                                    if (game.stripeCheckoutUrl !== undefined) {
                                        await updateSupabaseGame(game.id, {
                                            stripe_checkout_url: game.stripeCheckoutUrl || null,
                                        } as any);
                                    }
                                }

                                toast.success('Checkout URLs saved successfully!', { id: 'save-urls' });
                            } catch (error: any) {
                                console.error('Error saving checkout URLs:', error);
                                toast.error('Failed to save checkout URLs', { id: 'save-urls' });
                            }
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Save Checkout URLs
                    </Button>
                </CardHeader>
                <CardContent>
                    {config.games && config.games.length > 0 ? (
                        <div className="space-y-4">
                            {config.games.map((game: any) => (
                                <div key={game.id} className="p-4 border rounded-lg bg-gray-50">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold text-gray-900">{game.name}</h4>
                                            {game.stripeCheckoutUrl && (
                                                <Badge className="bg-green-600">
                                                    ✓ URL Configured
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor={`checkout - url - ${game.id} `}>
                                                Stripe Checkout URL
                                            </Label>
                                            <Input
                                                id={`checkout - url - ${game.id} `}
                                                placeholder="https://buy.stripe.com/..."
                                                value={game.stripeCheckoutUrl || ''}
                                                onChange={(e) => {
                                                    const updatedGames = config.games.map((g: any) =>
                                                        g.id === game.id
                                                            ? { ...g, stripeCheckoutUrl: e.target.value }
                                                            : g
                                                    );
                                                    onConfigChange({ ...config, games: updatedGames });
                                                }}
                                            />
                                            <p className="text-xs text-gray-500">
                                                Users will be redirected to this URL when clicking "Proceed to Checkout"
                                            </p>
                                        </div>

                                        {game.stripeCheckoutUrl && (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(game.stripeCheckoutUrl);
                                                        toast.success('Checkout URL copied!');
                                                    }}
                                                >
                                                    <Copy className="w-4 h-4 mr-1" />
                                                    Copy URL
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => window.open(game.stripeCheckoutUrl, '_blank')}
                                                >
                                                    <ExternalLink className="w-4 h-4 mr-1" />
                                                    Test URL
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => {
                                                        const updatedGames = config.games.map((g: any) =>
                                                            g.id === game.id
                                                                ? { ...g, stripeCheckoutUrl: '' }
                                                                : g
                                                        );
                                                        onConfigChange({ ...config, games: updatedGames });
                                                        toast.success('Checkout URL removed');
                                                    }}
                                                >
                                                    <X className="w-4 h-4 mr-1" />
                                                    Remove
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No games configured yet.</p>
                    )}
                </CardContent>
            </Card>

            {showPaymentSettingsModal && (
                <WidgetPaymentSettingsModal
                    isOpen={showPaymentSettingsModal}
                    onClose={() => setShowPaymentSettingsModal(false)}
                    venueId={embedContext?.venueId || ''}
                    games={config.games || []}
                    onUpdate={(updatedGames) => {
                        onConfigChange({ ...config, games: updatedGames });
                    }}
                />
            )}
        </div>
    );
};
