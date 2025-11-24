'use client';

import { Building2, DollarSign, TrendingUp, Users, Crown, CheckCircle, XCircle, Eye, Edit, Trash2, ExternalLink, Settings, Code, ChevronDown, MapPin, Copy, ChevronLeft, ChevronRight, List, Star, GripVertical, Calendar, Gamepad2, Columns3, CreditCard } from 'lucide-react';
import { KPICard } from '../components/dashboard/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/button';
import { useTheme } from '../components/layout/ThemeContext';
import { Switch } from '../components/ui/switch';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { SystemAdminHeader } from '../components/systemadmin/SystemAdminHeader';
import { ProfileDropdown } from '../components/systemadmin/ProfileDropdown';
import { ProfileSettingsModal } from '../components/systemadmin/ProfileSettingsModal';
import { ProfileEmbedModal } from '../components/systemadmin/ProfileEmbedModal';
import { ViewOwnerDialog } from '../components/systemadmin/ViewOwnerDialog';
import { EditOwnerDialog } from '../components/systemadmin/EditOwnerDialog';
import { DeleteOwnerDialog } from '../components/systemadmin/DeleteOwnerDialog';
import { AddOwnerDialog } from '../components/systemadmin/AddOwnerDialog';
import { ManagePlanDialog } from '../components/systemadmin/ManagePlanDialog';
import { SystemAdminSettingsModal } from '../components/systemadmin/SystemAdminSettingsModal';
import { SystemAdminNotificationsModal } from '../components/systemadmin/SystemAdminNotificationsModal';
import { useFeatureFlags } from '../lib/featureflags/FeatureFlagContext';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Checkbox } from '../components/ui/checkbox';
import { useVenues } from '../hooks/venue/useVenues';
import { useGames } from '../hooks/useGames';
import { useBookings } from '../hooks/useBookings';
import { useOrganizations as useOrgsFeature, usePlatformMetrics, useOrganizationMetrics } from '../features/system-admin/hooks';
import { SystemAdminProvider } from '../features/system-admin';
import { PaymentsSubscriptionsSection } from '../components/systemadmin/PaymentsSubscriptionsSection';
import { AccountPerformanceMetrics } from '../components/systemadmin/AccountPerformanceMetrics';
import { UserAccountStripeConnect } from '../components/systemadmin/UserAccountStripeConnect';
import { ConnectedAccountsManagement } from '../components/systemadmin/ConnectedAccountsManagement';
import { RecentTransactionActivity } from '../components/systemadmin/RecentTransactionActivity';

// Account type for account selector (mapped from Organization)
interface Account {
  id: string;
  name: string;
  company: string;
  phone: string;
  status: 'active' | 'inactive';
  /**
   * Stripe connected account ID from Supabase organizations.stripe_account_id
   * Used by PaymentsSubscriptionsSection to display the live connected account
   */
  stripeAccountId?: string;
  isRecent?: boolean;
}

// Mock data for owners and venues (with accountId for filtering)
const ownersData = [
  {
    id: 1,
    accountId: 1,
    ownerName: 'John Smith',
    organizationName: 'Riddle Me This Escape Rooms',
    organizationId: 'ORG-001',
    website: 'https://riddlemethis.com',
    email: 'john@escaperooms.com',
    plan: 'Pro',
    venues: 5,
    status: 'active',
    features: ['AI Agents', 'Waivers', 'Analytics'],
    profileSlug: 'riddle-me-this',
    locations: 2,
  },
  {
    id: 2,
    accountId: 2,
    ownerName: 'Sarah Johnson',
    organizationName: 'Xperience Games - Calgary',
    organizationId: 'ORG-002',
    website: 'https://xperiencegames.ca',
    email: 'sarah@mysterygames.com',
    plan: 'Growth',
    venues: 3,
    status: 'active',
    features: ['Waivers', 'Booking Widgets'],
    profileSlug: 'xperience-games-calgary',
    locations: 1,
  },
  {
    id: 3,
    accountId: 3,
    ownerName: 'Michael Chen',
    organizationName: 'Adventure Zone Escape Rooms',
    organizationId: 'ORG-003',
    website: 'https://adventurezone.com',
    email: 'michael@adventurezone.com',
    plan: 'Basic',
    venues: 1,
    status: 'active',
    features: ['Booking Widgets'],
    profileSlug: 'adventure-zone',
    locations: 1,
  },
  {
    id: 4,
    accountId: 4,
    ownerName: 'Emily Davis',
    organizationName: 'Puzzle Palace Adventures',
    organizationId: 'ORG-004',
    website: 'https://puzzlepalace.com',
    email: 'emily@puzzlepalace.com',
    plan: 'Pro',
    venues: 4,
    status: 'inactive',
    features: ['AI Agents', 'Waivers', 'Analytics'],
    profileSlug: 'puzzle-palace',
    locations: 2,
  },
  {
    id: 5,
    accountId: 5,
    ownerName: 'David Wilson',
    organizationName: 'Quest Rooms Experience',
    organizationId: 'ORG-005',
    website: 'https://questrooms.com',
    email: 'david@questrooms.com',
    plan: 'Growth',
    venues: 2,
    status: 'active',
    features: ['Waivers', 'Marketing'],
    profileSlug: 'quest-rooms',
    locations: 1,
  },
  {
    id: 6,
    accountId: 6,
    ownerName: 'Lisa Anderson',
    organizationName: 'Mystery Manor Games',
    organizationId: 'ORG-006',
    website: 'https://mysterymanor.com',
    email: 'lisa@mysterymanor.com',
    plan: 'Pro',
    venues: 6,
    status: 'active',
    features: ['AI Agents', 'Waivers', 'Analytics'],
    profileSlug: 'mystery-manor',
    locations: 2,
  },
  {
    id: 7,
    accountId: 7,
    ownerName: 'James Martinez',
    organizationName: 'Escape Lab Toronto',
    organizationId: 'ORG-007',
    website: 'https://escapelab.ca',
    email: 'james@escapelab.ca',
    plan: 'Basic',
    venues: 2,
    status: 'active',
    features: ['Booking Widgets'],
    profileSlug: 'escape-lab',
    locations: 1,
  },
  {
    id: 8,
    accountId: 8,
    ownerName: 'Rachel Green',
    organizationName: 'Brain Teaser Rooms',
    organizationId: 'ORG-008',
    website: 'https://brainteaser.com',
    email: 'rachel@brainteaser.com',
    plan: 'Growth',
    venues: 3,
    status: 'active',
    features: ['Waivers', 'Marketing'],
    profileSlug: 'brain-teaser',
    locations: 1,
  },
  {
    id: 9,
    accountId: 9,
    ownerName: 'Tom Rodriguez',
    organizationName: 'The Escape Company',
    organizationId: 'ORG-009',
    website: 'https://escapecompany.com',
    email: 'tom@escapecompany.com',
    plan: 'Pro',
    venues: 8,
    status: 'active',
    features: ['AI Agents', 'Waivers', 'Analytics', 'Marketing'],
    profileSlug: 'escape-company',
    locations: 3,
  },
  {
    id: 10,
    accountId: 10,
    ownerName: 'Nina Patel',
    organizationName: 'Lock & Key Adventures',
    organizationId: 'ORG-010',
    website: 'https://lockandkey.com',
    email: 'nina@lockandkey.com',
    plan: 'Basic',
    venues: 1,
    status: 'active',
    features: ['Booking Widgets'],
    profileSlug: 'lock-and-key',
    locations: 1,
  },
  {
    id: 11,
    accountId: 11,
    ownerName: 'Chris Brown',
    organizationName: 'Enigma Escape Rooms',
    organizationId: 'ORG-011',
    website: 'https://enigmaescape.com',
    email: 'chris@enigmaescape.com',
    plan: 'Growth',
    venues: 4,
    status: 'active',
    features: ['Waivers', 'Marketing'],
    profileSlug: 'enigma-escape',
    locations: 2,
  },
  {
    id: 12,
    accountId: 12,
    ownerName: 'Amanda Lee',
    organizationName: 'Cipher City Games',
    organizationId: 'ORG-012',
    website: 'https://ciphercity.com',
    email: 'amanda@ciphercity.com',
    plan: 'Pro',
    venues: 5,
    status: 'active',
    features: ['AI Agents', 'Waivers', 'Analytics'],
    profileSlug: 'cipher-city',
    locations: 2,
  },
  {
    id: 13,
    accountId: 1,
    ownerName: 'Kevin White',
    organizationName: 'Breakout Room Adventures',
    organizationId: 'ORG-013',
    website: 'https://breakoutrooms.com',
    email: 'kevin@breakoutrooms.com',
    plan: 'Basic',
    venues: 2,
    status: 'active',
    features: ['Booking Widgets'],
    profileSlug: 'breakout-rooms',
    locations: 1,
  },
  {
    id: 14,
    accountId: 2,
    ownerName: 'Sandra Kim',
    organizationName: 'The Puzzle Box',
    organizationId: 'ORG-014',
    website: 'https://puzzlebox.com',
    email: 'sandra@puzzlebox.com',
    plan: 'Growth',
    venues: 3,
    status: 'active',
    features: ['Waivers', 'Marketing'],
    profileSlug: 'puzzle-box',
    locations: 1,
  },
  {
    id: 15,
    accountId: 3,
    ownerName: 'Mark Thompson',
    organizationName: 'Exit Strategy Games',
    organizationId: 'ORG-015',
    website: 'https://exitstrategy.com',
    email: 'mark@exitstrategy.com',
    plan: 'Pro',
    venues: 7,
    status: 'active',
    features: ['AI Agents', 'Waivers', 'Analytics', 'Marketing'],
    profileSlug: 'exit-strategy',
    locations: 3,
  },
  {
    id: 16,
    accountId: 4,
    ownerName: 'Jennifer Harris',
    organizationName: 'Code Red Escape Rooms',
    organizationId: 'ORG-016',
    website: 'https://coderedescape.com',
    email: 'jen@coderedescape.com',
    plan: 'Basic',
    venues: 1,
    status: 'inactive',
    features: ['Booking Widgets'],
    profileSlug: 'code-red',
    locations: 1,
  },
  {
    id: 17,
    accountId: 5,
    ownerName: 'Daniel Park',
    organizationName: 'Mind Games Interactive',
    organizationId: 'ORG-017',
    website: 'https://mindgamesint.com',
    email: 'daniel@mindgamesint.com',
    plan: 'Growth',
    venues: 4,
    status: 'active',
    features: ['Waivers', 'Marketing'],
    profileSlug: 'mind-games',
    locations: 2,
  },
  {
    id: 18,
    accountId: 6,
    ownerName: 'Michelle Wong',
    organizationName: 'The Great Escape Vancouver',
    organizationId: 'ORG-018',
    website: 'https://greatescape.ca',
    email: 'michelle@greatescape.ca',
    plan: 'Pro',
    venues: 6,
    status: 'active',
    features: ['AI Agents', 'Waivers', 'Analytics'],
    profileSlug: 'great-escape',
    locations: 2,
  },
  {
    id: 19,
    accountId: 7,
    ownerName: 'Robert Taylor',
    organizationName: 'Locked In Entertainment',
    organizationId: 'ORG-019',
    website: 'https://lockedin.com',
    email: 'robert@lockedin.com',
    plan: 'Basic',
    venues: 2,
    status: 'active',
    features: ['Booking Widgets'],
    profileSlug: 'locked-in',
    locations: 1,
  },
  {
    id: 20,
    accountId: 8,
    ownerName: 'Laura Garcia',
    organizationName: 'Secret Chamber Games',
    organizationId: 'ORG-020',
    website: 'https://secretchamber.com',
    email: 'laura@secretchamber.com',
    plan: 'Growth',
    venues: 3,
    status: 'active',
    features: ['Waivers', 'Marketing'],
    profileSlug: 'secret-chamber',
    locations: 1,
  },
  {
    id: 21,
    accountId: 9,
    ownerName: 'Steven Miller',
    organizationName: 'Vault Escape Experience',
    organizationId: 'ORG-021',
    website: 'https://vaultescape.com',
    email: 'steven@vaultescape.com',
    plan: 'Pro',
    venues: 5,
    status: 'active',
    features: ['AI Agents', 'Waivers', 'Analytics'],
    profileSlug: 'vault-escape',
    locations: 2,
  },
  {
    id: 22,
    accountId: 10,
    ownerName: 'Jessica Adams',
    organizationName: 'Challenge Accepted Games',
    organizationId: 'ORG-022',
    website: 'https://challengeaccepted.com',
    email: 'jessica@challengeaccepted.com',
    plan: 'Basic',
    venues: 1,
    status: 'active',
    features: ['Booking Widgets'],
    profileSlug: 'challenge-accepted',
    locations: 1,
  },
];

// Mock venue data with IDs
const venuesData = [
  { id: 'VEN-001', name: 'Downtown Location', organizationId: 'ORG-001', games: 12 },
  { id: 'VEN-002', name: 'Westside Branch', organizationId: 'ORG-001', games: 10 },
  { id: 'VEN-003', name: 'East End', organizationId: 'ORG-001', games: 8 },
  { id: 'VEN-004', name: 'Southside', organizationId: 'ORG-001', games: 9 },
  { id: 'VEN-005', name: 'North Quarter', organizationId: 'ORG-001', games: 11 },
  { id: 'VEN-006', name: 'Main Street', organizationId: 'ORG-002', games: 7 },
  { id: 'VEN-007', name: 'Market District', organizationId: 'ORG-002', games: 6 },
  { id: 'VEN-008', name: 'Central Plaza', organizationId: 'ORG-002', games: 8 },
  { id: 'VEN-009', name: 'Adventure Hub', organizationId: 'ORG-003', games: 5 },
  { id: 'VEN-010', name: 'Puzzle Palace', organizationId: 'ORG-004', games: 9 },
  { id: 'VEN-011', name: 'Mystery Manor', organizationId: 'ORG-004', games: 10 },
  { id: 'VEN-012', name: 'Enigma Center', organizationId: 'ORG-005', games: 6 },
  { id: 'VEN-013', name: 'Riddle Room', organizationId: 'ORG-005', games: 7 },
  { id: 'VEN-014', name: 'Secret Chamber', organizationId: 'ORG-006', games: 8 },
  { id: 'VEN-015', name: 'Hidden Door', organizationId: 'ORG-007', games: 11 },
  { id: 'VEN-016', name: 'Quest Station', organizationId: 'ORG-008', games: 5 },
  { id: 'VEN-017', name: 'Escape Haven', organizationId: 'ORG-009', games: 9 },
  { id: 'VEN-018', name: 'Breakout Zone', organizationId: 'ORG-009', games: 8 },
  { id: 'VEN-019', name: 'Liberty Square', organizationId: 'ORG-010', games: 7 },
  { id: 'VEN-020', name: 'Freedom Plaza', organizationId: 'ORG-011', games: 10 },
  { id: 'VEN-021', name: 'Victory Lane', organizationId: 'ORG-011', games: 9 },
  { id: 'VEN-022', name: 'Championship Court', organizationId: 'ORG-011', games: 8 },
  { id: 'VEN-023', name: 'Wisdom Way', organizationId: 'ORG-012', games: 6 },
  { id: 'VEN-024', name: 'Innovation Hub', organizationId: 'ORG-013', games: 11 },
  { id: 'VEN-025', name: 'Discovery District', organizationId: 'ORG-013', games: 10 },
  { id: 'VEN-026', name: 'Revelation Room', organizationId: 'ORG-014', games: 7 },
  { id: 'VEN-027', name: 'Cipher Suite', organizationId: 'ORG-015', games: 9 },
  { id: 'VEN-028', name: 'Code Center', organizationId: 'ORG-015', games: 8 },
  { id: 'VEN-029', name: 'Logic Lab', organizationId: 'ORG-016', games: 5 },
  { id: 'VEN-030', name: 'Brain Box', organizationId: 'ORG-016', games: 6 },
  { id: 'VEN-031', name: 'Mind Maze', organizationId: 'ORG-017', games: 12 },
  { id: 'VEN-032', name: 'Thought Theatre', organizationId: 'ORG-017', games: 11 },
  { id: 'VEN-033', name: 'Intellect Inn', organizationId: 'ORG-017', games: 10 },
  { id: 'VEN-034', name: 'Genius Gallery', organizationId: 'ORG-017', games: 9 },
  { id: 'VEN-035', name: 'Wonder Workshop', organizationId: 'ORG-018', games: 8 },
  { id: 'VEN-036', name: 'Marvel Mansion', organizationId: 'ORG-018', games: 9 },
  { id: 'VEN-037', name: 'Spectacular Space', organizationId: 'ORG-018', games: 10 },
  { id: 'VEN-038', name: 'Amazing Arena', organizationId: 'ORG-018', games: 11 },
  { id: 'VEN-039', name: 'Fantastic Fort', organizationId: 'ORG-018', games: 7 },
  { id: 'VEN-040', name: 'Incredible Isle', organizationId: 'ORG-018', games: 8 },
  { id: 'VEN-041', name: 'Security Station', organizationId: 'ORG-019', games: 6 },
  { id: 'VEN-042', name: 'Guard Gate', organizationId: 'ORG-019', games: 7 },
  { id: 'VEN-043', name: 'Mystery Museum', organizationId: 'ORG-020', games: 9 },
  { id: 'VEN-044', name: 'Secret Studio', organizationId: 'ORG-020', games: 8 },
  { id: 'VEN-045', name: 'Hidden Hideout', organizationId: 'ORG-020', games: 10 },
  { id: 'VEN-046', name: 'Treasure Tower', organizationId: 'ORG-021', games: 11 },
  { id: 'VEN-047', name: 'Gold Gallery', organizationId: 'ORG-021', games: 9 },
  { id: 'VEN-048', name: 'Jewel Junction', organizationId: 'ORG-021', games: 10 },
  { id: 'VEN-049', name: 'Diamond Den', organizationId: 'ORG-021', games: 8 },
  { id: 'VEN-050', name: 'Ruby Room', organizationId: 'ORG-021', games: 12 },
  { id: 'VEN-051', name: 'Victory Vault', organizationId: 'ORG-022', games: 7 },
];

// Mock game data with IDs
const gamesData = [
  { id: 'GAME-001', name: 'The Bank Heist', venueId: 'VEN-001', difficulty: 'Hard' },
  { id: 'GAME-002', name: 'Prison Break', venueId: 'VEN-001', difficulty: 'Medium' },
  { id: 'GAME-003', name: 'Haunted Manor', venueId: 'VEN-001', difficulty: 'Easy' },
  { id: 'GAME-004', name: 'Zombie Apocalypse', venueId: 'VEN-001', difficulty: 'Hard' },
  { id: 'GAME-005', name: 'Lost Temple', venueId: 'VEN-001', difficulty: 'Medium' },
  { id: 'GAME-006', name: 'Space Station', venueId: 'VEN-001', difficulty: 'Hard' },
  { id: 'GAME-007', name: 'Murder Mystery', venueId: 'VEN-001', difficulty: 'Medium' },
  { id: 'GAME-008', name: 'Pirate Ship', venueId: 'VEN-001', difficulty: 'Easy' },
  { id: 'GAME-009', name: 'Mad Scientist Lab', venueId: 'VEN-001', difficulty: 'Hard' },
  { id: 'GAME-010', name: 'Casino Royale', venueId: 'VEN-001', difficulty: 'Medium' },
  { id: 'GAME-011', name: 'Jungle Adventure', venueId: 'VEN-001', difficulty: 'Medium' },
  { id: 'GAME-012', name: 'Time Traveler', venueId: 'VEN-001', difficulty: 'Hard' },
  // More games for other venues (abbreviated for brevity)
  { id: 'GAME-013', name: 'Spy Mission', venueId: 'VEN-002', difficulty: 'Hard' },
  { id: 'GAME-014', name: 'Egyptian Tomb', venueId: 'VEN-002', difficulty: 'Medium' },
  { id: 'GAME-015', name: 'Wild West Saloon', venueId: 'VEN-002', difficulty: 'Easy' },
  { id: 'GAME-016', name: 'Submarine Escape', venueId: 'VEN-002', difficulty: 'Hard' },
  { id: 'GAME-017', name: 'Sherlock Holmes', venueId: 'VEN-002', difficulty: 'Medium' },
  { id: 'GAME-018', name: 'Asylum', venueId: 'VEN-002', difficulty: 'Hard' },
  { id: 'GAME-019', name: 'Wizard Tower', venueId: 'VEN-002', difficulty: 'Medium' },
  { id: 'GAME-020', name: 'Dragon Lair', venueId: 'VEN-002', difficulty: 'Hard' },
  { id: 'GAME-021', name: 'Vampire Castle', venueId: 'VEN-002', difficulty: 'Medium' },
  { id: 'GAME-022', name: 'Alien Invasion', venueId: 'VEN-002', difficulty: 'Hard' },
  // Continue pattern for remaining venues...
];

// Plan cards data
const plansData = [
  {
    name: 'Basic',
    price: 99,
    features: ['Up to 2 venues', 'Booking Widgets', 'Basic Analytics', 'Email Support'],
    subscribers: 12,
    color: '#6b7280',
    isFeatured: false,
    discount: null,
  },
  {
    name: 'Growth',
    price: 299,
    features: ['Up to 5 venues', 'All Basic features', 'Waivers', 'Marketing Tools', 'Priority Support'],
    subscribers: 18,
    color: '#10b981',
    isFeatured: true, // Featured as "Most Popular"
    discount: null,
  },
  {
    name: 'Pro',
    price: 599,
    features: ['Unlimited venues', 'All Growth features', 'AI Agents', 'Advanced Analytics', 'Custom Branding', 'Dedicated Support'],
    subscribers: 12,
    color: '#4f46e5',
    isFeatured: false,
    discount: null,
  },
];

interface SystemAdminDashboardInnerProps {
  onNavigate?: (page: string) => void;
}

const SystemAdminDashboardInner = ({ onNavigate }: SystemAdminDashboardInnerProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { featureFlags, toggleFeature } = useFeatureFlags();

  // 🔥 REAL DATA FROM SUPABASE
  const { venues, loading: venuesLoading } = useVenues();
  const { games, loading: gamesLoading } = useGames();
  const { bookings, loading: bookingsLoading } = useBookings();

  // 🔥 SYSTEM ADMIN REAL DATA (will be fetched below)
  const { metrics: platformMetrics, isLoading: platformMetricsLoading } = usePlatformMetrics();

  // Selected organization state
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const { metrics: orgMetrics, isLoading: orgMetricsLoading } = useOrganizationMetrics(selectedOrgId || undefined);

  // Initialize plans from localStorage or use default data
  const [plans, setPlans] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedPlans = localStorage.getItem('systemAdminPlans');
      if (savedPlans) {
        try {
          return JSON.parse(savedPlans);
        } catch (e) {
          console.error('Error parsing saved plans:', e);
          return plansData;
        }
      }
    }
    return plansData;
  });

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedOwnerForSettings, setSelectedOwnerForSettings] = useState<any>(null);
  const [selectedOwnerForEmbed, setSelectedOwnerForEmbed] = useState<any>(null);
  const [selectedOwnerForView, setSelectedOwnerForView] = useState<any>(null);
  const [selectedOwnerForEdit, setSelectedOwnerForEdit] = useState<any>(null);
  const [selectedOwnerForDelete, setSelectedOwnerForDelete] = useState<any>(null);
  const [showAddOwnerDialog, setShowAddOwnerDialog] = useState(false);
  const [selectedPlanForManage, setSelectedPlanForManage] = useState<any>(null);

  // 🔥 Use real organizations from Supabase
  const { organizations: realOrganizations, isLoading: orgsLoading, refetch: refetchOrgs } = useOrgsFeature({}, 1, 100);

  // Owner type for dashboard display
  interface DashboardOwner {
    id: string | number;
    accountId: number;
    ownerName: string;
    organizationName: string;
    organizationId: string;
    website: string;
    email: string;
    plan: string;
    venues: number;
    status: string;
    features: string[];
    profileSlug: string;
    locations: number;
    venueIds?: string[];
    gameIds?: string[];
    phone?: string;
  }

  // Convert organizations to owners format for display
  const computedOwners: DashboardOwner[] = useMemo(() => {
    if (!realOrganizations || realOrganizations.length === 0) return ownersData as unknown as DashboardOwner[]; // Fallback to demo data

    return realOrganizations.map(org => ({
      id: org.id,
      accountId: 1,
      ownerName: org.owner_name || 'Admin',
      organizationName: org.name,
      organizationId: org.id,
      website: org.website || '',
      email: org.owner_email || 'admin@organization.com',
      plan: org.plan?.name || 'Basic',
      status: org.status,
      features: [],
      profileSlug: org.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      venues: 0, // Will be fetched from metrics
      locations: 0,
      venueIds: [],
      gameIds: [],
      phone: org.phone
    }));
  }, [realOrganizations]);

  // Local state for owners (allows CRUD operations)
  const [owners, setOwners] = useState<DashboardOwner[]>(computedOwners);

  // Update owners when computed owners change
  useEffect(() => {
    setOwners(computedOwners);
  }, [computedOwners]);

  const [editingLocationId, setEditingLocationId] = useState<string | number | null>(null);
  const [locationValue, setLocationValue] = useState<number>(0);

  // Modal states
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5; // Show 5 organizations per page on dashboard

  // Column visibility configuration
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('systemAdminTableColumns');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing saved columns:', e);
        }
      }
    }
    // Default: all columns visible
    return {
      organizationId: true,
      organizationName: true,
      ownerName: true,
      website: true,
      email: true,
      plan: true,
      venues: true,
      venueIds: true,
      venueNames: true,
      games: true,
      gameIds: true,
      gameNames: true,
      locations: true,
      staffAccounts: true,
    };
  });

  // Column definitions
  const columns = [
    { id: 'organizationId', label: 'Organization ID' },
    { id: 'organizationName', label: 'Organization Name' },
    { id: 'ownerName', label: 'Owner Name' },
    { id: 'website', label: 'Website' },
    { id: 'email', label: 'Email' },
    { id: 'plan', label: 'Plan' },
    { id: 'venues', label: 'Venues' },
    { id: 'venueIds', label: 'Venue IDs' },
    { id: 'venueNames', label: 'Venue Names' },
    { id: 'games', label: 'Games' },
    { id: 'gameIds', label: 'Game IDs' },
    { id: 'gameNames', label: 'Game Names' },
    { id: 'locations', label: 'Locations' },
    { id: 'staffAccounts', label: 'Staff Accounts' },
  ];

  // Map organizations to accounts format (including Stripe connected account ID)
  const allAccounts: Account[] = useMemo(() => {
    if (realOrganizations && realOrganizations.length > 0) {
      return realOrganizations.map(org => ({
        id: org.id,
        name: org.name,
        company: org.owner_name || org.plan?.name || 'N/A',
        phone: org.phone || org.id,
        status: org.status === 'active' ? 'active' : 'inactive',
        stripeAccountId: org.stripe_account_id || undefined,
        isRecent: false,
      }));
    }

    // Fallback to current owners list when Supabase data is unavailable
    return owners.map(owner => ({
      id: owner.organizationId?.toString() || owner.id?.toString() || '',
      name: owner.organizationName,
      company: owner.ownerName,
      phone: owner.phone || owner.organizationId,
      status: owner.status === 'active' ? 'active' : 'inactive',
      isRecent: false,
    }));
  }, [realOrganizations, owners]);

  // Recent accounts (top 3). Eventually replace with server-side recent tracking
  const recentAccounts = useMemo(() => allAccounts.slice(0, 3), [allAccounts]);

  // Save plans to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('systemAdminPlans', JSON.stringify(plans));
    }
  }, [plans]);

  // Save column visibility to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('systemAdminTableColumns', JSON.stringify(visibleColumns));
    }
  }, [visibleColumns]);

  // Theme classes
  const bgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';

  // Filter data based on selected organization
  const filteredOwners = useMemo(() => {
    if (!selectedAccount) return owners;
    // Filter owners by organization ID
    return owners.filter(owner => owner.organizationId === selectedAccount.id);
  }, [selectedAccount, owners]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredOwners.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentOwners = filteredOwners.slice(startIndex, endIndex);

  // Reset to page 1 when account selection changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedAccount]);

  // Calculate filtered metrics using real data
  const filteredMetrics = useMemo(() => {
    if (!selectedAccount) {
      // Use platform-wide metrics
      if (platformMetrics) {
        return {
          totalOwners: platformMetrics.total_organizations || 0,
          activeSubscriptions: platformMetrics.active_organizations || 0,
          activeVenues: platformMetrics.total_venues || 0,
          totalLocations: platformMetrics.total_venues || 0, // Using venues as locations
          totalGames: platformMetrics.total_games || 0,
          totalBookings: platformMetrics.total_bookings || 0,
          mrr: platformMetrics.mrr || 0,
        };
      }
      // Fallback to calculating from owners if platform metrics not loaded
      const totalVenues = owners.reduce((sum, owner) => sum + (owner.venues || 0), 0);
      const totalLocations = owners.reduce((sum, owner) => sum + (owner.locations || 0), 0);
      const activeOwners = owners.filter(o => o.status === 'active').length;
      const totalGames = venuesData.reduce((sum, venue) => sum + (venue.games || 0), 0);
      const totalBookings = totalVenues * 50;
      const mrr = owners.reduce((sum, owner) => {
        const plan = plansData.find(p => p.name === owner.plan);
        return sum + (plan?.price || 0);
      }, 0);

      return {
        totalOwners: owners.length,
        activeSubscriptions: activeOwners,
        activeVenues: totalVenues,
        totalLocations: totalLocations,
        totalGames: totalGames,
        totalBookings: totalBookings,
        mrr: mrr,
      };
    }

    // Use organization-specific metrics
    if (orgMetrics) {
      return {
        totalOwners: 1, // Single organization
        activeSubscriptions: 1,
        activeVenues: orgMetrics.total_venues || 0,
        totalLocations: orgMetrics.active_venues || 0,
        totalGames: orgMetrics.total_games || 0,
        totalBookings: orgMetrics.total_bookings || 0,
        mrr: orgMetrics.mrr || 0,
      };
    }

    // Fallback to calculating from filtered owners
    const accountOwners = filteredOwners;
    const totalVenues = accountOwners.reduce((sum, owner) => sum + (owner.venues || 0), 0);
    const totalLocations = accountOwners.reduce((sum, owner) => sum + (owner.locations || 0), 0);
    const activeOwners = accountOwners.filter(o => o.status === 'active').length;
    const accountOrgIds = accountOwners.map(o => o.organizationId);
    const accountVenues = venuesData.filter(v => accountOrgIds.includes(v.organizationId));
    const totalGames = accountVenues.reduce((sum, venue) => sum + (venue.games || 0), 0);

    // Estimate total bookings (average 50 bookings per venue)
    const totalBookings = totalVenues * 50;

    // Estimate MRR based on plans
    const mrr = accountOwners.reduce((sum, owner) => {
      const plan = plansData.find(p => p.name === owner.plan);
      return sum + (plan?.price || 0);
    }, 0);

    return {
      totalOwners: accountOwners.length,
      activeSubscriptions: activeOwners,
      activeVenues: totalVenues,
      totalLocations: totalLocations,
      totalGames: totalGames,
      totalBookings: totalBookings,
      mrr: mrr,
    };
  }, [selectedAccount, filteredOwners, platformMetrics, orgMetrics, owners, venuesData, plansData]);

  const handleToggleFeature = (featureId: string) => {
    const feature = featureFlags.find(f => f.id === featureId);
    const wasEnabled = feature?.enabled;
    toggleFeature(featureId);
    toast.success(`Feature ${feature?.name} ${wasEnabled ? 'disabled' : 'enabled'}`);
  };

  const handleViewOwner = (id: string | number) => {
    const owner = owners.find(o => o.id === id);
    if (owner) {
      setSelectedOwnerForView(owner);
    }
  };

  const handleEditOwner = (id: string | number) => {
    const owner = owners.find(o => o.id === id);
    if (owner) {
      setSelectedOwnerForEdit(owner);
    }
  };

  const handleDeleteOwner = (id: string | number) => {
    const owner = owners.find(o => o.id === id);
    if (owner) {
      setSelectedOwnerForDelete(owner);
    }
  };

  const handleConfirmDelete = (ownerId: string | number) => {
    setOwners(prev => prev.filter(o => o.id !== ownerId));
    setSelectedOwnerForDelete(null);
  };

  const handleSaveOwner = (updatedOwner: any) => {
    setOwners(prev => prev.map(o => o.id === updatedOwner.id ? updatedOwner : o));
    setSelectedOwnerForEdit(null);
  };

  const handleAddOwner = () => {
    // Refetch organizations to update the list
    refetchOrgs();
    setShowAddOwnerDialog(false);
  };

  const handleSavePlan = (updatedPlan: any) => {
    setPlans(prev => prev.map(p => p.name === updatedPlan.name ? updatedPlan : p));
    setSelectedPlanForManage(null);
  };

  const handleAccountSelect = (account: Account | null) => {
    setSelectedAccount(account);
    // Sync with organization ID for metrics
    setSelectedOrgId(account?.id || null);
    if (account) {
      toast.info(`Viewing data for: ${account.name}`);
    } else {
      toast.info('Viewing all platform data');
    }
  };

  // Extract domain from URL
  const getDomainFromUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return url;
    }
  };

  // Location editing handlers
  const handleStartEditLocation = (ownerId: string | number, currentLocations: number) => {
    setEditingLocationId(ownerId);
    setLocationValue(currentLocations);
  };

  const handleSaveLocation = (ownerId: string | number) => {
    setOwners(prev => prev.map(o =>
      o.id === ownerId ? { ...o, locations: locationValue } : o
    ));
    setEditingLocationId(null);
    toast.success('Location count updated');
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  // Navigation to View All Organizations page
  const handleViewAllOrganizations = () => {
    if (onNavigate) {
      onNavigate('view-all-organizations');
    }
  };

  // Navigation to User Stripe Accounts page
  const handleViewUserStripeAccounts = () => {
    if (onNavigate) {
      onNavigate('user-stripe-accounts');
    }
  };

  const handleCancelEditLocation = () => {
    setEditingLocationId(null);
    setLocationValue(0);
  };

  const handleViewProfile = (owner: any) => {
    // Open venue landing page in new tab
    window.open(`/v/${owner.profileSlug}`, '_blank');
    toast.info(`Opening profile for ${owner.organizationName}`);
  };

  const handleProfileSettings = (owner: any) => {
    setSelectedOwnerForSettings(owner);
  };

  const handleProfileEmbed = (owner: any) => {
    setSelectedOwnerForEmbed(owner);
  };

  const handleCopyUrl = (profileSlug: string) => {
    const url = `${window.location.origin}/v/${profileSlug}`;
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard!');
  };

  const handleVisitUrl = (profileSlug: string) => {
    window.open(`/v/${profileSlug}`, '_blank');
  };

  // Column visibility handlers
  const handleToggleColumn = (columnId: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };

  const handleShowAllColumns = () => {
    const allVisible = columns.reduce((acc, col) => ({ ...acc, [col.id]: true }), {});
    setVisibleColumns(allVisible);
    toast.success('All columns shown');
  };

  const handleHideAllColumns = () => {
    const allHidden = columns.reduce((acc, col) => ({ ...acc, [col.id]: false }), {});
    setVisibleColumns(allHidden);
    toast.info('All columns hidden');
  };

  return (
    <div className={`min-h-screen ${bgClass} flex flex-col`}>
      {/* Custom Header for System Admin */}
      <SystemAdminHeader
        selectedAccount={selectedAccount}
        onAccountSelect={handleAccountSelect}
        accounts={allAccounts}
        recentAccounts={recentAccounts}
        onNotificationsClick={() => setShowNotificationsModal(true)}
        onSettingsClick={() => setShowSettingsModal(true)}
        onAddOrganization={() => setShowAddOwnerDialog(true)}
        notificationCount={3}
      />

      {/* Breadcrumb */}
      {selectedAccount && (
        <div className={`px-6 pt-4 pb-2 border-b ${borderColor}`}>
          <div className="flex items-center gap-2 text-sm">
            <span className={mutedTextClass}>System Admin</span>
            <span className={mutedTextClass}>›</span>
            <span className={textClass}>{selectedAccount.name}</span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        {/* Overview Metrics Section with Separator */}
        <div className={`border-b-2 ${borderColor} pb-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-medium ${textClass}`}>Overview Metrics</h2>
          </div>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <KPICard
              title="Total Owners"
              value={filteredMetrics?.totalOwners ?? 0}
              icon={Users}
              trend={{ value: 12, isPositive: true }}
              period="this month"
            />
            <KPICard
              title="Active Subscriptions"
              value={filteredMetrics?.activeSubscriptions ?? 0}
              icon={CheckCircle}
              trend={{ value: 8, isPositive: true }}
              period="this month"
            />
            <KPICard
              title="Active Venues"
              value={filteredMetrics?.activeVenues ?? 0}
              icon={Building2}
              trend={{ value: 15, isPositive: true }}
              period="this month"
            />
            <KPICard
              title="MRR"
              value={`$${Number(filteredMetrics?.mrr ?? 0).toLocaleString()}`}
              icon={DollarSign}
              trend={{ value: 18, isPositive: true }}
              period="this month"
            />
          </div>
        </div>

        {/* Connected Account Onboarding - Show only for specific accounts */}
        {selectedAccount && (() => {
          // Find the full owner data for the selected account
          const ownerData = owners.find(o => o.organizationId === selectedAccount.id);
          if (!ownerData) return null;

          return (
            <div className={`border-b-2 ${borderColor} pb-6 mb-6`}>
              <UserAccountStripeConnect
                userId={ownerData.organizationId}
                userEmail={ownerData.email}
                userName={ownerData.organizationName}
                organizationId={ownerData.organizationId}
                existingAccountId={(ownerData as any).stripeAccountId}
                onAccountLinked={(accountId) => {
                  toast.success('Stripe account linked!', {
                    description: `Account ${accountId} linked to ${ownerData.organizationName}`
                  });
                  // Refresh data if needed
                }}
              />
            </div>
          );
        })()}

        {/* Payments & Subscriptions Section */}
        <PaymentsSubscriptionsSection
          selectedAccount={selectedAccount}
          platformMetrics={platformMetrics}
          accountMetrics={orgMetrics}
        />

        {/* Connected Accounts Management - Show only when "All Accounts" is selected */}
        {!selectedAccount && (
          <div className={`border-b-2 ${borderColor} pb-6 mb-6`}>
            <ConnectedAccountsManagement />
          </div>
        )}

        {/* Recent Transaction Activity - Show only when "All Accounts" is selected */}
        {!selectedAccount && (
          <div className={`border-b-2 ${borderColor} pb-6 mb-6`}>
            <RecentTransactionActivity limit={10} />
          </div>
        )}

        {/* Conditional: Show Organizations Management ONLY when "All Accounts" is selected */}
        {!selectedAccount && (
          <div className={`border-b-2 ${borderColor} pb-6 mb-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-medium ${textClass}`}>Organizations Management</h2>
            </div>

            {/* Owners & Venues Table - Improved Design */}
            <Card
              className={`${cardBgClass} border ${borderColor} shadow-sm`}
            >
              {/* Enhanced Header with Better Spacing */}
              <CardHeader className="space-y-4 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-2">
                    <CardTitle className={`text-2xl ${textClass}`}>Owners & Venues</CardTitle>
                    <p className={`text-sm ${mutedTextClass}`}>
                      Showing <span className="font-medium">{startIndex + 1}-{Math.min(endIndex, filteredOwners.length)}</span> of <span className="font-medium">{filteredOwners.length}</span> organizations
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Column Visibility Selector */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`h-11 px-6 ${borderColor} ${isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50'}`}
                        >
                          <Columns3 className="w-4 h-4 mr-2" />
                          Columns
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className={`w-64 p-4 ${isDark ? 'bg-[#161616] border-[#333]' : 'bg-white border-gray-200'}`}
                        align="end"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium ${textClass}`}>Modify columns</h4>
                          </div>

                          {/* Column Checkboxes */}
                          <div className="space-y-3 max-h-80 overflow-y-auto">
                            {columns.map((column) => (
                              <div key={column.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={column.id}
                                  checked={visibleColumns[column.id]}
                                  onCheckedChange={() => handleToggleColumn(column.id)}
                                  className={isDark ? 'border-[#333]' : 'border-gray-300'}
                                />
                                <label
                                  htmlFor={column.id}
                                  className={`text-sm cursor-pointer ${textClass}`}
                                >
                                  {column.label}
                                </label>
                              </div>
                            ))}
                          </div>

                          {/* Quick Actions */}
                          <div className={`pt-3 border-t ${isDark ? 'border-[#333]' : 'border-gray-200'} flex gap-2`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleShowAllColumns}
                              className={`flex-1 text-xs ${isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-100'}`}
                            >
                              Show All
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleHideAllColumns}
                              className={`flex-1 text-xs ${isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-100'}`}
                            >
                              Hide All
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Button
                      onClick={handleViewAllOrganizations}
                      variant="outline"
                      className={`h-11 px-6 ${borderColor} ${isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50'}`}
                    >
                      <List className="w-4 h-4 mr-2" />
                      View All
                    </Button>
                    <Button
                      onClick={handleViewUserStripeAccounts}
                      variant="outline"
                      className={`h-11 px-6 ${borderColor} ${isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50'}`}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      User Accounts
                    </Button>
                    <Button
                      onClick={() => setShowAddOwnerDialog(true)}
                      style={{ backgroundColor: '#4f46e5' }}
                      className="h-11 px-6 text-white hover:bg-[#4338ca]"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Add Owner
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-y ${borderColor} ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
                        {visibleColumns.organizationId && (
                          <th className={`text-left py-4 px-6 text-sm font-medium ${mutedTextClass}`}>Organization ID</th>
                        )}
                        {visibleColumns.organizationName && (
                          <th className={`text-left py-4 px-6 text-sm font-medium ${mutedTextClass}`}>Organization Name</th>
                        )}
                        {visibleColumns.ownerName && (
                          <th className={`text-left py-4 px-6 text-sm font-medium ${mutedTextClass}`}>Owner Name</th>
                        )}
                        {visibleColumns.website && (
                          <th className={`text-left py-4 px-6 text-sm font-medium ${mutedTextClass}`}>Website</th>
                        )}
                        {visibleColumns.email && (
                          <th className={`text-left py-4 px-6 text-sm font-medium ${mutedTextClass}`}>Email</th>
                        )}
                        {visibleColumns.plan && (
                          <th className={`text-left py-4 px-6 text-sm font-medium ${mutedTextClass}`}>Plan</th>
                        )}
                        {visibleColumns.venues && (
                          <th className={`text-center py-4 px-6 text-sm font-medium ${mutedTextClass}`}>Venues</th>
                        )}
                        {visibleColumns.venueIds && (
                          <th className={`text-center py-4 px-6 text-sm font-medium ${mutedTextClass}`}>Venue IDs</th>
                        )}
                        {visibleColumns.venueNames && (
                          <th className={`text-center py-4 px-6 text-sm font-medium ${mutedTextClass}`}>Venue Names</th>
                        )}
                        {visibleColumns.games && (
                          <th className={`text-center py-4 px-6 text-sm font-medium ${mutedTextClass}`}>Games</th>
                        )}
                        {visibleColumns.gameIds && (
                          <th className={`text-center py-4 px-6 text-sm font-medium ${mutedTextClass}`}>Game IDs</th>
                        )}
                        {visibleColumns.gameNames && (
                          <th className={`text-center py-4 px-6 text-sm font-medium ${mutedTextClass}`}>Game Names</th>
                        )}
                        {visibleColumns.locations && (
                          <th className={`text-center py-4 px-6 text-sm font-medium ${mutedTextClass}`}>Locations</th>
                        )}
                        {visibleColumns.staffAccounts && (
                          <th className={`text-center py-4 px-6 text-sm font-medium ${mutedTextClass}`}>Staff Accounts</th>
                        )}
                        <th className={`text-center py-4 px-6 text-sm font-medium ${mutedTextClass}`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentOwners.map((owner, index) => (
                        <tr
                          key={owner.id}
                          className={`border-b ${borderColor} ${isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-gray-50'} transition-colors group`}
                        >
                          {/* Organization ID - Improved Badge */}
                          {visibleColumns.organizationId && (
                            <td className="py-5 px-6">
                              <code className={`inline-flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-md ${isDark
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                }`}>
                                <Building2 className="w-3 h-3" />
                                {owner.organizationId}
                              </code>
                            </td>
                          )}

                          {/* Organization Name - Bolder */}
                          {visibleColumns.organizationName && (
                            <td className={`py-5 px-6 font-medium ${textClass}`}>
                              {owner.organizationName}
                            </td>
                          )}

                          {/* Owner Name - With Icon */}
                          {visibleColumns.ownerName && (
                            <td className={`py-5 px-6 ${textClass}`}>
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${isDark ? 'bg-[#2a2a2a] text-gray-300' : 'bg-gray-200 text-gray-700'
                                  }`}>
                                  {owner.ownerName.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span>{owner.ownerName}</span>
                              </div>
                            </td>
                          )}

                          {/* Website - Enhanced Link */}
                          {visibleColumns.website && (
                            <td className="py-5 px-6">
                              <a
                                href={owner.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md ${mutedTextClass} ${isDark
                                  ? 'hover:bg-[#2a2a2a] hover:text-indigo-400'
                                  : 'hover:bg-gray-100 hover:text-indigo-600'
                                  } transition-all group-hover:bg-opacity-100`}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span className="font-mono text-xs">{getDomainFromUrl(owner.website)}</span>
                              </a>
                            </td>
                          )}

                          {/* Email - Truncated */}
                          {visibleColumns.email && (
                            <td className={`py-5 px-6 text-sm ${mutedTextClass}`}>
                              <span className="truncate max-w-[180px] block">{owner.email}</span>
                            </td>
                          )}

                          {/* Plan - Enhanced Badge */}
                          {visibleColumns.plan && (
                            <td className="py-5 px-6">
                              <Badge
                                style={{
                                  backgroundColor: owner.plan === 'Pro'
                                    ? '#4f46e5'
                                    : owner.plan === 'Growth'
                                      ? '#10b981'
                                      : '#6b7280'
                                }}
                                className="text-white font-medium px-3 py-1 text-xs"
                              >
                                {owner.plan === 'Pro' && <Crown className="w-3 h-3 mr-1 inline" />}
                                {owner.plan}
                              </Badge>
                            </td>
                          )}

                          {/* Venues - With Icon */}
                          {visibleColumns.venues && (
                            <td className="py-5 px-6 text-center">
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-100'
                                }`}>
                                <Building2 className={`w-3.5 h-3.5 ${mutedTextClass}`} />
                                <span className={`font-medium ${textClass}`}>{owner.venues}</span>
                              </div>
                            </td>
                          )}

                          {/* Venue IDs - Show venue IDs for this organization */}
                          {visibleColumns.venueIds && (
                            <td className="py-5 px-6">
                              <div className="flex flex-wrap gap-1 justify-center">
                                {venuesData
                                  .filter(v => v.organizationId === owner.organizationId)
                                  .slice(0, 3)
                                  .map(venue => (
                                    <code
                                      key={venue.id}
                                      className={`text-xs font-mono px-2 py-0.5 rounded ${isDark
                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                                        }`}
                                    >
                                      {venue.id}
                                    </code>
                                  ))}
                                {venuesData.filter(v => v.organizationId === owner.organizationId).length > 3 && (
                                  <span className={`text-xs ${mutedTextClass}`}>
                                    +{venuesData.filter(v => v.organizationId === owner.organizationId).length - 3} more
                                  </span>
                                )}
                              </div>
                            </td>
                          )}

                          {/* Venue Names - Show venue names for this organization */}
                          {visibleColumns.venueNames && (
                            <td className="py-5 px-6">
                              <div className="flex flex-wrap gap-1 justify-center">
                                {venuesData
                                  .filter(v => v.organizationId === owner.organizationId)
                                  .slice(0, 2)
                                  .map(venue => (
                                    <span
                                      key={venue.id}
                                      className={`text-xs px-2 py-1 rounded ${isDark
                                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                                        }`}
                                    >
                                      {venue.name}
                                    </span>
                                  ))}
                                {venuesData.filter(v => v.organizationId === owner.organizationId).length > 2 && (
                                  <span className={`text-xs ${mutedTextClass}`}>
                                    +{venuesData.filter(v => v.organizationId === owner.organizationId).length - 2} more
                                  </span>
                                )}
                              </div>
                            </td>
                          )}

                          {/* Games - Total games count for this organization */}
                          {visibleColumns.games && (
                            <td className="py-5 px-6 text-center">
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-100'
                                }`}>
                                <Gamepad2 className={`w-3.5 h-3.5 ${mutedTextClass}`} />
                                <span className={`font-medium ${textClass}`}>
                                  {venuesData
                                    .filter(v => v.organizationId === owner.organizationId)
                                    .reduce((sum, v) => sum + v.games, 0)}
                                </span>
                              </div>
                            </td>
                          )}

                          {/* Game IDs - Show game IDs for this organization */}
                          {visibleColumns.gameIds && (
                            <td className="py-5 px-6">
                              <div className="flex flex-wrap gap-1 justify-center">
                                {(() => {
                                  const orgVenues = venuesData.filter(v => v.organizationId === owner.organizationId);
                                  const orgGames = gamesData.filter(game =>
                                    orgVenues.some(venue => venue.id === game.venueId)
                                  );
                                  return (
                                    <>
                                      {orgGames.slice(0, 3).map(game => (
                                        <code
                                          key={game.id}
                                          className={`text-xs font-mono px-2 py-0.5 rounded ${isDark
                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                            : 'bg-green-50 text-green-700 border border-green-200'
                                            }`}
                                        >
                                          {game.id}
                                        </code>
                                      ))}
                                      {orgGames.length > 3 && (
                                        <span className={`text-xs ${mutedTextClass}`}>
                                          +{orgGames.length - 3} more
                                        </span>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </td>
                          )}

                          {/* Game Names - Show game names for this organization */}
                          {visibleColumns.gameNames && (
                            <td className="py-5 px-6">
                              <div className="flex flex-wrap gap-1 justify-center">
                                {(() => {
                                  const orgVenues = venuesData.filter(v => v.organizationId === owner.organizationId);
                                  const orgGames = gamesData.filter(game =>
                                    orgVenues.some(venue => venue.id === game.venueId)
                                  );
                                  return (
                                    <>
                                      {orgGames.slice(0, 2).map(game => (
                                        <span
                                          key={game.id}
                                          className={`text-xs px-2 py-1 rounded ${isDark
                                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                            }`}
                                        >
                                          {game.name}
                                        </span>
                                      ))}
                                      {orgGames.length > 2 && (
                                        <span className={`text-xs ${mutedTextClass}`}>
                                          +{orgGames.length - 2} more
                                        </span>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </td>
                          )}

                          {/* Locations - Editable with Better UI */}
                          {visibleColumns.locations && (
                            <td className="py-5 px-6 text-center">
                              {editingLocationId === owner.id ? (
                                <div className="flex items-center justify-center gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    value={locationValue}
                                    onChange={(e) => setLocationValue(parseInt(e.target.value) || 0)}
                                    className={`w-20 h-9 px-3 text-center text-sm border rounded-md ${isDark
                                      ? 'bg-[#0a0a0a] border-[#2a2a2a] text-white focus:border-indigo-500'
                                      : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500'
                                      } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleSaveLocation(owner.id)}
                                    className={`p-2 rounded-md ${isDark ? 'hover:bg-green-500/10' : 'hover:bg-green-50'
                                      } text-green-600 dark:text-green-400 transition-colors`}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={handleCancelEditLocation}
                                    className={`p-2 rounded-md ${isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'
                                      } text-red-600 dark:text-red-400 transition-colors`}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleStartEditLocation(owner.id, owner.locations || 0)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md ${isDark
                                    ? 'hover:bg-indigo-500/10 text-gray-300'
                                    : 'hover:bg-indigo-50 text-gray-700'
                                    } transition-all cursor-pointer group/location`}
                                  title="Click to edit locations"
                                >
                                  <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                  <span className={`font-medium ${textClass}`}>{owner.locations || 0}</span>
                                  <Edit className="w-3 h-3 opacity-0 group-hover/location:opacity-100 text-indigo-600 dark:text-indigo-400 transition-opacity" />
                                </button>
                              )}
                            </td>
                          )}

                          {/* Staff Accounts - Number of staff for this organization */}
                          {visibleColumns.staffAccounts && (
                            <td className="py-5 px-6 text-center">
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-100'
                                }`}>
                                <Users className={`w-3.5 h-3.5 ${mutedTextClass}`} />
                                <span className={`font-medium ${textClass}`}>
                                  {Math.floor(3 + ((typeof owner.id === 'number' ? owner.id : owner.id.toString().length) * 1.7) % 13)}
                                </span>
                              </div>
                            </td>
                          )}

                          {/* Actions - Better Layout */}
                          <td className="py-5 px-6">
                            <div className="flex items-center justify-center gap-1">
                              <ProfileDropdown
                                ownerName={owner.ownerName}
                                profileSlug={owner.profileSlug}
                                organizationName={owner.organizationName}
                                onViewProfile={() => handleViewProfile(owner)}
                                onProfileSettings={() => handleProfileSettings(owner)}
                                onProfileEmbed={() => handleProfileEmbed(owner)}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewOwner(owner.id)}
                                className={`h-9 w-9 p-0 ${isDark
                                  ? 'hover:bg-indigo-500/10 hover:text-indigo-400'
                                  : 'hover:bg-indigo-50 hover:text-indigo-600'
                                  }`}
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditOwner(owner.id)}
                                className={`h-9 w-9 p-0 ${isDark
                                  ? 'hover:bg-blue-500/10 hover:text-blue-400'
                                  : 'hover:bg-blue-50 hover:text-blue-600'
                                  }`}
                                title="Edit organization"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteOwner(owner.id)}
                                className={`h-9 w-9 p-0 ${isDark
                                  ? 'hover:bg-red-500/10 hover:text-red-400'
                                  : 'hover:bg-red-50 hover:text-red-600'
                                  } text-red-600 dark:text-red-400`}
                                title="Delete organization"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls - Fixed Spacing */}
                {totalPages > 1 && (
                  <div className={`flex items-center justify-between px-6 py-6 mt-6 border-t ${borderColor} ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
                    <div className={`text-sm ${mutedTextClass}`}>
                      <span className="font-medium">Page {currentPage}</span> of <span className="font-medium">{totalPages}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className={`h-10 px-4 ${borderColor} ${isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-white'}`}
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className={`h-10 px-4 ${borderColor} ${isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-white'}`}
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Conditional: Show Account Performance Metrics ONLY when a specific account is selected */}
        {selectedAccount && (
          <AccountPerformanceMetrics
            account={selectedAccount}
            metrics={orgMetrics}
          />
        )}

        {/* Subscription Plans Section with Separator */}
        <div className={`border-b-2 ${borderColor} pb-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-medium ${textClass}`}>Subscription Plans</h2>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-md ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-100'}`}>
              <GripVertical className={`w-4 h-4 ${mutedTextClass}`} />
              <span className={`text-xs ${mutedTextClass}`}>Drag to resize</span>
            </div>
          </div>

          {/* Plans & Features Section */}
          <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {plans.map((plan, index) => (
              <Card key={index} className={`${cardBgClass} border ${borderColor} relative ${plan.isFeatured ? 'ring-2 ring-yellow-500' : ''}`}>
                {/* Featured Badge */}
                {plan.isFeatured && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0 px-3 py-1 shadow-lg">
                      <Star className="w-3 h-3 mr-1 fill-white" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className={textClass}>{plan.name}</CardTitle>
                    <Crown
                      className="w-6 h-6"
                      style={{ color: plan.color }}
                    />
                  </div>
                  <div className="mt-2">
                    {plan.discount && plan.discount.type !== 'none' && plan.discount.value > 0 ? (
                      <div>
                        <div className={`text-sm line-through ${mutedTextClass}`}>
                          ${plan.price}/month
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-3xl ${textClass}`}>
                            ${plan.discount.type === 'percentage'
                              ? (plan.price * (1 - plan.discount.value / 100)).toFixed(2)
                              : (plan.price - plan.discount.value).toFixed(2)
                            }
                          </span>
                          <span className={mutedTextClass}>/month</span>
                        </div>
                        <div className={`text-xs mt-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                          Save {plan.discount.type === 'percentage'
                            ? `${plan.discount.value}%`
                            : `$${plan.discount.value}`
                          }
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className={`text-3xl ${textClass}`}>${plan.price}</span>
                        <span className={mutedTextClass}>/month</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
                    <div className={`text-sm ${mutedTextClass} mb-1`}>Active Subscribers</div>
                    <div className={`text-2xl ${textClass}`}>{plan.subscribers}</div>
                  </div>
                  <div className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span className={`text-sm ${mutedTextClass}`}>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPlanForManage(plan)}
                    className={`w-full ${borderColor}`}
                    style={{ borderColor: plan.color, color: plan.color }}
                  >
                    Manage Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Feature Flags Section - Context-Aware */}
        <div className={`pb-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-medium ${textClass}`}>Feature Flags</h2>
          </div>

          {/* Feature Flags */}
          <Card
            className={`${cardBgClass} border ${borderColor}`}
          >
            <CardHeader className="space-y-3 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className={`text-xl ${textClass}`}>
                    {selectedAccount ? `Active Features - ${selectedAccount.name}` : 'Platform Features'}
                  </CardTitle>
                  <p className={`text-sm mt-2 ${mutedTextClass}`}>
                    {selectedAccount
                      ? `Features enabled for this account (Plan: ${selectedAccount.company || 'N/A'})`
                      : 'Enable or disable features across all organizations'}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`px-3 py-1 ${isDark ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}
                >
                  {selectedAccount
                    ? `${featureFlags.filter(f => f.enabled).length} Active Features`
                    : `${featureFlags.filter(f => f.enabled).length} / ${featureFlags.length} Active`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Show ALL flags with toggles when "All Accounts", or only ACTIVE flags when specific account */}
                {(selectedAccount ? featureFlags.filter(f => f.enabled) : featureFlags).map((feature) => (
                  <div
                    key={feature.id}
                    className={`p-5 rounded-lg border ${borderColor} ${isDark ? 'bg-[#0a0a0a] hover:bg-[#1a1a1a]' : 'bg-white hover:bg-gray-50'
                      } transition-all duration-200 shadow-sm`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 pr-4">
                        <h4 className={`font-medium mb-1 ${textClass}`}>{feature.name}</h4>
                        {feature.description && (
                          <p className={`text-xs leading-relaxed ${mutedTextClass}`}>
                            {feature.description}
                          </p>
                        )}
                      </div>
                      {/* Only show toggle for "All Accounts" mode, hide for specific account */}
                      {!selectedAccount && (
                        <Switch
                          checked={feature.enabled}
                          onCheckedChange={() => handleToggleFeature(feature.id)}
                          className="flex-shrink-0"
                        />
                      )}
                    </div>
                    <div className="flex items-center pt-3 border-t border-opacity-50" style={{ borderColor: isDark ? '#333' : '#e5e7eb' }}>
                      <div className="flex items-center space-x-2">
                        {feature.enabled ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-xs font-medium text-green-600 dark:text-green-400">Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Inactive</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Profile Settings Modal */}
      {selectedOwnerForSettings && (
        <ProfileSettingsModal
          isOpen={!!selectedOwnerForSettings}
          onClose={() => setSelectedOwnerForSettings(null)}
          owner={selectedOwnerForSettings}
        />
      )}

      {/* Profile Embed Modal */}
      {selectedOwnerForEmbed && (
        <ProfileEmbedModal
          isOpen={!!selectedOwnerForEmbed}
          onClose={() => setSelectedOwnerForEmbed(null)}
          owner={selectedOwnerForEmbed}
        />
      )}

      {/* View Owner Dialog */}
      {selectedOwnerForView && (
        <ViewOwnerDialog
          isOpen={!!selectedOwnerForView}
          onClose={() => setSelectedOwnerForView(null)}
          owner={selectedOwnerForView}
          onEdit={() => {
            setSelectedOwnerForEdit(selectedOwnerForView);
            setSelectedOwnerForView(null);
          }}
          onDelete={() => {
            setSelectedOwnerForDelete(selectedOwnerForView);
            setSelectedOwnerForView(null);
          }}
        />
      )}

      {/* Edit Owner Dialog */}
      {selectedOwnerForEdit && (
        <EditOwnerDialog
          isOpen={!!selectedOwnerForEdit}
          onClose={() => setSelectedOwnerForEdit(null)}
          owner={selectedOwnerForEdit}
          onSave={handleSaveOwner}
        />
      )}

      {/* Delete Owner Dialog */}
      {selectedOwnerForDelete && (
        <DeleteOwnerDialog
          isOpen={!!selectedOwnerForDelete}
          onClose={() => setSelectedOwnerForDelete(null)}
          owner={selectedOwnerForDelete}
          onConfirmDelete={handleConfirmDelete}
        />
      )}

      {/* Add Owner Dialog */}
      <AddOwnerDialog
        isOpen={showAddOwnerDialog}
        onClose={() => setShowAddOwnerDialog(false)}
        onAdd={handleAddOwner}
      />

      {/* Manage Plan Dialog */}
      {selectedPlanForManage && (
        <ManagePlanDialog
          isOpen={!!selectedPlanForManage}
          onClose={() => setSelectedPlanForManage(null)}
          plan={selectedPlanForManage}
          onSave={handleSavePlan}
        />
      )}

      {/* System Admin Settings Modal */}
      <SystemAdminSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      {/* System Admin Notifications Modal */}
      <SystemAdminNotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
      />
    </div>
  );
};

interface SystemAdminDashboardProps {
  onNavigate?: (page: string) => void;
}

const SystemAdminDashboard = ({ onNavigate }: SystemAdminDashboardProps) => {
  return (
    <SystemAdminProvider>
      <SystemAdminDashboardInner onNavigate={onNavigate} />
    </SystemAdminProvider>
  );
};

export default SystemAdminDashboard;
