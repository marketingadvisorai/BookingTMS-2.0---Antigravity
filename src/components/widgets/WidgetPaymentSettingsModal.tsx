/**
 * Widget Payment Settings Modal
 * 
 * Professional interface for managing Stripe payment configurations for widget games.
 * Features:
 * - View all games with their Stripe configurations
 * - Edit product ID, price ID, and checkout URL
 * - Fetch data from database and Stripe API
 * - Sync configurations across systems
 * - Real-time validation and error handling
 * - Enterprise-grade UI with shadcn components
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  CreditCard,
  RefreshCw,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
  Save,
  Database,
  Zap,
  Info,
  DollarSign,
  Settings,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase/client';
import { StripeProductService } from '../../lib/stripe/stripeProductService';

interface Game {
  id: string;
  name: string;
  price: number;
  stripe_product_id?: string;
  stripe_price_id?: string;
  stripe_checkout_url?: string;
  stripe_prices?: any[];
  stripe_sync_status?: string;
}

interface WidgetPaymentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  venueId: string;
  onUpdate: (games: Game[]) => void;
}

export function WidgetPaymentSettingsModal({
  isOpen,
  onClose,
  games,
  venueId,
  onUpdate,
}: WidgetPaymentSettingsModalProps) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Edit form state
  const [editProductId, setEditProductId] = useState('');
  const [editPriceId, setEditPriceId] = useState('');
  const [editCheckoutUrl, setEditCheckoutUrl] = useState('');
  const [availablePrices, setAvailablePrices] = useState<any[]>([]);

  // Reset form when game changes
  useEffect(() => {
    if (selectedGame) {
      setEditProductId(selectedGame.stripe_product_id || '');
      setEditPriceId(selectedGame.stripe_price_id || '');
      setEditCheckoutUrl(selectedGame.stripe_checkout_url || '');
      setAvailablePrices(selectedGame.stripe_prices || []);
    }
  }, [selectedGame]);

  /**
   * Fetch fresh data from database for a specific game
   */
  const handleFetchFromDatabase = async (gameId: string) => {
    setIsLoading(true);
    try {
      console.log('📥 Fetching game data from database:', gameId);

      const { data: freshGame, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (error) {
        console.error('Database fetch error:', error);
        toast.error('Failed to fetch data from database');
        return;
      }

      if (freshGame) {
        const gameData = freshGame as any;
        const updatedGame: Game = {
          id: gameData.id,
          name: gameData.name,
          price: gameData.price,
          stripe_product_id: gameData.stripe_product_id,
          stripe_price_id: gameData.stripe_price_id,
          stripe_checkout_url: gameData.stripe_checkout_url,
          stripe_prices: gameData.stripe_prices,
          stripe_sync_status: gameData.stripe_sync_status,
        };

        // Update selected game
        setSelectedGame(updatedGame);

        // Update games list
        const updatedGames = games.map(g =>
          g.id === gameId ? updatedGame : g
        );
        onUpdate(updatedGames);

        toast.success('✅ Data fetched from database', {
          description: 'Game payment settings updated',
        });
      }
    } catch (err) {
      console.error('Error fetching from database:', err);
      toast.error('Failed to fetch data from database');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch product and prices from Stripe API
   */
  const handleFetchFromStripe = async (gameId: string, productId: string) => {
    if (!productId) {
      toast.error('Product ID is required to fetch from Stripe');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔍 Fetching product from Stripe:', productId);

      // Get product details and prices
      const result = await StripeProductService.linkExistingProduct({
        productId: productId,
      });

      console.log('✅ Stripe data fetched:', result);

      // Update selected game with Stripe data
      const updatedGame: Game = {
        ...selectedGame!,
        stripe_product_id: result.productId,
        stripe_price_id: result.priceId,
        stripe_prices: result.prices,
        stripe_sync_status: 'synced',
      };

      setSelectedGame(updatedGame);
      setAvailablePrices(result.prices);

      // Update games list
      const updatedGames = games.map(g =>
        g.id === gameId ? updatedGame : g
      );
      onUpdate(updatedGames);

      toast.success('✅ Data fetched from Stripe', {
        description: `Found ${result.prices.length} price(s)`,
      });
    } catch (err: any) {
      console.error('Error fetching from Stripe:', err);
      toast.error('Failed to fetch from Stripe', {
        description: err.message || 'Check product ID and try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save payment configuration for a game
   */
  const handleSaveConfiguration = async () => {
    if (!selectedGame) return;

    const productId = editProductId.trim();
    const priceId = editPriceId.trim();
    const checkoutUrl = editCheckoutUrl.trim();

    if (!productId && !checkoutUrl) {
      toast.error('Please enter at least a Product ID or Checkout URL');
      return;
    }

    setIsSyncing(true);
    try {
      console.log('💾 Saving payment configuration:', {
        gameId: selectedGame.id,
        productId,
        priceId,
        checkoutUrl,
      });

      // Update database
      // @ts-ignore - Supabase type inference issue
      const { error } = await supabase
        .from('games')
        .update({
          stripe_product_id: productId || null,
          stripe_price_id: priceId || null,
          stripe_checkout_url: checkoutUrl || null,
          stripe_sync_status: 'synced',
          stripe_last_sync: new Date().toISOString(),
        } as any)
        .eq('id', selectedGame.id);

      if (error) {
        console.error('Database update error:', error);
        toast.error('Failed to save configuration');
        return;
      }

      // Update local state
      const updatedGame: Game = {
        ...selectedGame,
        stripe_product_id: productId || undefined,
        stripe_price_id: priceId || undefined,
        stripe_checkout_url: checkoutUrl || undefined,
        stripe_sync_status: 'synced',
      };

      setSelectedGame(updatedGame);

      // Update games list
      const updatedGames = games.map(g =>
        g.id === selectedGame.id ? updatedGame : g
      );
      onUpdate(updatedGames);

      toast.success('✅ Configuration saved successfully', {
        description: 'Payment settings updated in database',
      });

      // Switch to overview tab
      setActiveTab('overview');
    } catch (err) {
      console.error('Error saving configuration:', err);
      toast.error('Failed to save configuration');
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Sync all games from database
   */
  const handleSyncAllGames = async () => {
    setIsSyncing(true);
    try {
      console.log('🔄 Syncing all games from database...');

      const gameIds = games.map(g => g.id);
      const { data: freshGames, error } = await supabase
        .from('games')
        .select('*')
        .in('id', gameIds);

      if (error) {
        console.error('Sync error:', error);
        toast.error('Failed to sync games');
        return;
      }

      if (freshGames) {
        const updatedGames = freshGames.map((fg: any) => ({
          id: fg.id,
          name: fg.name,
          price: fg.price,
          stripe_product_id: fg.stripe_product_id,
          stripe_price_id: fg.stripe_price_id,
          stripe_checkout_url: fg.stripe_checkout_url,
          stripe_prices: fg.stripe_prices,
          stripe_sync_status: fg.stripe_sync_status,
        }));

        onUpdate(updatedGames);

        toast.success('✅ All games synced', {
          description: `Updated ${updatedGames.length} game(s)`,
        });
      }
    } catch (err) {
      console.error('Error syncing games:', err);
      toast.error('Failed to sync games');
    } finally {
      setIsSyncing(false);
    }
  };

  // Count configured games
  const configuredGamesCount = games.filter(
    g => g.stripe_product_id || g.stripe_checkout_url
  ).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!w-[95vw] !max-w-[500px] !h-[95vh] !max-h-[95vh] sm:!w-[92vw] sm:!max-w-[800px] sm:!h-[92vh] md:!w-[90vw] md:!max-w-[1200px] md:!h-[90vh] lg:!w-[85vw] lg:!max-w-[2000px] lg:!h-[88vh] xl:!w-[80vw] xl:!max-w-[2000px] xl:!h-[85vh] p-0 overflow-hidden flex flex-col !rounded-lg">
        <DialogHeader className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-200 dark:border-[#2a2a2a] flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-semibold">
                  Stripe Payment Settings
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  Manage Stripe payment configurations for all games in this widget
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Provider Tabs */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 dark:border-[#2a2a2a] flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Provider:</span>

            {/* Stripe - Active */}
            <Button
              variant="default"
              size="sm"
              className="gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <span>Stripe</span>
              <Badge variant="secondary" className="bg-green-600 text-white text-xs">Active</Badge>
            </Button>

            {/* PayPal - Coming Soon */}
            <Button variant="outline" size="sm" className="gap-2" disabled>
              <span>PayPal</span>
              <Badge variant="outline" className="text-xs">Coming Soon</Badge>
            </Button>

            {/* 2Checkout - Coming Soon */}
            <Button variant="outline" size="sm" className="gap-2" disabled>
              <span>2Checkout</span>
              <Badge variant="outline" className="text-xs">Coming Soon</Badge>
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
            <Card className="border-gray-200 dark:border-[#2a2a2a]">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{games.length}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Games</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-[#2a2a2a]">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{configuredGamesCount}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Configured</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-[#2a2a2a]">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{games.length - configuredGamesCount}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Games Section Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Games</h3>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">{configuredGamesCount} of {games.length} configured</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncAllGames}
                disabled={isSyncing}
                className="gap-2"
              >
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Sync All</span>
              </Button>
            </div>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 pb-6">
            {games.map((game) => {
              const isConfigured = !!(game.stripe_product_id || game.stripe_checkout_url);

              return (
                <Card
                  key={game.id}
                  className="border-gray-200 dark:border-[#2a2a2a] hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedGame(game);
                    setActiveTab('overview');
                  }}
                >
                  <CardContent className="p-4">
                    {/* Game Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-base text-gray-900 dark:text-white">{game.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">${game.price.toFixed(2)}</p>
                      </div>
                      {isConfigured ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                      )}
                    </div>

                    {/* Configured Badge */}
                    {isConfigured ? (
                      <Badge className="bg-green-600 text-white mb-3">Configured</Badge>
                    ) : (
                      <Badge variant="outline" className="border-orange-600 text-orange-600 mb-3">Pending</Badge>
                    )}

                    {/* Product ID */}
                    {game.stripe_product_id && (
                      <div className="space-y-1.5 mb-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Product ID</p>
                        <p className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded truncate text-gray-900 dark:text-gray-100">
                          {game.stripe_product_id}
                        </p>
                      </div>
                    )}

                    {/* Price ID */}
                    {game.stripe_price_id && (
                      <div className="space-y-1.5">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Price ID</p>
                        <p className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded truncate text-gray-900 dark:text-gray-100">
                          {game.stripe_price_id}
                        </p>
                      </div>
                    )}

                    {/* Empty state for unconfigured */}
                    {!isConfigured && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-2">
                        Click to configure payment
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Edit Modal for Selected Game */}
          {selectedGame && (
            <Dialog open={!!selectedGame} onOpenChange={() => setSelectedGame(null)}>
              <DialogContent className="!w-[95vw] !max-w-[500px] sm:!max-w-[600px] md:!max-w-[700px]">
                <DialogHeader>
                  <DialogTitle>{selectedGame.name} - Payment Configuration</DialogTitle>
                  <DialogDescription>
                    Configure Stripe payment settings for this game
                  </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="space-y-3">
                      {selectedGame.stripe_product_id ? (
                        <>
                          <div className="space-y-2">
                            <Label className="text-sm">Product ID</Label>
                            <div className="flex gap-2">
                              <Input value={selectedGame.stripe_product_id} readOnly className="font-mono text-sm" />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedGame.stripe_product_id!);
                                  toast.success('Copied!');
                                }}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {selectedGame.stripe_price_id && (
                            <div className="space-y-2">
                              <Label className="text-sm">Price ID</Label>
                              <div className="flex gap-2">
                                <Input value={selectedGame.stripe_price_id} readOnly className="font-mono text-sm" />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    navigator.clipboard.writeText(selectedGame.stripe_price_id!);
                                    toast.success('Copied!');
                                  }}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>No configuration found. Use Edit tab to add settings.</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="edit" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-product-id">Stripe Product ID</Label>
                        <Input
                          id="edit-product-id"
                          placeholder="prod_xxxxxxxxxxxxx"
                          value={editProductId}
                          onChange={(e) => setEditProductId(e.target.value)}
                          className="font-mono"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-price-id">Stripe Price ID</Label>
                        <Input
                          id="edit-price-id"
                          placeholder="price_xxxxxxxxxxxxx"
                          value={editPriceId}
                          onChange={(e) => setEditPriceId(e.target.value)}
                          className="font-mono"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-checkout-url">Checkout URL (Optional)</Label>
                        <Input
                          id="edit-checkout-url"
                          placeholder="https://buy.stripe.com/..."
                          value={editCheckoutUrl}
                          onChange={(e) => setEditCheckoutUrl(e.target.value)}
                          className="font-mono"
                        />
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleSaveConfiguration} disabled={isSyncing} className="flex-1">
                          {isSyncing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => setSelectedGame(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
