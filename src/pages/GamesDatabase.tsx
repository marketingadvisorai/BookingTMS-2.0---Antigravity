/**
 * Games/Events Page - Database Version
 * Uses real Supabase database for game management
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { PageHeader } from '../components/layout/PageHeader';
import { Gamepad2, Plus, Edit, Trash2, Loader2, Search, Filter, Users, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { useGames } from '../hooks/useGames';
import { useVenues } from '../hooks/venue/useVenues';

const difficultyLevels = [
  { value: 'Easy', label: 'Easy', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  { value: 'Medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { value: 'Hard', label: 'Hard', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  { value: 'Expert', label: 'Expert', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
];

export function GamesDatabase() {
  const { games, loading, createGame, updateGame, deleteGame } = useGames();
  const { venues } = useVenues();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedGame, setSelectedGame] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [venueFilter, setVenueFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    venue_id: '',
    name: '',
    description: '',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard' | 'Expert',
    duration: 60,
    min_players: 2,
    max_players: 8,
    price: 25.00,
    image_url: '',
    status: 'active' as 'active' | 'inactive' | 'maintenance',
    settings: {},
  });

  const resetForm = () => {
    setFormData({
      venue_id: '',
      name: '',
      description: '',
      difficulty: 'Medium',
      duration: 60,
      min_players: 2,
      max_players: 8,
      price: 25.00,
      image_url: '',
      status: 'active',
      settings: {},
    });
  };

  const handleCreateGame = async () => {
    if (!formData.name || !formData.venue_id) return;

    setSubmitting(true);
    try {
      await createGame(formData);
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error creating game:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateGame = async () => {
    if (!selectedGame) return;

    setSubmitting(true);
    try {
      await updateGame(selectedGame.id, formData);
      setShowEditDialog(false);
      setSelectedGame(null);
      resetForm();
    } catch (error) {
      console.error('Error updating game:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGame = async () => {
    if (!selectedGame) return;

    setSubmitting(true);
    try {
      await deleteGame(selectedGame.id);
      setShowDeleteDialog(false);
      setSelectedGame(null);
    } catch (error) {
      console.error('Error deleting game:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (game: any) => {
    setSelectedGame(game);
    setFormData({
      venue_id: game.venue_id,
      name: game.name,
      description: game.description || '',
      difficulty: game.difficulty,
      duration: game.duration,
      min_players: game.min_players,
      max_players: game.max_players,
      price: game.price,
      image_url: game.image_url || '',
      status: game.status,
      settings: game.settings || {},
    });
    setShowEditDialog(true);
  };

  const toggleGameStatus = async (game: any) => {
    const newStatus = game.status === 'active' ? 'inactive' : 'active';
    await updateGame(game.id, { status: newStatus });
  };

  const getDifficultyColor = (difficulty: string) => {
    return difficultyLevels.find(d => d.value === difficulty)?.color || 'bg-gray-100 text-gray-800';
  };

  // Filter games
  const filteredGames = games.filter(game => {
    const matchesSearch =
      game.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDifficulty = difficultyFilter === 'all' || game.difficulty === difficultyFilter;
    const matchesVenue = venueFilter === 'all' || game.venue_id === venueFilter;

    return matchesSearch && matchesDifficulty && matchesVenue;
  });

  // Calculate stats
  const stats = {
    total: games.length,
    active: games.filter(g => g.status === 'active').length,
    avgPrice: games.length > 0 ? games.reduce((sum, g) => sum + (g.price || 0), 0) / games.length : 0,
    totalCapacity: games.reduce((sum, g) => sum + (g.max_players || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Games & Events Management"
        description="Manage your escape rooms, games, and events with real-time sync"
        sticky
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-[#4f46e5]/20 rounded-lg flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-blue-600 dark:text-[#6366f1]" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-[#737373]">Total Games</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-[#737373]">Active Games</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-[#737373]">Avg Price</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  ${stats.avgPrice.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-[#737373]">Total Capacity</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalCapacity}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search games by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={venueFilter} onValueChange={setVenueFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Venues" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Venues</SelectItem>
            {venues.map(venue => (
              <SelectItem key={venue.id} value={venue.id}>
                {venue.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulty</SelectItem>
            {difficultyLevels.map(level => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca]"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Game
        </Button>
      </div>

      {/* Games Grid */}
      {filteredGames.length === 0 ? (
        <Card className="border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-[#1e1e1e] rounded-full flex items-center justify-center mx-auto mb-4">
              <Gamepad2 className="w-8 h-8 text-gray-400 dark:text-[#737373]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchTerm || difficultyFilter !== 'all' || venueFilter !== 'all' ? 'No games found' : 'No games yet'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-[#737373] mb-6 max-w-md mx-auto">
              {searchTerm || difficultyFilter !== 'all' || venueFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first game to get started'}
            </p>
            {!searchTerm && difficultyFilter === 'all' && venueFilter === 'all' && (
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Game
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => {
            const venue = venues.find(v => v.id === game.venue_id);
            return (
              <Card key={game.id} className="border-gray-200 dark:border-[#2a2a2a] hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate mb-2">{game.name}</CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getDifficultyColor(game.difficulty)}>
                          {game.difficulty}
                        </Badge>
                        <Badge variant={game.status === 'active' ? 'default' : 'secondary'}>
                          {game.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {game.description && (
                    <p className="text-sm text-gray-600 dark:text-[#737373] line-clamp-2">
                      {game.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-[#737373]">Venue:</span>
                      <span className="font-medium">{venue?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-[#737373] flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Duration:
                      </span>
                      <span className="font-medium">{game.duration} min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-[#737373] flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Players:
                      </span>
                      <span className="font-medium">{game.min_players}-{game.max_players}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-[#737373] flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        Price:
                      </span>
                      <span className="font-semibold text-lg">${game.price.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => openEditDialog(game)}
                      className="w-full justify-start"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Game
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleGameStatus(game)}
                        className="flex-1"
                      >
                        {game.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedGame(game);
                          setShowDeleteDialog(true);
                        }}
                        className="px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setShowEditDialog(false);
          resetForm();
          setSelectedGame(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{showEditDialog ? 'Edit Game' : 'Create New Game'}</DialogTitle>
            <DialogDescription>
              {showEditDialog ? 'Update game information' : 'Add a new game or escape room'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="venue">Venue *</Label>
                <Select value={formData.venue_id} onValueChange={(value) => setFormData({ ...formData, venue_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name} - {venue.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Game Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Prison Break"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the game..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={formData.difficulty} onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_players">Min Players</Label>
                  <Input
                    id="min_players"
                    type="number"
                    min="1"
                    value={formData.min_players}
                    onChange={(e) => setFormData({ ...formData, min_players: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_players">Max Players</Label>
                  <Input
                    id="max_players"
                    type="number"
                    min="1"
                    value={formData.max_players}
                    onChange={(e) => setFormData({ ...formData, max_players: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL (optional)</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setShowEditDialog(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button
              onClick={showEditDialog ? handleUpdateGame : handleCreateGame}
              disabled={!formData.name || !formData.venue_id || submitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {showEditDialog ? 'Update Game' : 'Create Game'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{selectedGame?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGame}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
