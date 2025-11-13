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
      const { error } = await (supabase
        .from('games')
        .update({
          stripe_product_id: productId || null,
          stripe_price_id: priceId || null,
          stripe_checkout_url: checkoutUrl || null,
          stripe_sync_status: 'synced',
          stripe_last_sync: new Date().toISOString(),
        }) as any)
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
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="h-6 w-6 text-blue-600" />
            Widget Payment Settings
          </DialogTitle>
          <DialogDescription>
            Manage Stripe payment configurations for all games in this widget
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{games.length}</p>
                    <p className="text-xs text-muted-foreground">Total Games</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{configuredGamesCount}</p>
                    <p className="text-xs text-muted-foreground">Configured</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{games.length - configuredGamesCount}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-4">
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
              Sync All from Database
            </Button>

            <Badge variant="outline" className="text-xs">
              {configuredGamesCount} of {games.length} games configured
            </Badge>
          </div>

          <Separator className="mb-4" />

          {/* Games List and Details */}
          <div className="grid grid-cols-3 gap-4">
            {/* Left: Games List */}
            <div className="col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Games</CardTitle>
                  <CardDescription className="text-xs">
                    Select a game to manage
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-1 p-4 pt-0">
                      {games.map((game) => {
                        const isConfigured = !!(game.stripe_product_id || game.stripe_checkout_url);
                        const isSelected = selectedGame?.id === game.id;

                        return (
                          <button
                            key={game.id}
                            onClick={() => {
                              setSelectedGame(game);
                              setActiveTab('overview');
                            }}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                              isSelected
                                ? 'bg-blue-50 border-blue-200 shadow-sm'
                                : 'hover:bg-gray-50 border-transparent'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{game.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  ${game.price.toFixed(2)}
                                </p>
                              </div>
                              {isConfigured ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Right: Game Details */}
            <div className="col-span-2">
              {selectedGame ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{selectedGame.name}</CardTitle>
                        <CardDescription className="mt-1">
                          Manage Stripe payment configuration
                        </CardDescription>
                      </div>
                      {(selectedGame.stripe_product_id || selectedGame.stripe_checkout_url) && (
                        <Badge className="bg-green-600">
                          <Check className="w-3 h-3 mr-1" />
                          Configured
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="edit">Edit</TabsTrigger>
                      </TabsList>

                      {/* Overview Tab */}
                      <TabsContent value="overview" className="space-y-4 mt-4">
                        {/* Current Configuration */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold">Current Configuration</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFetchFromDatabase(selectedGame.id)}
                              disabled={isLoading}
                              className="gap-2 h-8"
                            >
                              {isLoading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Database className="w-3 h-3" />
                              )}
                              Refresh
                            </Button>
                          </div>

                          {selectedGame.stripe_product_id ? (
                            <div className="space-y-3">
                              <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Stripe Product ID</Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={selectedGame.stripe_product_id}
                                    readOnly
                                    className="font-mono text-xs bg-muted"
                                  />
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9"
                                    onClick={() => {
                                      navigator.clipboard.writeText(selectedGame.stripe_product_id!);
                                      toast.success('Copied to clipboard');
                                    }}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>

                              {selectedGame.stripe_price_id && (
                                <div className="space-y-1.5">
                                  <Label className="text-xs text-muted-foreground">Stripe Price ID</Label>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={selectedGame.stripe_price_id}
                                      readOnly
                                      className="font-mono text-xs bg-muted"
                                    />
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-9 w-9"
                                      onClick={() => {
                                        navigator.clipboard.writeText(selectedGame.stripe_price_id!);
                                        toast.success('Copied to clipboard');
                                      }}
                                    >
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {selectedGame.stripe_checkout_url && (
                                <div className="space-y-1.5">
                                  <Label className="text-xs text-muted-foreground">Checkout URL</Label>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={selectedGame.stripe_checkout_url}
                                      readOnly
                                      className="font-mono text-xs bg-muted"
                                    />
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-9 w-9"
                                      onClick={() => window.open(selectedGame.stripe_checkout_url, '_blank')}
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Available Prices */}
                              {availablePrices.length > 0 && (
                                <div className="space-y-2 mt-4">
                                  <Label className="text-xs text-muted-foreground">
                                    Available Prices ({availablePrices.length})
                                  </Label>
                                  <div className="grid grid-cols-2 gap-2">
                                    {availablePrices.map((price: any, index: number) => (
                                      <div
                                        key={price.priceId || index}
                                        className="p-3 border rounded-lg bg-muted/50"
                                      >
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-semibold text-sm">
                                            ${((price.unitAmount || 0) / 100).toFixed(2)}
                                          </span>
                                          <Badge variant="outline" className="text-xs">
                                            {price.currency?.toUpperCase() || 'USD'}
                                          </Badge>
                                        </div>
                                        {price.lookupKey && (
                                          <p className="text-xs text-blue-600 truncate">
                                            🔑 {price.lookupKey}
                                          </p>
                                        )}
                                        <code className="text-xs text-muted-foreground block truncate mt-1">
                                          {price.priceId}
                                        </code>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFetchFromStripe(selectedGame.id, selectedGame.stripe_product_id!)}
                                disabled={isLoading}
                                className="w-full gap-2 mt-2"
                              >
                                {isLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Zap className="w-4 h-4" />
                                )}
                                Fetch Latest from Stripe
                              </Button>
                            </div>
                          ) : (
                            <Alert>
                              <Info className="h-4 w-4" />
                              <AlertDescription className="text-sm">
                                No Stripe configuration found. Click "Edit" to add payment settings.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </TabsContent>

                      {/* Edit Tab */}
                      <TabsContent value="edit" className="space-y-4 mt-4">
                        <Alert>
                          <Settings className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            Enter Stripe Product ID, Price ID, or Checkout URL. At least one field is required.
                          </AlertDescription>
                        </Alert>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-product-id" className="text-sm">
                              Stripe Product ID
                            </Label>
                            <Input
                              id="edit-product-id"
                              placeholder="prod_xxxxxxxxxxxxx"
                              value={editProductId}
                              onChange={(e) => setEditProductId(e.target.value)}
                              className="font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                              Find this in your Stripe dashboard under Products
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-price-id" className="text-sm">
                              Stripe Price ID <span className="text-muted-foreground">(Optional)</span>
                            </Label>
                            <Input
                              id="edit-price-id"
                              placeholder="price_xxxxxxxxxxxxx"
                              value={editPriceId}
                              onChange={(e) => setEditPriceId(e.target.value)}
                              className="font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                              Leave empty to fetch all prices automatically
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="edit-checkout-url" className="text-sm">
                              Stripe Checkout URL <span className="text-muted-foreground">(Optional)</span>
                            </Label>
                            <Input
                              id="edit-checkout-url"
                              placeholder="https://buy.stripe.com/..."
                              value={editCheckoutUrl}
                              onChange={(e) => setEditCheckoutUrl(e.target.value)}
                              className="font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                              Direct checkout link for customers
                            </p>
                          </div>

                          <Separator />

                          <div className="flex gap-2">
                            <Button
                              onClick={handleSaveConfiguration}
                              disabled={isSyncing}
                              className="flex-1 gap-2"
                            >
                              {isSyncing ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4" />
                                  Save Configuration
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditProductId(selectedGame.stripe_product_id || '');
                                setEditPriceId(selectedGame.stripe_price_id || '');
                                setEditCheckoutUrl(selectedGame.stripe_checkout_url || '');
                                setActiveTab('overview');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center py-12">
                    <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select a game from the list to manage its payment settings
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
