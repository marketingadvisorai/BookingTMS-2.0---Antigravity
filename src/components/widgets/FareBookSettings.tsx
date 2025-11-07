import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Plus, Trash2, Upload, Save, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';

interface FareBookSettingsProps {
  config: any;
  onConfigChange: (config: any) => void;
  onPreview: () => void;
}

export default function FareBookSettings({ config, onConfigChange, onPreview }: FareBookSettingsProps) {
  const [activeTab, setActiveTab] = useState('general');

  const handleGeneralSettingChange = (key: string, value: any) => {
    onConfigChange({
      ...config,
      [key]: value
    });
  };

  const handleAddCategory = () => {
    const newCategory = {
      id: `cat-${Date.now()}`,
      name: 'New Category',
      image: 'https://images.unsplash.com/photo-1569002925653-ed18f55d7292?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080'
    };
    onConfigChange({
      ...config,
      categories: [...(config.categories || []), newCategory]
    });
  };

  const handleUpdateCategory = (categoryId: string, updates: any) => {
    onConfigChange({
      ...config,
      categories: config.categories.map((cat: any) =>
        cat.id === categoryId ? { ...cat, ...updates } : cat
      )
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    onConfigChange({
      ...config,
      categories: config.categories.filter((cat: any) => cat.id !== categoryId)
    });
  };

  const handleAddGame = () => {
    const newGame = {
      id: `game-${Date.now()}`,
      name: 'New Game',
      image: 'https://images.unsplash.com/photo-1569002925653-ed18f55d7292?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      priceRange: '$25 - $30',
      ageRange: 'All ages',
      duration: '1 Hour',
      difficulty: 3,
      categoryId: config.categories?.[0]?.id || '',
      description: 'A thrilling escape room experience'
    };
    onConfigChange({
      ...config,
      games: [...(config.games || []), newGame]
    });
  };

  const handleUpdateGame = (gameId: string, updates: any) => {
    onConfigChange({
      ...config,
      games: config.games.map((game: any) =>
        game.id === gameId ? { ...game, ...updates } : game
      )
    });
  };

  const handleDeleteGame = (gameId: string) => {
    onConfigChange({
      ...config,
      games: config.games.filter((game: any) => game.id !== gameId)
    });
  };

  const handleAddTicketType = () => {
    const newTicketType = {
      id: `ticket-${Date.now()}`,
      name: 'New Ticket Type',
      description: 'Description',
      price: 30
    };
    onConfigChange({
      ...config,
      ticketTypes: [...(config.ticketTypes || []), newTicketType]
    });
  };

  const handleUpdateTicketType = (ticketId: string, updates: any) => {
    onConfigChange({
      ...config,
      ticketTypes: config.ticketTypes.map((ticket: any) =>
        ticket.id === ticketId ? { ...ticket, ...updates } : ticket
      )
    });
  };

  const handleDeleteTicketType = (ticketId: string) => {
    onConfigChange({
      ...config,
      ticketTypes: config.ticketTypes.filter((ticket: any) => ticket.id !== ticketId)
    });
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: `q-${Date.now()}`,
      question: 'New Question',
      type: 'select',
      options: ['Option 1', 'Option 2'],
      required: false
    };
    onConfigChange({
      ...config,
      additionalQuestions: [...(config.additionalQuestions || []), newQuestion]
    });
  };

  const handleUpdateQuestion = (questionId: string, updates: any) => {
    onConfigChange({
      ...config,
      additionalQuestions: config.additionalQuestions.map((q: any) =>
        q.id === questionId ? { ...q, ...updates } : q
      )
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    onConfigChange({
      ...config,
      additionalQuestions: config.additionalQuestions.filter((q: any) => q.id !== questionId)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900">FareBook Widget Settings</h2>
          <p className="text-sm text-gray-600 mt-1">Configure your booking widget appearance and options</p>
        </div>
        <Button onClick={onPreview} variant="outline" className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Preview Widget
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="tickets">Ticket Types</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Display Options</CardTitle>
              <CardDescription>Control what elements appear in your widget</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Secured Badge</Label>
                  <p className="text-sm text-gray-500">Display security badge in header</p>
                </div>
                <Switch
                  checked={config.showSecuredBadge}
                  onCheckedChange={(checked) => handleGeneralSettingChange('showSecuredBadge', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Health & Safety</Label>
                  <p className="text-sm text-gray-500">Display health and safety badge</p>
                </div>
                <Switch
                  checked={config.showHealthSafety}
                  onCheckedChange={(checked) => handleGeneralSettingChange('showHealthSafety', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Veteran Discount</Label>
                  <p className="text-sm text-gray-500">Show veteran ticket pricing option</p>
                </div>
                <Switch
                  checked={config.enableVeteranDiscount}
                  onCheckedChange={(checked) => handleGeneralSettingChange('enableVeteranDiscount', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cancellation Policy</CardTitle>
              <CardDescription>Set your cancellation and refund policy</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={config.cancellationPolicy || ''}
                onChange={(e) => handleGeneralSettingChange('cancellationPolicy', e.target.value)}
                placeholder="Enter your cancellation policy..."
                rows={4}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Settings */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>Manage your escape room categories</CardDescription>
                </div>
                <Button onClick={handleAddCategory} size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {config.categories?.map((category: any, index: number) => (
                    <Card key={category.id} className="border-2">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <Label>Category {index + 1}</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div>
                            <Label>Category Name</Label>
                            <Input
                              value={category.name}
                              onChange={(e) => handleUpdateCategory(category.id, { name: e.target.value })}
                              placeholder="e.g., Traditional Escape Rooms"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Image URL</Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                value={category.image}
                                onChange={(e) => handleUpdateCategory(category.id, { image: e.target.value })}
                                placeholder="https://..."
                              />
                              <Button variant="outline" size="icon">
                                <Upload className="w-4 h-4" />
                              </Button>
                            </div>
                            {category.image && (
                              <div className="mt-2 w-full h-32 rounded overflow-hidden">
                                <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Games Settings */}
        <TabsContent value="games" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Events / Rooms</CardTitle>
                  <CardDescription>Configure your escape room games</CardDescription>
                </div>
                <Button onClick={handleAddGame} size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Game
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {config.games?.map((game: any, index: number) => (
                    <Card key={game.id} className="border-2">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <Label>Game {index + 1}</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGame(game.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                              <Label>Game Name</Label>
                              <Input
                                value={game.name}
                                onChange={(e) => handleUpdateGame(game.id, { name: e.target.value })}
                                placeholder="e.g., Zombie Apocalypse"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Category</Label>
                              <Select
                                value={game.categoryId}
                                onValueChange={(value) => handleUpdateGame(game.id, { categoryId: value })}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {config.categories?.map((cat: any) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                      {cat.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Price Range</Label>
                              <Input
                                value={game.priceRange}
                                onChange={(e) => handleUpdateGame(game.id, { priceRange: e.target.value })}
                                placeholder="$25 - $30"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Age Range</Label>
                              <Input
                                value={game.ageRange}
                                onChange={(e) => handleUpdateGame(game.id, { ageRange: e.target.value })}
                                placeholder="All ages"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Duration</Label>
                              <Input
                                value={game.duration}
                                onChange={(e) => handleUpdateGame(game.id, { duration: e.target.value })}
                                placeholder="1 Hour"
                                className="mt-1"
                              />
                            </div>
                            <div className="col-span-2">
                              <Label>Difficulty (0-5 stars)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="5"
                                value={game.difficulty}
                                onChange={(e) => handleUpdateGame(game.id, { difficulty: parseInt(e.target.value) })}
                                className="mt-1"
                              />
                            </div>
                            <div className="col-span-2">
                              <Label>Description</Label>
                              <Textarea
                                value={game.description || ''}
                                onChange={(e) => handleUpdateGame(game.id, { description: e.target.value })}
                                placeholder="Brief description of the game..."
                                className="mt-1"
                                rows={2}
                              />
                            </div>
                            <div className="col-span-2">
                              <Label>Image URL</Label>
                              <div className="flex gap-2 mt-1">
                                <Input
                                  value={game.image}
                                  onChange={(e) => handleUpdateGame(game.id, { image: e.target.value })}
                                  placeholder="https://..."
                                />
                                <Button variant="outline" size="icon">
                                  <Upload className="w-4 h-4" />
                                </Button>
                              </div>
                              {game.image && (
                                <div className="mt-2 w-full h-32 rounded overflow-hidden">
                                  <img src={game.image} alt={game.name} className="w-full h-full object-cover" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ticket Types Settings */}
        <TabsContent value="tickets" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Ticket Types</CardTitle>
                  <CardDescription>Configure pricing and ticket options</CardDescription>
                </div>
                <Button onClick={handleAddTicketType} size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Ticket Type
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {config.ticketTypes?.map((ticket: any, index: number) => (
                  <Card key={ticket.id} className="border-2">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <Label>Ticket Type {index + 1}</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTicketType(ticket.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Type Name</Label>
                            <Input
                              value={ticket.name}
                              onChange={(e) => handleUpdateTicketType(ticket.id, { name: e.target.value })}
                              placeholder="e.g., Players"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Price ($)</Label>
                            <Input
                              type="number"
                              value={ticket.price}
                              onChange={(e) => handleUpdateTicketType(ticket.id, { price: parseFloat(e.target.value) })}
                              placeholder="30"
                              className="mt-1"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Description</Label>
                            <Input
                              value={ticket.description}
                              onChange={(e) => handleUpdateTicketType(ticket.id, { description: e.target.value })}
                              placeholder="e.g., Ages 6 & Up"
                              className="mt-1"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label>Minimum Age (optional)</Label>
                            <Input
                              type="number"
                              value={ticket.minAge || ''}
                              onChange={(e) => handleUpdateTicketType(ticket.id, { minAge: e.target.value ? parseInt(e.target.value) : undefined })}
                              placeholder="e.g., 6"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Additional Questions</CardTitle>
                  <CardDescription>Custom questions to ask during booking</CardDescription>
                </div>
                <Button onClick={handleAddQuestion} size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {config.additionalQuestions?.map((question: any, index: number) => (
                  <Card key={question.id} className="border-2">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <Label>Question {index + 1}</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div>
                          <Label>Question Text</Label>
                          <Input
                            value={question.question}
                            onChange={(e) => handleUpdateQuestion(question.id, { question: e.target.value })}
                            placeholder="e.g., How did you hear about us?"
                            className="mt-1"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Question Type</Label>
                            <Select
                              value={question.type}
                              onValueChange={(value) => handleUpdateQuestion(question.id, { type: value })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="select">Dropdown</SelectItem>
                                <SelectItem value="text">Text Input</SelectItem>
                                <SelectItem value="checkbox">Checkbox</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-end">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={question.required}
                                onCheckedChange={(checked) => handleUpdateQuestion(question.id, { required: checked })}
                              />
                              <Label>Required</Label>
                            </div>
                          </div>
                        </div>
                        {question.type === 'select' && (
                          <div>
                            <Label>Options (comma-separated)</Label>
                            <Input
                              value={question.options?.join(', ') || ''}
                              onChange={(e) =>
                                handleUpdateQuestion(question.id, {
                                  options: e.target.value.split(',').map((o: string) => o.trim())
                                })
                              }
                              placeholder="Option 1, Option 2, Option 3"
                              className="mt-1"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
