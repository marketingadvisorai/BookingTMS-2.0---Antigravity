# BookingTMS Component Library Reference
**Quick reference guide for all reusable components**

## 📋 Table of Contents
1. [UI Components (Shadcn)](#ui-components)
2. [Layout Components](#layout-components)
3. [Dashboard Components](#dashboard-components)
4. [Widget Components](#widget-components)
5. [Game Components](#game-components)
6. [Waiver Components](#waiver-components)

---

## 🎨 UI Components (Shadcn)

### Button
```tsx
import { Button } from '@/components/ui/button';

// Variants
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button variant="destructive">Delete</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// Dark mode support
<Button 
  style={{ backgroundColor: isDark ? '#4f46e5' : primaryColor }}
  className="text-white"
>
  Primary Action
</Button>
```

### Card
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

<Card className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : 'bg-white'}>
  <CardHeader>
    <CardTitle className={textClass}>Title</CardTitle>
    <CardDescription className={textMutedClass}>Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

### Input
```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div className="space-y-2">
  <Label htmlFor="name">Name</Label>
  <Input 
    id="name"
    placeholder="Enter name"
    value={value}
    onChange={(e) => setValue(e.target.value)}
  />
</div>

// With error
{error && <p className="text-sm text-red-500">{error}</p>}
```

### Select
```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Dialog
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white'}>
    <DialogHeader>
      <DialogTitle className={textClass}>Title</DialogTitle>
      <DialogDescription className={textMutedClass}>Description</DialogDescription>
    </DialogHeader>
    <div className="py-4">
      {/* Content */}
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button onClick={handleConfirm}>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Alert Dialog
```tsx
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';

<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Badge
```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Error</Badge>

// Custom colors
<Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-700'}>
  Success
</Badge>
```

### Table
```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column 1</TableHead>
      <TableHead>Column 2</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((row) => (
      <TableRow key={row.id}>
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.value}</TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="sm">Edit</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Tabs
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    Content 1
  </TabsContent>
  <TabsContent value="tab2">
    Content 2
  </TabsContent>
</Tabs>
```

### Checkbox
```tsx
import { Checkbox } from '@/components/ui/checkbox';

<div className="flex items-center gap-2">
  <Checkbox 
    id="terms"
    checked={checked}
    onCheckedChange={setChecked}
  />
  <label htmlFor="terms" className="text-sm">
    I agree to the terms
  </label>
</div>
```

### Switch
```tsx
import { Switch } from '@/components/ui/switch';

<div className="flex items-center gap-2">
  <Switch 
    checked={enabled}
    onCheckedChange={setEnabled}
  />
  <label className="text-sm">Enable feature</label>
</div>
```

### Textarea
```tsx
import { Textarea } from '@/components/ui/textarea';

<Textarea
  placeholder="Enter description"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  rows={4}
/>
```

### Tooltip
```tsx
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>
      <p>Tooltip text</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Calendar
```tsx
import { Calendar } from '@/components/ui/calendar';

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  className="rounded-md border"
/>
```

### Progress
```tsx
import { Progress } from '@/components/ui/progress';

<Progress value={progress} className="w-full" />
```

### Separator
```tsx
import { Separator } from '@/components/ui/separator';

<div>
  <p>Content above</p>
  <Separator className="my-4" />
  <p>Content below</p>
</div>
```

### Skeleton
```tsx
import { Skeleton } from '@/components/ui/skeleton';

<div className="space-y-2">
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
</div>
```

---

## 🏗️ Layout Components

### AdminLayout
```tsx
import { AdminLayout } from '@/components/layout/AdminLayout';

const MyPage = () => {
  return (
    <AdminLayout>
      {/* Page content */}
    </AdminLayout>
  );
};
```

**Features:**
- Responsive sidebar (desktop) / bottom nav (mobile)
- Header with theme toggle
- Dark mode support
- Automatic routing
- Mobile-optimized

### PageHeader
```tsx
import { PageHeader } from '@/components/layout/PageHeader';

<PageHeader
  title="Page Title"
  description="Optional page description"
  actions={
    <Button>
      <Plus className="w-4 h-4 mr-2" />
      Add New
    </Button>
  }
/>
```

**Props:**
- `title`: string (required)
- `description`: string (optional)
- `actions`: ReactNode (optional)
- `breadcrumbs`: ReactNode (optional)

### Sidebar
```tsx
import { Sidebar } from '@/components/layout/Sidebar';

// Used within AdminLayout - don't call directly
```

**Features:**
- Collapsible on desktop
- Hidden on mobile
- Active state highlighting (#4f46e5)
- Icon-only collapsed mode
- Dark mode support

### Header
```tsx
import { Header } from '@/components/layout/Header';

// Used within AdminLayout - don't call directly
```

**Features:**
- Search functionality
- Notifications
- User menu
- Theme toggle
- Mobile menu trigger

### MobileBottomNav
```tsx
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

// Used within AdminLayout - don't call directly
```

**Features:**
- Fixed bottom positioning
- 5 main navigation items
- Active state highlighting
- Safe area support
- Dark mode support

### ThemeToggle
```tsx
import { ThemeToggle } from '@/components/layout/ThemeToggle';

<ThemeToggle />
```

**Features:**
- Sun/Moon icon toggle
- Smooth transitions
- Persists to localStorage
- Works with ThemeContext

### ThemeContext
```tsx
import { useTheme } from '@/components/layout/ThemeContext';

const Component = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className={isDark ? 'dark-styles' : 'light-styles'}>
      {/* Content */}
    </div>
  );
};
```

---

## 📊 Dashboard Components

### KPICard
```tsx
import { KPICard } from '@/components/dashboard/KPICard';

<KPICard
  title="Total Bookings"
  value="1,234"
  change="+12.5%"
  trend="up"
  icon={<Calendar className="w-5 h-5" />}
/>
```

**Props:**
- `title`: string
- `value`: string | number
- `change`: string (optional)
- `trend`: 'up' | 'down' | 'neutral' (optional)
- `icon`: ReactNode (optional)
- `className`: string (optional)

**Features:**
- Dark mode support
- Trend indicators (green/red)
- Responsive sizing
- Icon support

---

## 🎯 Widget Components

### WidgetContainer
```tsx
import { WidgetContainer } from '@/components/widgets/WidgetContainer';

<WidgetContainer
  widgetType="calendar"
  config={config}
  theme="light"
>
  {/* Widget content */}
</WidgetContainer>
```

**Props:**
- `widgetType`: string
- `config`: WidgetConfig
- `theme`: 'light' | 'dark'
- `children`: ReactNode

### CalendarWidget
```tsx
import { CalendarWidget } from '@/components/widgets/CalendarWidget';

<CalendarWidget
  businessName="My Business"
  primaryColor="#4f46e5"
  theme="light"
/>
```

**Features:**
- Monthly calendar view
- Date selection
- Time slot booking
- Mobile responsive
- Dark mode support
- Custom branding colors

### FareBookWidget
```tsx
import { FareBookWidget } from '@/components/widgets/FareBookWidget';

<FareBookWidget
  businessName="Optimal Escape"
  primaryColor="#4f46e5"
  theme="dark"
/>
```

**Features:**
- Multi-step booking flow
- Categories → Games → Calendar → Timeslots → Tickets → Cart → Checkout
- Promo codes & gift cards
- Complete dark mode
- Mobile optimized
- Custom branding

### QuickBookWidget
```tsx
import { QuickBookWidget } from '@/components/widgets/QuickBookWidget';

<QuickBookWidget
  businessName="My Business"
  primaryColor="#4f46e5"
/>
```

**Features:**
- Single-page booking
- Quick date/time selection
- Minimal steps
- Fast checkout

### MultiStepWidget
```tsx
import { MultiStepWidget } from '@/components/widgets/MultiStepWidget';

<MultiStepWidget
  businessName="My Business"
  steps={['select', 'details', 'payment']}
/>
```

### PromoCodeInput
```tsx
import { PromoCodeInput } from '@/components/widgets/PromoCodeInput';

<PromoCodeInput
  onApply={(code) => handleApplyPromo(code)}
  onRemove={() => handleRemovePromo()}
  appliedCode={appliedCode}
  appliedDiscount={discount}
/>
```

**Props:**
- `onApply`: (code: string) => void
- `onRemove`: () => void (optional)
- `appliedCode`: string (optional)
- `appliedDiscount`: number (optional)
- `className`: string (optional)

### GiftCardInput
```tsx
import { GiftCardInput } from '@/components/widgets/GiftCardInput';

<GiftCardInput
  onApply={(code) => handleApplyGiftCard(code)}
  onRemove={() => handleRemoveGiftCard()}
  appliedCode={appliedCode}
  appliedAmount={amount}
/>
```

**Props:**
- `onApply`: (code: string) => void
- `onRemove`: () => void (optional)
- `appliedCode`: string (optional)
- `appliedAmount`: number (optional)
- `className`: string (optional)

### WidgetThemeContext
```tsx
import { useWidgetTheme } from '@/components/widgets/WidgetThemeContext';

const Widget = () => {
  const { widgetTheme, setWidgetTheme } = useWidgetTheme();
  const isDark = widgetTheme === 'dark';
  
  return (
    <div className={isDark ? 'dark-widget' : 'light-widget'}>
      {/* Widget content */}
    </div>
  );
};
```

### WidgetSettings
```tsx
import { WidgetSettings } from '@/components/widgets/WidgetSettings';

<WidgetSettings
  widgetType="calendar"
  onSave={(config) => handleSave(config)}
/>
```

### EmbedPreview
```tsx
import { EmbedPreview } from '@/components/widgets/EmbedPreview';

<EmbedPreview
  widgetType="calendar"
  config={config}
  embedCode={generatedCode}
/>
```

---

## 🎮 Game Components

### AddGameWizard
```tsx
import { AddGameWizard } from '@/components/games/AddGameWizard';

<AddGameWizard
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onComplete={(game) => handleGameAdded(game)}
/>
```

**Features:**
- Multi-step wizard
- Image upload
- Game details form
- Pricing configuration
- Availability settings
- Dark mode support

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `onComplete`: (game: Game) => void
- `editMode`: boolean (optional)
- `initialData`: Game (optional)

### ViewGameBookings
```tsx
import { ViewGameBookings } from '@/components/games/ViewGameBookings';

<ViewGameBookings
  gameId="game-123"
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
/>
```

**Features:**
- Calendar view of bookings
- List view of bookings
- Booking details
- Status management
- Export functionality

**Props:**
- `gameId`: string
- `isOpen`: boolean
- `onClose`: () => void
- `defaultView`: 'calendar' | 'list' (optional)

---

## 📄 Waiver Components

### WaiverTemplateEditor
```tsx
import { WaiverTemplateEditor } from '@/components/waivers/WaiverTemplateEditor';

<WaiverTemplateEditor
  template={template}
  onSave={(updatedTemplate) => handleSave(updatedTemplate)}
  onCancel={() => setEditing(false)}
/>
```

**Features:**
- Rich text editing
- Field insertion
- Preview mode
- Legal compliance checks
- Dark mode support

**Props:**
- `template`: WaiverTemplate (optional)
- `onSave`: (template: WaiverTemplate) => void
- `onCancel`: () => void
- `mode`: 'create' | 'edit'

### WaiverPreview
```tsx
import { WaiverPreview } from '@/components/waivers/WaiverPreview';

<WaiverPreview
  template={template}
  customerData={customerData}
/>
```

**Features:**
- Read-only preview
- Customer data merge
- Print-friendly
- PDF export

**Props:**
- `template`: WaiverTemplate
- `customerData`: CustomerData (optional)
- `showActions`: boolean (optional)

### ScanWaiverDialog
```tsx
import { ScanWaiverDialog } from '@/components/waivers/ScanWaiverDialog';

<ScanWaiverDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onScanComplete={(waiver) => handleScanned(waiver)}
/>
```

**Features:**
- QR code scanning
- Camera integration
- Waiver verification
- Error handling

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `onScanComplete`: (waiver: Waiver) => void
- `eventId`: string (optional)

### AttendeeListDialog
```tsx
import { AttendeeListDialog } from '@/components/waivers/AttendeeListDialog';

<AttendeeListDialog
  eventId="event-123"
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
/>
```

**Features:**
- Attendee list view
- Waiver status indicators
- Check-in functionality
- Search/filter
- Export capability

**Props:**
- `eventId`: string
- `isOpen`: boolean
- `onClose`: () => void
- `showActions`: boolean (optional)

---

## 🎨 Component Usage Patterns

### Standard Page Layout
```tsx
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';

const MyPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <AdminLayout>
      <PageHeader
        title="My Page"
        description="Page description"
        actions={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        }
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : 'bg-white'}>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Card content */}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default MyPage;
```

### Form Pattern
```tsx
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const MyForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ''
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };
  
  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-3">
          <Button variant="outline" type="button">Cancel</Button>
          <Button type="submit">Save</Button>
        </CardFooter>
      </form>
    </Card>
  );
};
```

### Data Table Pattern
```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2 } from 'lucide-react';

const DataTable = ({ data }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>
              <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                {item.status}
              </Badge>
            </TableCell>
            <TableCell>{item.date}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
```

---

## 📱 Responsive Component Patterns

### Mobile-Responsive Card Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
  {items.map(item => (
    <Card key={item.id}>
      {/* Card content */}
    </Card>
  ))}
</div>
```

### Responsive Navigation
```tsx
{/* Desktop sidebar */}
<aside className="hidden lg:block w-[280px]">
  <Sidebar />
</aside>

{/* Mobile drawer */}
<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
  <SheetContent side="left">
    <Sidebar />
  </SheetContent>
</Sheet>
```

### Responsive Typography
```tsx
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
  Responsive Heading
</h1>

<p className="text-sm sm:text-base md:text-lg">
  Responsive body text
</p>
```

---

**Last Updated**: November 2, 2025  
**For complete design guidelines**: See `/guidelines/DESIGN_SYSTEM.md`
