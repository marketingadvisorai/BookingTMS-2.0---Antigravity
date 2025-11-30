/**
 * Organization Settings Modal
 * 
 * Comprehensive settings management for organizations
 * Includes: General, Billing, Stripe Connect, Limits, and Team tabs
 * 
 * @version 0.1.4
 * @date 2025-11-25
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Building2,
  Settings,
  CreditCard,
  Users,
  Gauge,
  Globe,
  Mail,
  Phone,
  Link as LinkIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { OrganizationService } from '../../features/system-admin/services';
import { usePlans } from '../../features/system-admin/hooks';
import type { Organization, UpdateOrganizationDTO } from '../../features/system-admin/types';

interface OrganizationSettingsModalProps {
  open: boolean;
  onClose: () => void;
  organization: Organization;
  onUpdate: () => void;
}

export default function OrganizationSettingsModal({
  open,
  onClose,
  organization,
  onUpdate,
}: OrganizationSettingsModalProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const { plans } = usePlans(true);

  // Form state
  const [formData, setFormData] = useState({
    name: organization.name || '',
    owner_name: organization.owner_name || '',
    owner_email: organization.owner_email || '',
    website: organization.website || '',
    phone: organization.phone || '',
    address: organization.address || '',
    city: organization.city || '',
    state: organization.state || '',
    zip: organization.zip || '',
    country: organization.country || '',
    plan_id: organization.plan_id || '',
    status: organization.status || 'pending',
    application_fee_percentage: organization.application_fee_percentage || 0.75,
  });

  // Reset form when organization changes
  useEffect(() => {
    setFormData({
      name: organization.name || '',
      owner_name: organization.owner_name || '',
      owner_email: organization.owner_email || '',
      website: organization.website || '',
      phone: organization.phone || '',
      address: organization.address || '',
      city: organization.city || '',
      state: organization.state || '',
      zip: organization.zip || '',
      country: organization.country || '',
      plan_id: organization.plan_id || '',
      status: organization.status || 'pending',
      application_fee_percentage: organization.application_fee_percentage || 0.75,
    });
  }, [organization]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Clean up form data - convert empty strings to undefined so they're not sent
      const cleanedData: UpdateOrganizationDTO = {};
      
      if (formData.name?.trim()) cleanedData.name = formData.name.trim();
      if (formData.owner_name?.trim()) cleanedData.owner_name = formData.owner_name.trim();
      if (formData.owner_email?.trim()) cleanedData.owner_email = formData.owner_email.trim();
      if (formData.website?.trim()) cleanedData.website = formData.website.trim();
      if (formData.phone?.trim()) cleanedData.phone = formData.phone.trim();
      if (formData.address?.trim()) cleanedData.address = formData.address.trim();
      if (formData.city?.trim()) cleanedData.city = formData.city.trim();
      if (formData.state?.trim()) cleanedData.state = formData.state.trim();
      if (formData.zip?.trim()) cleanedData.zip = formData.zip.trim();
      if (formData.country?.trim()) cleanedData.country = formData.country.trim();
      if (formData.plan_id) cleanedData.plan_id = formData.plan_id;
      if (formData.status) cleanedData.status = formData.status as 'active' | 'inactive' | 'suspended';
      if (typeof formData.application_fee_percentage === 'number') {
        cleanedData.application_fee_percentage = formData.application_fee_percentage;
      }

      await OrganizationService.update(organization.id, cleanedData);
      toast.success('Organization settings updated successfully');
      onUpdate();
    } catch (error: any) {
      console.error('[OrganizationSettingsModal] Update error:', error);
      toast.error(error.message || 'Failed to update organization');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">{organization.name}</DialogTitle>
              <DialogDescription>
                Manage organization settings and configuration
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="stripe" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Stripe</span>
            </TabsTrigger>
            <TabsTrigger value="limits" className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              <span className="hidden sm:inline">Limits</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4 mt-4">
            <GeneralSettingsTab 
              formData={formData} 
              onChange={handleChange}
              plans={plans}
            />
          </TabsContent>

          {/* Billing Settings */}
          <TabsContent value="billing" className="space-y-4 mt-4">
            <BillingSettingsTab 
              organization={organization}
              formData={formData}
              onChange={handleChange}
            />
          </TabsContent>

          {/* Stripe Connect */}
          <TabsContent value="stripe" className="space-y-4 mt-4">
            <StripeConnectTab 
              organization={organization}
              onCopy={copyToClipboard}
            />
          </TabsContent>

          {/* Usage Limits */}
          <TabsContent value="limits" className="space-y-4 mt-4">
            <LimitsTab organization={organization} />
          </TabsContent>

          {/* Team Members */}
          <TabsContent value="team" className="space-y-4 mt-4">
            <TeamTab organization={organization} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// General Settings Tab
function GeneralSettingsTab({ 
  formData, 
  onChange,
  plans,
}: { 
  formData: any; 
  onChange: (field: string, value: any) => void;
  plans: any[];
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Organization Details</CardTitle>
          <CardDescription>Basic information about the organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onChange('name', e.target.value)}
                placeholder="Enter organization name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(v) => onChange('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => onChange('website', e.target.value)}
                placeholder="https://example.com"
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Location Details</CardTitle>
          <CardDescription>Address and location information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => onChange('address', e.target.value)}
                placeholder="Street address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => onChange('city', e.target.value)}
                placeholder="City"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => onChange('state', e.target.value)}
                placeholder="State"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">Zip</Label>
              <Input
                id="zip"
                value={formData.zip}
                onChange={(e) => onChange('zip', e.target.value)}
                placeholder="Zip"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => onChange('country', e.target.value)}
                placeholder="Country"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Owner Information</CardTitle>
          <CardDescription>Contact details for the organization owner</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="owner_name">Owner Name</Label>
              <Input
                id="owner_name"
                value={formData.owner_name}
                onChange={(e) => onChange('owner_name', e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => onChange('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner_email">Owner Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="owner_email"
                type="email"
                value={formData.owner_email}
                onChange={(e) => onChange('owner_email', e.target.value)}
                placeholder="owner@example.com"
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Subscription Plan</CardTitle>
          <CardDescription>Current subscription and billing plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="plan">Active Plan</Label>
            <Select value={formData.plan_id} onValueChange={(v) => onChange('plan_id', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                {plans?.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} - ${plan.price_monthly}/mo
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Billing Settings Tab
function BillingSettingsTab({ 
  organization, 
  formData, 
  onChange 
}: { 
  organization: Organization;
  formData: any;
  onChange: (field: string, value: any) => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Platform Fee Settings</CardTitle>
          <CardDescription>Configure the platform fee percentage for this organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fee">Application Fee Percentage</Label>
            <div className="flex items-center gap-2">
              <Input
                id="fee"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.application_fee_percentage}
                onChange={(e) => onChange('application_fee_percentage', parseFloat(e.target.value))}
                className="max-w-[120px]"
              />
              <span className="text-gray-500">%</span>
            </div>
            <p className="text-xs text-gray-500">
              This is the percentage of each booking that goes to the platform
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Fee Calculation Example
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  For a $100 booking with {formData.application_fee_percentage}% fee: 
                  Platform receives ${(100 * formData.application_fee_percentage / 100).toFixed(2)}, 
                  Organization receives ${(100 - (100 * formData.application_fee_percentage / 100)).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Billing History</CardTitle>
          <CardDescription>Recent invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No billing history available</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Stripe Connect Tab
function StripeConnectTab({ 
  organization,
  onCopy,
}: { 
  organization: Organization;
  onCopy: (text: string, label: string) => void;
}) {
  const isConnected = !!organization.stripe_account_id;
  const chargesEnabled = organization.stripe_charges_enabled;
  const payoutsEnabled = organization.stripe_payouts_enabled;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            Stripe Connect Status
            {isConnected ? (
              <Badge className="bg-emerald-600">Connected</Badge>
            ) : (
              <Badge variant="outline" className="border-amber-500 text-amber-600">
                Not Connected
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Stripe Connect account for payment processing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center gap-2 mb-2">
                    {chargesEnabled ? (
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                    )}
                    <span className="font-medium">Charges</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {chargesEnabled ? 'Enabled' : 'Setup required'}
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center gap-2 mb-2">
                    {payoutsEnabled ? (
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                    )}
                    <span className="font-medium">Payouts</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {payoutsEnabled ? 'Enabled' : 'Setup required'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Stripe Account ID</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={organization.stripe_account_id || ''} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => onCopy(organization.stripe_account_id || '', 'Stripe Account ID')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <a 
                  href={`https://dashboard.stripe.com/connect/accounts/${organization.stripe_account_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View in Stripe Dashboard
                </a>
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This organization hasn't connected their Stripe account yet
              </p>
              <Button variant="outline">
                <ExternalLink className="mr-2 h-4 w-4" />
                Send Onboarding Link
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Limits Tab
function LimitsTab({ organization }: { organization: Organization }) {
  const plan = organization.plan as any;
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Usage Limits</CardTitle>
          <CardDescription>Current plan limits and usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LimitItem
            label="Venues"
            current={organization.venues?.length || 0}
            max={plan?.max_venues || 'Unlimited'}
          />
          <LimitItem
            label="Staff Members"
            current={organization.members?.length || 0}
            max={plan?.max_staff || 'Unlimited'}
          />
          <LimitItem
            label="Monthly Bookings"
            current={0}
            max={plan?.max_bookings_per_month || 'Unlimited'}
          />
          <LimitItem
            label="Widgets"
            current={0}
            max={plan?.max_widgets || 'Unlimited'}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function LimitItem({ 
  label, 
  current, 
  max 
}: { 
  label: string; 
  current: number; 
  max: number | string;
}) {
  const percentage = typeof max === 'number' ? (current / max) * 100 : 0;
  const isUnlimited = max === 'Unlimited' || max === null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-medium">
          {current} / {isUnlimited ? '∞' : max}
        </span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all ${
            percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: isUnlimited ? '10%' : `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

// Team Tab
function TeamTab({ organization }: { organization: Organization }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Team Members</CardTitle>
          <CardDescription>Users associated with this organization</CardDescription>
        </CardHeader>
        <CardContent>
          {organization.members && organization.members.length > 0 ? (
            <div className="space-y-3">
              {organization.members.map((member) => (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium">User ID: {member.user_id.slice(0, 8)}...</p>
                      <p className="text-sm text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                    {member.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No team members found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
