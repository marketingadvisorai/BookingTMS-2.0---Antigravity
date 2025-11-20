import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Plus, Trash2, Upload, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';

interface WidgetSettingsProps {
  widgetType: string;
  config: any;
  onConfigChange: (config: any) => void;
  onPreview: () => void;
}

export default function WidgetSettings({ widgetType, config, onConfigChange, onPreview }: WidgetSettingsProps) {
  const [activeTab, setActiveTab] = useState('general');

  const handleGeneralSettingChange = (key: string, value: any) => {
    onConfigChange({
      ...config,
      [key]: value
    });
  };

  const handleAddGame = () => {
    const newGame = {
      id: `game-${Date.now()}`,
      name: 'New Experience',
      image: 'https://images.unsplash.com/photo-1569002925653-ed18f55d7292?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      priceRange: '$25 - $30',
      ageRange: 'All ages',
      duration: '1 Hour',
      difficulty: 3,
      description: 'A thrilling escape room experience',
      price: 30,
      tagline: 'An exciting adventure awaits',
      rating: 4.5,
      reviews: 100,
      players: '2-8 players',
      featured: false
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

  const getWidgetTitle = () => {
    const titles: Record<string, string> = {
      bookgo: 'BookGo Widget',
      calendar: 'Calendar Widget',
      singlegame: 'Single Game Widget',
      resolvex: 'Resolvex Grid Widget',
      quick: 'Quick Booking Widget',
      multistep: 'Multi-Step Widget'
    };
    return titles[widgetType] || 'Widget';
  };

  return (
    <div className="space-y-6 pb-24 sm:pb-28">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900">{getWidgetTitle()} Settings</h2>
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
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="tickets">Ticket Types</TabsTrigger>
          <TabsTrigger value="seo">SEO & GEO</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6 pb-24">
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
              <CardTitle>Widget Information</CardTitle>
              <CardDescription>Basic widget settings and text</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Widget Title</Label>
                <Input
                  value={config.widgetTitle || ''}
                  onChange={(e) => handleGeneralSettingChange('widgetTitle', e.target.value)}
                  placeholder="e.g., Book Your Adventure"
                />
              </div>
              <div className="space-y-2">
                <Label>Widget Description</Label>
                <Textarea
                  value={config.widgetDescription || ''}
                  onChange={(e) => handleGeneralSettingChange('widgetDescription', e.target.value)}
                  placeholder="Enter a description for your widget..."
                  rows={3}
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

        {/* Games/Experiences Settings */}
        <TabsContent value="games" className="space-y-6 pb-24">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Experiences / Games</CardTitle>
                  <CardDescription>Configure your escape room experiences</CardDescription>
                </div>
                <Button onClick={handleAddGame} size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Experience
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4 pb-16 sm:pb-20">
                <div className="space-y-4">
                  {config.games?.map((game: any, index: number) => (
                    <Card key={game.id} className="border-2">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <Label>Experience {index + 1}</Label>
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
                              <Label>Experience Name</Label>
                              <Input
                                value={game.name}
                                onChange={(e) => handleUpdateGame(game.id, { name: e.target.value })}
                                placeholder="e.g., Zombie Apocalypse"
                                className="mt-1"
                              />
                            </div>
                            <div className="col-span-2">
                              <Label>Tagline</Label>
                              <Input
                                value={game.tagline || ''}
                                onChange={(e) => handleUpdateGame(game.id, { tagline: e.target.value })}
                                placeholder="e.g., A thrilling adventure awaits"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Price ($)</Label>
                              <Input
                                type="number"
                                value={game.price || 30}
                                onChange={(e) => handleUpdateGame(game.id, { price: parseFloat(e.target.value) })}
                                placeholder="30"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Duration</Label>
                              <Input
                                value={game.duration || '1 Hour'}
                                onChange={(e) => handleUpdateGame(game.id, { duration: e.target.value })}
                                placeholder="1 Hour"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Age Range</Label>
                              <Input
                                value={game.ageRange || 'All ages'}
                                onChange={(e) => handleUpdateGame(game.id, { ageRange: e.target.value })}
                                placeholder="All ages"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Players</Label>
                              <Input
                                value={game.players || '2-8 players'}
                                onChange={(e) => handleUpdateGame(game.id, { players: e.target.value })}
                                placeholder="2-8 players"
                                className="mt-1"
                              />
                            </div>
                            <div className="col-span-2">
                              <Label>Difficulty Level (1-5)</Label>
                              <Input
                                type="number"
                                min="1"
                                max="5"
                                value={game.difficulty || 3}
                                onChange={(e) => handleUpdateGame(game.id, { difficulty: parseInt(e.target.value) })}
                                className="mt-1"
                              />
                            </div>
                            <div className="col-span-2">
                              <Label>Description</Label>
                              <Textarea
                                value={game.description || ''}
                                onChange={(e) => handleUpdateGame(game.id, { description: e.target.value })}
                                placeholder="Brief description of the experience..."
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
                            <div className="col-span-2">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={game.featured || false}
                                  onCheckedChange={(checked) => handleUpdateGame(game.id, { featured: checked })}
                                />
                                <Label>Featured Experience</Label>
                              </div>
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
        <TabsContent value="tickets" className="space-y-6 pb-24">
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO & GEO Settings */}
        <TabsContent value="seo" className="space-y-6 pb-24">
          <Card>
            <CardHeader>
              <CardTitle>SEO Optimization</CardTitle>
              <CardDescription>Configure search engine optimization settings for better visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Business Name</Label>
                <Input
                  value={config.businessName || ''}
                  onChange={(e) => handleGeneralSettingChange('businessName', e.target.value)}
                  placeholder="Your Escape Room Business Name"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">This will appear in page titles and meta tags</p>
              </div>

              <div>
                <Label>Meta Description</Label>
                <Textarea
                  value={config.metaDescription || ''}
                  onChange={(e) => handleGeneralSettingChange('metaDescription', e.target.value)}
                  placeholder="Describe your escape room business in 150-160 characters..."
                  className="mt-1 min-h-[80px]"
                  maxLength={160}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(config.metaDescription || '').length}/160 characters - This appears in search results
                </p>
              </div>

              <div>
                <Label>Keywords</Label>
                <Input
                  value={config.seoKeywords || ''}
                  onChange={(e) => handleGeneralSettingChange('seoKeywords', e.target.value)}
                  placeholder="escape room, puzzle adventure, team building, entertainment"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Comma-separated keywords relevant to your business</p>
              </div>

              <Separator />

              <div>
                <Label>Structured Data (Schema.org)</Label>
                <div className="flex items-center justify-between mt-2">
                  <div className="space-y-0.5">
                    <p className="text-sm text-gray-900">Enable LocalBusiness Schema</p>
                    <p className="text-xs text-gray-500">Helps search engines understand your business location and details</p>
                  </div>
                  <Switch
                    checked={config.enableLocalBusinessSchema ?? true}
                    onCheckedChange={(checked) => handleGeneralSettingChange('enableLocalBusinessSchema', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location & GEO Settings</CardTitle>
              <CardDescription>Configure geographic information for local SEO</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Street Address</Label>
                  <Input
                    value={config.streetAddress || ''}
                    onChange={(e) => handleGeneralSettingChange('streetAddress', e.target.value)}
                    placeholder="123 Main Street"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input
                    value={config.city || ''}
                    onChange={(e) => handleGeneralSettingChange('city', e.target.value)}
                    placeholder="New York"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>State/Province</Label>
                  <Input
                    value={config.state || ''}
                    onChange={(e) => handleGeneralSettingChange('state', e.target.value)}
                    placeholder="NY"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>ZIP/Postal Code</Label>
                  <Input
                    value={config.zipCode || ''}
                    onChange={(e) => handleGeneralSettingChange('zipCode', e.target.value)}
                    placeholder="10001"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input
                    value={config.country || ''}
                    onChange={(e) => handleGeneralSettingChange('country', e.target.value)}
                    placeholder="United States"
                    className="mt-1"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={config.phoneNumber || ''}
                    onChange={(e) => handleGeneralSettingChange('phoneNumber', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={config.emailAddress || ''}
                    onChange={(e) => handleGeneralSettingChange('emailAddress', e.target.value)}
                    placeholder="info@yourbusiness.com"
                    className="mt-1"
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label>Nearby Landmarks</Label>
                <Textarea
                  value={config.nearbyLandmarks || ''}
                  onChange={(e) => handleGeneralSettingChange('nearbyLandmarks', e.target.value)}
                  placeholder="Near Times Square, 2 blocks from Central Station, across from City Hall..."
                  className="mt-1 min-h-[60px]"
                />
                <p className="text-xs text-gray-500 mt-1">Helps customers find you and improves local search rankings</p>
              </div>

              <div>
                <Label>Parking & Transportation</Label>
                <Textarea
                  value={config.parkingInfo || ''}
                  onChange={(e) => handleGeneralSettingChange('parkingInfo', e.target.value)}
                  placeholder="Free parking available, accessible via Metro Blue Line, street parking with meters..."
                  className="mt-1 min-h-[60px]"
                />
                <p className="text-xs text-gray-500 mt-1">Accessibility information for customers</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Policies & Information</CardTitle>
              <CardDescription>Important business policies displayed on game detail pages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Cancellation Policy</Label>
                <Textarea
                  value={config.cancellationPolicy || ''}
                  onChange={(e) => handleGeneralSettingChange('cancellationPolicy', e.target.value)}
                  placeholder="Free cancellation up to 48 hours before booking. 24-48 hours: 50% refund..."
                  className="mt-1 min-h-[100px]"
                />
              </div>

              <div>
                <Label>Late Arrival Policy</Label>
                <Textarea
                  value={config.lateArrivalPolicy || ''}
                  onChange={(e) => handleGeneralSettingChange('lateArrivalPolicy', e.target.value)}
                  placeholder="Please arrive 15 minutes early. Late arrivals may result in reduced playing time..."
                  className="mt-1 min-h-[80px]"
                />
              </div>

              <div>
                <Label>Health & Safety Information</Label>
                <Textarea
                  value={config.healthSafetyInfo || ''}
                  onChange={(e) => handleGeneralSettingChange('healthSafetyInfo', e.target.value)}
                  placeholder="Regular sanitization, emergency exits available, first aid trained staff..."
                  className="mt-1 min-h-[80px]"
                />
              </div>

              <div>
                <Label>Accessibility Information</Label>
                <Textarea
                  value={config.accessibilityInfo || ''}
                  onChange={(e) => handleGeneralSettingChange('accessibilityInfo', e.target.value)}
                  placeholder="Wheelchair accessible, elevator access, accessible restrooms, service animals welcome..."
                  className="mt-1 min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Media & Reviews</CardTitle>
              <CardDescription>Connect your social profiles for better SEO</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Facebook URL</Label>
                  <Input
                    value={config.facebookUrl || ''}
                    onChange={(e) => handleGeneralSettingChange('facebookUrl', e.target.value)}
                    placeholder="https://facebook.com/yourbusiness"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Instagram URL</Label>
                  <Input
                    value={config.instagramUrl || ''}
                    onChange={(e) => handleGeneralSettingChange('instagramUrl', e.target.value)}
                    placeholder="https://instagram.com/yourbusiness"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Twitter URL</Label>
                  <Input
                    value={config.twitterUrl || ''}
                    onChange={(e) => handleGeneralSettingChange('twitterUrl', e.target.value)}
                    placeholder="https://twitter.com/yourbusiness"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>TripAdvisor URL</Label>
                  <Input
                    value={config.tripadvisorUrl || ''}
                    onChange={(e) => handleGeneralSettingChange('tripadvisorUrl', e.target.value)}
                    placeholder="https://tripadvisor.com/..."
                    className="mt-1"
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label>Google My Business ID</Label>
                <Input
                  value={config.googleBusinessId || ''}
                  onChange={(e) => handleGeneralSettingChange('googleBusinessId', e.target.value)}
                  placeholder="Your Google Business Profile ID"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Improves local search rankings and map visibility</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6 pb-24">
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
      {/* Bottom spacer to provide comfortable blank space after last option */}
      <div className="h-12 sm:h-20" aria-hidden="true" />
    </div>
  );
}
