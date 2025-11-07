import { useState } from 'react';
import { useTheme } from '../components/layout/ThemeContext';
import {
  CreditCard,
  Calendar,
  Download,
  CheckCircle2,
  Zap,
  Star,
  Crown,
  Sparkles,
  Users,
  Gamepad2,
  MessageSquare,
  Bot,
  BarChart3,
  Image,
  FileText,
  Code,
  Megaphone,
  DollarSign,
  ArrowRight,
  Receipt,
  Clock,
  Plus,
  ChevronRight,
  Shield,
  Award,
  X,
  AlertCircle,
  Loader2,
  RefreshCw,
  Gift,
  Percent
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { PageHeader } from '../components/layout/PageHeader';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  price: number | string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  popular?: boolean;
  features: string[];
  limits: {
    bookings: string;
    games: string;
    staff: string;
    credits: string;
    aiConversations: string;
    widgets: string;
    apiAccess: string;
  };
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started with booking management',
    icon: Gift,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    features: [
      'Unlimited bookings management',
      '3.9% transaction fee on customer bookings',
      '3 active games/rooms',
      '3 staff members',
      'Basic booking widget (1 template)',
      'Standard waivers',
      'Email support',
      'Basic reports',
      'Mobile app access',
      'Perfect for solo operators'
    ],
    limits: {
      bookings: 'Unlimited',
      games: '3',
      staff: '3',
      credits: 'Not included',
      aiConversations: 'Not included',
      widgets: '1 template',
      apiAccess: 'Not included'
    }
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    description: 'Perfect for small escape room businesses getting started',
    icon: Zap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    features: [
      'Up to 30 free bookings/month',
      'Up to 30 free AI conversations/month',
      '100 credits/month included',
      '5 active games/rooms',
      '5 staff members',
      'Basic booking widgets (3 templates)',
      'Standard waivers',
      '2 credits per booking beyond limit',
      '2 credits per waiver',
      '2 credits per AI conversation beyond limit',
      'Email support',
      'Basic reports',
      'Mobile app access'
    ],
    limits: {
      bookings: '30/month',
      games: '5',
      staff: '5',
      credits: '100/month',
      aiConversations: '30/month',
      widgets: '3 templates',
      apiAccess: 'Not included'
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    description: 'Advanced features for growing escape room businesses',
    icon: Star,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    popular: true,
    features: [
      'Up to 60 free bookings/month',
      'Up to 60 free AI conversations/month',
      '200 credits/month included',
      '15 active games/rooms',
      '25 staff members',
      'All booking widgets (8 templates)',
      'Custom waiver templates',
      'Advanced AI agents (Customer Assistant + 2 specialized)',
      'Google Ads & Facebook Ads integration',
      'Advanced analytics & reports',
      '2 credits per booking beyond limit',
      '2 credits per waiver',
      '2 credits per AI conversation beyond limit',
      'Priority email & chat support',
      'Custom branding'
    ],
    limits: {
      bookings: '60/month',
      games: '15',
      staff: '25',
      credits: '200/month',
      aiConversations: '60/month',
      widgets: '8 templates',
      apiAccess: 'Not included'
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    description: 'Complete solution for established escape room chains',
    icon: Crown,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    features: [
      'Unlimited bookings',
      'Unlimited AI conversations',
      'Custom credit allocation - contact sales',
      'Unlimited games/rooms',
      'Unlimited staff members',
      'All booking widgets with customization',
      'Custom waiver templates + legal review',
      'All AI agents including Calling Agent',
      'Full marketing suite (Google, Facebook, Tag Manager)',
      'Booster AI (coming soon)',
      'Advanced analytics with custom reports',
      'API access included',
      'Dedicated account manager',
      '24/7 phone support',
      'White-label options',
      'Multi-location support',
      'Custom integrations',
      'Training & onboarding'
    ],
    limits: {
      bookings: 'Unlimited',
      games: 'Unlimited',
      staff: 'Unlimited',
      credits: 'Contact Sales',
      aiConversations: 'Unlimited',
      widgets: 'All + Custom',
      apiAccess: 'Included'
    }
  }
];

export function Billing() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Semantic class variables
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const hoverBgClass = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';

  const [currentPlan] = useState('professional');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showBuyCreditsDialog, setShowBuyCreditsDialog] = useState(false);
  const [creditPurchaseStep, setCreditPurchaseStep] = useState(1);
  const [selectedCreditPackage, setSelectedCreditPackage] = useState<{amount: number, price: number} | null>(null);
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentResult, setPaymentResult] = useState<'success' | 'failed' | null>(null);
  const [paymentError, setPaymentError] = useState<string>('');

  const [invoiceHistory] = useState([
    { id: 'INV-2024-11', date: 'Nov 1, 2024', amount: 99, status: 'Paid', plan: 'Professional' },
    { id: 'INV-2024-10', date: 'Oct 1, 2024', amount: 99, status: 'Paid', plan: 'Professional' },
    { id: 'INV-2024-09', date: 'Sep 1, 2024', amount: 99, status: 'Paid', plan: 'Professional' },
    { id: 'INV-2024-08', date: 'Aug 1, 2024', amount: 99, status: 'Paid', plan: 'Professional' },
  ]);

  const [creditBalance] = useState(500);
  const [creditUsage] = useState({
    bookings: 45,
    waivers: 28,
    aiConversations: 67
  });

  const [paymentMethods, setPaymentMethods] = useState([
    { id: '1', type: 'card', brand: 'Visa', last4: '4242', expiryMonth: '12', expiryYear: '2025', isDefault: true },
  ]);

  const [newCardDetails, setNewCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    name: ''
  });

  const getDiscount = () => {
    return billingCycle === 'yearly' ? 0.2 : 0;
  };

  const calculatePrice = (price: number | string) => {
    if (typeof price === 'string') return price;
    if (price === 0) return 0; // Free plan
    const yearlyPrice = price * 12;
    const discount = getDiscount();
    const finalPrice = yearlyPrice * (1 - discount);
    return billingCycle === 'yearly' ? finalPrice / 12 : price;
  };

  const handleChangePlan = (planId: string) => {
    setSelectedPlan(planId);
    setShowChangePlanDialog(true);
  };

  const confirmPlanChange = () => {
    toast.success(`Successfully changed to ${plans.find(p => p.id === selectedPlan)?.name} plan`);
    setShowChangePlanDialog(false);
  };

  const handleSelectCreditPackage = (amount: number, price: number) => {
    setSelectedCreditPackage({ amount, price });
    setCreditPurchaseStep(2);
  };

  const simulatePaymentProcessing = (): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.3;
        resolve(success);
      }, 2500);
    });
  };

  const handleConfirmCreditPurchase = async () => {
    if (selectedCreditPackage) {
      setIsProcessingPayment(true);
      setPaymentResult(null);
      
      const success = await simulatePaymentProcessing();
      
      setIsProcessingPayment(false);
      
      if (success) {
        setPaymentResult('success');
      } else {
        const errorMessages = [
          'Insufficient funds. Please try another card.',
          'Your card was declined. Please contact your bank.',
          'Payment failed due to security restrictions.',
          'Transaction could not be completed. Please verify your card details.',
          'Card verification failed. Please check your information.'
        ];
        setPaymentError(errorMessages[Math.floor(Math.random() * errorMessages.length)]);
        setPaymentResult('failed');
      }
    }
  };

  const handleAddPaymentMethod = async () => {
    setIsProcessingPayment(true);
    setPaymentResult(null);
    
    const success = await simulatePaymentProcessing();
    
    setIsProcessingPayment(false);
    
    if (success) {
      const newMethod = {
        id: String(paymentMethods.length + 1),
        type: 'card',
        brand: 'Visa',
        last4: newCardDetails.cardNumber.slice(-4),
        expiryMonth: newCardDetails.expiryDate.split('/')[0],
        expiryYear: '20' + newCardDetails.expiryDate.split('/')[1],
        isDefault: paymentMethods.length === 0
      };
      setPaymentMethods([...paymentMethods, newMethod]);
      setNewCardDetails({ cardNumber: '', expiryDate: '', cvc: '', name: '' });
      setPaymentResult('success');
    } else {
      const errorMessages = [
        'Unable to verify card details. Please check your information.',
        'Card validation failed. Please try again.',
        'This card cannot be added. Please use a different card.',
        'Payment processor error. Please try again later.',
        'Card verification failed. Please contact your bank.'
      ];
      setPaymentError(errorMessages[Math.floor(Math.random() * errorMessages.length)]);
      setPaymentResult('failed');
    }
  };

  const resetPaymentFlow = () => {
    setPaymentResult(null);
    setPaymentError('');
    setIsProcessingPayment(false);
  };

  const handleCloseAddPaymentDialog = () => {
    setShowAddPaymentDialog(false);
    resetPaymentFlow();
    setNewCardDetails({ cardNumber: '', expiryDate: '', cvc: '', name: '' });
  };

  const handleCloseBuyCreditsDialog = () => {
    setShowBuyCreditsDialog(false);
    setCreditPurchaseStep(1);
    setSelectedCreditPackage(null);
    resetPaymentFlow();
  };

  const handleRetryPayment = () => {
    resetPaymentFlow();
  };

  const handleSuccessComplete = () => {
    if (showAddPaymentDialog) {
      handleCloseAddPaymentDialog();
      toast.success('Payment method added successfully');
    } else if (showBuyCreditsDialog && selectedCreditPackage) {
      toast.success(`Successfully purchased ${selectedCreditPackage.amount} credits for $${selectedCreditPackage.price}`);
      handleCloseBuyCreditsDialog();
    }
  };

  const handleSetDefaultPayment = (id: string) => {
    setPaymentMethods(paymentMethods.map(pm => ({
      ...pm,
      isDefault: pm.id === id
    })));
    toast.success('Default payment method updated');
  };

  const handleDeletePaymentMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
    toast.success('Payment method removed');
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Billing & Subscription"
        description="Manage your plan, billing, and payment information"
        sticky
      />

      {/* Current Plan Overview */}
      <Card className={`border shadow-lg ${isDark ? 'border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-[#161616]' : 'border-purple-200 bg-gradient-to-br from-purple-50 to-white'}`}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
            <div className="flex items-start gap-4 w-full">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${isDark ? 'bg-gradient-to-br from-[#4f46e5] to-[#4338ca]' : 'bg-gradient-to-br from-purple-600 to-purple-700'}`}>
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className={textClass}>Professional Plan</h2>
                  <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400 border-0' : 'bg-green-100 text-green-700 border-0'}>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <p className={`text-sm ${textMutedClass} mb-3`}>
                  Your current subscription includes all professional features
                </p>
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className={`flex items-center gap-2 ${textMutedClass}`}>
                    <Calendar className="w-4 h-4" />
                    Renews Dec 15, 2025
                  </div>
                  <div className={`flex items-center gap-2 ${textMutedClass}`}>
                    <DollarSign className="w-4 h-4" />
                    $99/month
                  </div>
                  <div className={`flex items-center gap-2 ${textMutedClass}`}>
                    <Award className="w-4 h-4" />
                    30 days free trial used
                  </div>
                </div>
              </div>
            </div>
            <Button variant="outline" className="h-11">
              Manage Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing Cycle Toggle */}
      <div className={`flex items-center justify-center gap-4 p-4 rounded-lg border ${borderClass} ${bgElevatedClass}`}>
        <span className={`text-sm ${billingCycle === 'monthly' ? textClass : textMutedClass}`}>
          Monthly
        </span>
        <Switch
          checked={billingCycle === 'yearly'}
          onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
        />
        <span className={`text-sm ${billingCycle === 'yearly' ? textClass : textMutedClass}`}>
          Yearly
        </span>
        {billingCycle === 'yearly' && (
          <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400 border-0' : 'bg-green-100 text-green-700 border-0'}>
            <Percent className="w-3 h-3 mr-1" />
            Save 20%
          </Badge>
        )}
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = plan.id === currentPlan;
          const monthlyPrice = calculatePrice(plan.price);
          
          return (
            <Card 
              key={plan.id} 
              className={`border-2 shadow-lg transition-all ${
                plan.popular 
                  ? (isDark ? 'border-purple-500/50 bg-gradient-to-br from-purple-900/20 to-[#161616]' : 'border-purple-300 bg-gradient-to-br from-purple-50 to-white')
                  : isCurrentPlan
                  ? (isDark ? 'border-[#4f46e5]/50 bg-gradient-to-br from-[#4f46e5]/10 to-[#161616]' : 'border-blue-300 bg-gradient-to-br from-blue-50 to-white')
                  : (isDark ? `border-[#2a2a2a] ${cardBgClass} hover:border-[#3a3a3a]` : 'border-gray-200 hover:border-gray-300')
              }`}
            >
              <CardHeader className="p-6">
                {plan.popular && (
                  <div className="absolute top-0 right-6 transform -translate-y-1/2">
                    <Badge className={isDark ? 'bg-[#4f46e5] text-white border-0 shadow-lg' : 'bg-purple-600 text-white border-0 shadow-lg'}>
                      <Sparkles className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${isDark ? 'bg-[#1e1e1e]' : plan.bgColor}`}>
                  <Icon className={`w-7 h-7 ${isDark ? 'text-[#6366f1]' : plan.color}`} />
                </div>
                <CardTitle className={textClass}>{plan.name}</CardTitle>
                <CardDescription className={`text-sm min-h-[40px] ${textMutedClass}`}>{plan.description}</CardDescription>
                
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    {typeof monthlyPrice === 'string' ? (
                      <span className={textClass}>
                        {monthlyPrice}
                      </span>
                    ) : monthlyPrice === 0 ? (
                      <div>
                        <span className={textClass}>Free</span>
                        <p className={`text-xs mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          3.9% per booking transaction
                        </p>
                      </div>
                    ) : (
                      <>
                        <span className={textClass}>
                          ${monthlyPrice.toFixed(0)}
                        </span>
                        <span className={textMutedClass}>/month</span>
                      </>
                    )}
                  </div>
                  {billingCycle === 'yearly' && typeof monthlyPrice === 'number' && monthlyPrice > 0 && (
                    <p className={`text-xs mt-1 ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>
                      Billed ${(monthlyPrice * 12).toFixed(0)}/year
                    </p>
                  )}
                  {plan.id === 'enterprise' && (
                    <Badge className={isDark ? 'bg-orange-500/20 text-orange-400 border-0 mt-2' : 'bg-orange-100 text-orange-700 border-0 mt-2'}>
                      Contact Sales
                    </Badge>
                  )}
                  {!isCurrentPlan && plan.id === 'free' && (
                    <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400 border-0 mt-2' : 'bg-emerald-100 text-emerald-700 border-0 mt-2'}>
                      No credit card required
                    </Badge>
                  )}
                  {!isCurrentPlan && plan.id === 'starter' && (
                    <Badge className={isDark ? 'bg-[#4f46e5]/20 text-[#6366f1] border-0 mt-2' : 'bg-blue-100 text-blue-700 border-0 mt-2'}>
                      30 days free trial
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 p-6 pt-0">
                <Separator className={borderClass} />
                
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                      <span className={`text-sm ${textMutedClass}`}>{feature}</span>
                    </div>
                  ))}
                </div>

                <Separator className={borderClass} />

                {isCurrentPlan ? (
                  <Button className={`w-full h-11 ${isDark ? 'bg-[#2a2a2a] text-[#737373]' : 'bg-gray-600'} cursor-default`} disabled>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                    className={`w-full h-11 ${
                      plan.id === 'enterprise'
                        ? (isDark ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-orange-600 hover:bg-orange-700')
                        : plan.popular 
                        ? (isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-purple-600 hover:bg-purple-700')
                        : (isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700')
                    }`}
                    onClick={() => handleChangePlan(plan.id)}
                  >
                    {plan.id === 'enterprise' ? 'Contact Sales' :
                     plan.id === 'free' ? 'Start Free' :
                     plan.id === 'starter' ? 'Start Free Trial' : 
                     plans.findIndex(p => p.id === currentPlan) < plans.findIndex(p => p.id === plan.id) ? 'Upgrade' : 'Downgrade'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Feature Comparison */}
      <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
        <CardHeader className="p-6">
          <CardTitle className={textClass}>Feature Comparison</CardTitle>
          <CardDescription className={textMutedClass}>Compare limits across all plans</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${borderClass}`}>
                  <th className={`text-left py-3 px-4 text-sm ${textClass}`}>Feature</th>
                  {plans.map(plan => (
                    <th key={plan.id} className={`text-center py-3 px-4 text-sm ${textClass}`}>
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className={`border-b ${isDark ? 'border-[#2a2a2a]/50' : 'border-gray-100'}`}>
                  <td className={`py-3 px-4 text-sm ${textMutedClass}`}>Bookings</td>
                  {plans.map(plan => (
                    <td key={plan.id} className={`text-center py-3 px-4 text-sm ${textClass}`}>
                      {plan.limits.bookings}
                    </td>
                  ))}
                </tr>
                <tr className={`border-b ${isDark ? 'border-[#2a2a2a]/50' : 'border-gray-100'}`}>
                  <td className={`py-3 px-4 text-sm ${textMutedClass}`}>Transaction Fee</td>
                  {plans.map(plan => (
                    <td key={plan.id} className={`text-center py-3 px-4 text-sm ${textClass}`}>
                      {plan.id === 'free' ? '3.9%' : '0%'}
                    </td>
                  ))}
                </tr>
                <tr className={`border-b ${isDark ? 'border-[#2a2a2a]/50' : 'border-gray-100'}`}>
                  <td className={`py-3 px-4 text-sm ${textMutedClass}`}>Games/Rooms</td>
                  {plans.map(plan => (
                    <td key={plan.id} className={`text-center py-3 px-4 text-sm ${textClass}`}>
                      {plan.limits.games}
                    </td>
                  ))}
                </tr>
                <tr className={`border-b ${isDark ? 'border-[#2a2a2a]/50' : 'border-gray-100'}`}>
                  <td className={`py-3 px-4 text-sm ${textMutedClass}`}>Staff Members</td>
                  {plans.map(plan => (
                    <td key={plan.id} className={`text-center py-3 px-4 text-sm ${textClass}`}>
                      {plan.limits.staff}
                    </td>
                  ))}
                </tr>
                <tr className={`border-b ${isDark ? 'border-[#2a2a2a]/50' : 'border-gray-100'}`}>
                  <td className={`py-3 px-4 text-sm ${textMutedClass}`}>Monthly Credits</td>
                  {plans.map(plan => (
                    <td key={plan.id} className={`text-center py-3 px-4 text-sm ${textClass}`}>
                      {plan.limits.credits}
                    </td>
                  ))}
                </tr>
                <tr className={`border-b ${isDark ? 'border-[#2a2a2a]/50' : 'border-gray-100'}`}>
                  <td className={`py-3 px-4 text-sm ${textMutedClass}`}>AI Conversations</td>
                  {plans.map(plan => (
                    <td key={plan.id} className={`text-center py-3 px-4 text-sm ${textClass}`}>
                      {plan.limits.aiConversations}
                    </td>
                  ))}
                </tr>
                <tr className={`border-b ${isDark ? 'border-[#2a2a2a]/50' : 'border-gray-100'}`}>
                  <td className={`py-3 px-4 text-sm ${textMutedClass}`}>Booking Widgets</td>
                  {plans.map(plan => (
                    <td key={plan.id} className={`text-center py-3 px-4 text-sm ${textClass}`}>
                      {plan.limits.widgets}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className={`py-3 px-4 text-sm ${textMutedClass}`}>API Access</td>
                  {plans.map(plan => (
                    <td key={plan.id} className={`text-center py-3 px-4 text-sm ${textClass}`}>
                      {plan.limits.apiAccess}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Credit System Info */}
      <Card className={`border shadow-sm ${isDark ? 'border-[#4f46e5]/30 bg-[#4f46e5]/10' : 'border-blue-200 bg-blue-50'}`}>
        <CardHeader className="p-6">
          <CardTitle className={isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}>How Credits Work</CardTitle>
          <CardDescription className={isDark ? 'text-[#c7d2fe]' : 'text-blue-700'}>
            Understanding your credit allocation and usage
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : 'bg-white border-blue-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <p className={`text-sm ${isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}`}>Bookings</p>
              </div>
              <p className={`text-xs mb-2 ${textMutedClass}`}>
                Free: Unlimited (3.9% fee)<br />
                Starter: 30 free/month<br />
                Professional: 60 free/month<br />
                Enterprise: Unlimited
              </p>
              <Badge className={isDark ? 'bg-[#4f46e5]/20 text-[#6366f1] border-0 text-xs' : 'bg-blue-100 text-blue-700 border-0 text-xs'}>
                2 credits per extra booking
              </Badge>
            </div>

            <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : 'bg-white border-blue-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <FileText className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <p className={`text-sm ${isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}`}>Waivers</p>
              </div>
              <p className={`text-xs mb-2 ${textMutedClass}`}>
                All plans can create and manage unlimited waiver templates
              </p>
              <Badge className={isDark ? 'bg-[#4f46e5]/20 text-[#6366f1] border-0 text-xs' : 'bg-blue-100 text-blue-700 border-0 text-xs'}>
                2 credits per waiver signed
              </Badge>
            </div>

            <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : 'bg-white border-blue-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <p className={`text-sm ${isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}`}>AI Conversations</p>
              </div>
              <p className={`text-xs mb-2 ${textMutedClass}`}>
                Free: Not included<br />
                Starter: 30 free/month<br />
                Professional: 60 free/month<br />
                Enterprise: Unlimited
              </p>
              <Badge className={isDark ? 'bg-[#4f46e5]/20 text-[#6366f1] border-0 text-xs' : 'bg-blue-100 text-blue-700 border-0 text-xs'}>
                2 credits per extra conversation
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Credits Balance */}
        <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
          <CardHeader className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className={textClass}>Credits Balance</CardTitle>
                <CardDescription className={textMutedClass}>Additional usage credits</CardDescription>
              </div>
              <Button 
                onClick={() => setShowBuyCreditsDialog(true)}
                style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}
              >
                <Plus className="w-4 h-4 mr-2" />
                Buy Credits
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6 pt-0">
            <div className={`p-6 rounded-xl text-white ${isDark ? 'bg-gradient-to-br from-[#4f46e5] to-[#4338ca]' : 'bg-gradient-to-br from-blue-600 to-blue-700'}`}>
              <p className="text-sm opacity-90 mb-1">Available Credits</p>
              <p className="text-4xl">{creditBalance}</p>
              <p className="text-xs opacity-75 mt-2">
                Credits used for bookings, waivers, and AI conversations beyond your plan limits
              </p>
            </div>

            <Separator className={borderClass} />

            <div>
              <Label className={`text-sm mb-3 block ${textClass}`}>Credit Usage This Month</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 ${textMutedClass}`}>
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Extra Bookings (2 credits each)</span>
                  </div>
                  <span className={`text-sm ${textClass}`}>{creditUsage.bookings * 2} credits</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 ${textMutedClass}`}>
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">Waivers (2 credits each)</span>
                  </div>
                  <span className={`text-sm ${textClass}`}>{creditUsage.waivers * 2} credits</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 ${textMutedClass}`}>
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">Extra AI Conversations (2 credits each)</span>
                  </div>
                  <span className={`text-sm ${textClass}`}>{creditUsage.aiConversations * 2} credits</span>
                </div>
                <Separator className={borderClass} />
                <div className="flex items-center justify-between pt-2">
                  <span className={`text-sm ${textClass}`}>Total Used</span>
                  <span className={`text-sm ${textClass}`}>
                    {(creditUsage.bookings + creditUsage.waivers + creditUsage.aiConversations) * 2} credits
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
          <CardHeader className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className={textClass}>Payment Methods</CardTitle>
                <CardDescription className={textMutedClass}>Manage your payment information</CardDescription>
              </div>
              <Button 
                onClick={() => setShowAddPaymentDialog(true)}
                style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Method
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6 pt-0">
            {paymentMethods.map((method) => (
              <div key={method.id} className={`p-4 rounded-lg border ${borderClass} ${bgElevatedClass}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-[#4f46e5] to-purple-600' : 'bg-gradient-to-br from-blue-600 to-purple-600'}`}>
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`text-sm ${textClass}`}>{method.brand} •••• {method.last4}</p>
                        {method.isDefault && (
                          <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400 border-0 text-xs' : 'bg-green-100 text-green-700 border-0 text-xs'}>Default</Badge>
                        )}
                      </div>
                      <p className={`text-xs ${textMutedClass}`}>Expires {method.expiryMonth}/{method.expiryYear}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSetDefaultPayment(method.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    {!method.isDefault && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className={isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}
                        onClick={() => handleDeletePaymentMethod(method.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <Separator className={borderClass} />

            <div className="space-y-2">
              <div className={`flex items-center justify-between text-sm ${textMutedClass}`}>
                <span>Billing Email</span>
                <span className={textClass}>john.doe@bookingtms.com</span>
              </div>
              <div className={`flex items-center justify-between text-sm ${textMutedClass}`}>
                <span>Next Billing Date</span>
                <span className={textClass}>December 15, 2025</span>
              </div>
              <div className={`flex items-center justify-between text-sm ${textMutedClass}`}>
                <span>Next Charge Amount</span>
                <span className={textClass}>$99.00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Management */}
      <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
        <CardHeader className="p-6">
          <CardTitle className={textClass}>Subscription Management</CardTitle>
          <CardDescription className={textMutedClass}>Manage your subscription settings and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6 pt-0">
          <div className={`flex items-center justify-between p-4 rounded-lg border ${borderClass} ${hoverBgClass} transition-colors`}>
            <div>
              <p className={`text-sm ${textClass}`}>Auto-renew Subscription</p>
              <p className={`text-xs ${textMutedClass} mt-1`}>
                Automatically renew your subscription each billing cycle
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className={`flex items-center justify-between p-4 rounded-lg border ${borderClass} ${hoverBgClass} transition-colors`}>
            <div>
              <p className={`text-sm ${textClass}`}>Usage Alerts</p>
              <p className={`text-xs ${textMutedClass} mt-1`}>
                Get notified when you reach 80% of your plan limits
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className={`flex items-center justify-between p-4 rounded-lg border ${borderClass} ${hoverBgClass} transition-colors`}>
            <div>
              <p className={`text-sm ${textClass}`}>Invoice Emails</p>
              <p className={`text-xs ${textMutedClass} mt-1`}>
                Receive invoice notifications via email
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator className={borderClass} />

          <div className="space-y-3">
            <Button variant="outline" className={`w-full justify-start h-11 ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}`}>
              <Clock className="w-4 h-4 mr-2" />
              Pause Subscription
            </Button>
            <Button variant="outline" className={`w-full justify-start h-11 ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}`}>
              <ChevronRight className="w-4 h-4 mr-2" />
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
        <CardHeader className="p-6">
          <CardTitle className={textClass}>Invoice History</CardTitle>
          <CardDescription className={textMutedClass}>View and download your past invoices</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-2">
            {invoiceHistory.map((invoice) => (
              <div 
                key={invoice.id}
                className={`flex items-center justify-between p-4 rounded-lg ${bgElevatedClass} ${hoverBgClass} transition-colors`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}`}>
                    <Receipt className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <p className={`text-sm ${textClass}`}>{invoice.id}</p>
                    <p className={`text-xs ${textMutedClass}`}>{invoice.date} • {invoice.plan} Plan</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-sm ${textClass}`}>${invoice.amount}.00</p>
                    <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400 border-0 text-xs' : 'bg-green-100 text-green-700 border-0 text-xs'}>
                      {invoice.status}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Change Plan Dialog */}
      <Dialog open={showChangePlanDialog} onOpenChange={setShowChangePlanDialog}>
        <DialogContent className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}>
          <DialogHeader>
            <DialogTitle className={textClass}>Change Subscription Plan</DialogTitle>
            <DialogDescription className={textMutedClass}>
              You're about to change your plan to {plans.find(p => p.id === selectedPlan)?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-start gap-2">
                <Shield className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <div>
                  <p className={`text-sm ${isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}`}>Plan Change Details</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-[#c7d2fe]' : 'text-blue-700'}`}>
                    Your new plan will be effective immediately. You'll be charged a prorated amount for the remaining billing period.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className={`flex justify-between text-sm ${textMutedClass}`}>
                <span>New Plan</span>
                <span className={textClass}>{plans.find(p => p.id === selectedPlan)?.name}</span>
              </div>
              <div className={`flex justify-between text-sm ${textMutedClass}`}>
                <span>Price</span>
                <span className={textClass}>${plans.find(p => p.id === selectedPlan)?.price}/month</span>
              </div>
              <div className={`flex justify-between text-sm ${textMutedClass}`}>
                <span>Billing Cycle</span>
                <span className={textClass}>{billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangePlanDialog(false)}>
              Cancel
            </Button>
            <Button 
              style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
              className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}
              onClick={confirmPlanChange}
            >
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Buy Credits Dialog - Simplified for space */}
      <Dialog open={showBuyCreditsDialog} onOpenChange={(open) => {
        if (!open) handleCloseBuyCreditsDialog();
        setShowBuyCreditsDialog(open);
      }}>
        <DialogContent className={`max-w-2xl ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}`}>
          <DialogHeader>
            <DialogTitle className={textClass}>Buy Additional Credits</DialogTitle>
            <DialogDescription className={textMutedClass}>Purchase credits for usage beyond your plan limits</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSelectCreditPackage(100, 10)}
                className={`p-4 border-2 rounded-lg transition-colors text-left ${
                  isDark 
                    ? 'border-[#2a2a2a] hover:border-[#4f46e5]' 
                    : 'border-gray-200 hover:border-blue-600'
                }`}
              >
                <p className={`text-2xl ${textClass}`}>100</p>
                <p className={`text-sm ${textMutedClass}`}>Credits</p>
                <p className={`text-lg ${textClass} mt-2`}>$10</p>
                <p className={`text-xs ${textMutedClass}`}>$0.10 per credit</p>
              </button>
              <button
                onClick={() => handleSelectCreditPackage(500, 45)}
                className={`p-4 border-2 rounded-lg transition-colors text-left ${
                  isDark 
                    ? 'border-[#2a2a2a] hover:border-[#4f46e5]' 
                    : 'border-gray-200 hover:border-blue-600'
                }`}
              >
                <p className={`text-2xl ${textClass}`}>500</p>
                <p className={`text-sm ${textMutedClass}`}>Credits</p>
                <p className={`text-lg ${textClass} mt-2`}>$45</p>
                <div className="flex items-center justify-between mt-1">
                  <p className={`text-xs ${textMutedClass}`}>$0.09 per credit</p>
                  <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400 border-0 text-xs' : 'bg-green-100 text-green-700 border-0 text-xs'}>Save 10%</Badge>
                </div>
              </button>
              <button
                onClick={() => handleSelectCreditPackage(1000, 80)}
                className={`p-4 border-2 rounded-lg transition-colors text-left ${
                  isDark 
                    ? 'border-[#2a2a2a] hover:border-[#4f46e5]' 
                    : 'border-gray-200 hover:border-blue-600'
                }`}
              >
                <p className={`text-2xl ${textClass}`}>1,000</p>
                <p className={`text-sm ${textMutedClass}`}>Credits</p>
                <p className={`text-lg ${textClass} mt-2`}>$80</p>
                <div className="flex items-center justify-between mt-1">
                  <p className={`text-xs ${textMutedClass}`}>$0.08 per credit</p>
                  <Badge className={isDark ? 'bg-emerald-500/20 text-emerald-400 border-0 text-xs' : 'bg-green-100 text-green-700 border-0 text-xs'}>Save 20%</Badge>
                </div>
              </button>
              <button
                onClick={() => handleSelectCreditPackage(2500, 175)}
                className={`p-4 border-2 rounded-lg transition-colors text-left ${
                  isDark 
                    ? 'border-purple-500/50 bg-purple-500/10 hover:border-purple-500' 
                    : 'border-purple-300 bg-purple-50 hover:border-purple-600'
                }`}
              >
                <p className={`text-2xl ${textClass}`}>2,500</p>
                <p className={`text-sm ${textMutedClass}`}>Credits</p>
                <p className={`text-lg ${textClass} mt-2`}>$175</p>
                <div className="flex items-center justify-between mt-1">
                  <p className={`text-xs ${textMutedClass}`}>$0.07 per credit</p>
                  <Badge className={isDark ? 'bg-purple-600 text-white border-0 text-xs' : 'bg-purple-600 text-white border-0 text-xs'}>Save 30%</Badge>
                </div>
              </button>
            </div>

            <div className={`p-3 rounded-lg text-xs ${isDark ? 'bg-[#1e1e1e] text-[#a3a3a3]' : 'bg-gray-50 text-gray-600'}`}>
              <p>• Credits never expire</p>
              <p>• Use for bookings, waivers, and AI conversations beyond your plan limits</p>
              <p>• 2 credits per booking, 2 credits per waiver, 2 credits per AI conversation</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseBuyCreditsDialog}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Payment Method Dialog */}
      <Dialog open={showAddPaymentDialog} onOpenChange={(open) => {
        if (!open) handleCloseAddPaymentDialog();
        setShowAddPaymentDialog(open);
      }}>
        <DialogContent className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}>
          <DialogHeader>
            <DialogTitle className={textClass}>
              {!paymentResult ? 'Add Payment Method' : 
                paymentResult === 'success' ? 'Card Added Successfully' :
                'Card Verification Failed'}
            </DialogTitle>
            <DialogDescription className={textMutedClass}>
              {!paymentResult ? 'Add a new credit or debit card to your account' :
                paymentResult === 'success' ? 'Your payment method is ready to use' :
                'Unable to add this payment method'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {!isProcessingPayment && !paymentResult && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber" className={textClass}>Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    value={newCardDetails.cardNumber}
                    onChange={(e) => setNewCardDetails({
                      ...newCardDetails,
                      cardNumber: formatCardNumber(e.target.value)
                    })}
                    className="h-11 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate" className={textClass}>Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={newCardDetails.expiryDate}
                      onChange={(e) => setNewCardDetails({
                        ...newCardDetails,
                        expiryDate: formatExpiryDate(e.target.value)
                      })}
                      className="h-11 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc" className={textClass}>CVC</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      maxLength={4}
                      value={newCardDetails.cvc}
                      onChange={(e) => setNewCardDetails({
                        ...newCardDetails,
                        cvc: e.target.value.replace(/\D/g, '')
                      })}
                      className="h-11 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardName" className={textClass}>Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={newCardDetails.name}
                    onChange={(e) => setNewCardDetails({
                      ...newCardDetails,
                      name: e.target.value
                    })}
                    className="h-11"
                  />
                </div>
              </>
            )}

            {isProcessingPayment && (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}`}>
                  <Loader2 className={`w-8 h-8 animate-spin ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                </div>
                <p className={textClass}>Processing Payment</p>
                <p className={`text-sm ${textMutedClass}`}>Please wait...</p>
              </div>
            )}

            {paymentResult === 'success' && (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-emerald-500/20' : 'bg-green-100'}`}>
                  <CheckCircle2 className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                </div>
                <p className={`text-xl ${textClass} mb-1`}>Payment Successful!</p>
                <p className={`text-sm ${textMutedClass} text-center`}>
                  Your payment method has been added
                </p>
              </div>
            )}

            {paymentResult === 'failed' && (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                  <AlertCircle className={`w-8 h-8 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <p className={`text-xl ${textClass} mb-1`}>Payment Failed</p>
                <p className={`text-sm ${textMutedClass} text-center mb-4`}>
                  {paymentError}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            {!isProcessingPayment && paymentResult === null && (
              <>
                <Button variant="outline" onClick={handleCloseAddPaymentDialog}>
                  Cancel
                </Button>
                <Button 
                  style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                  className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}
                  onClick={handleAddPaymentMethod}
                >
                  Add Card
                </Button>
              </>
            )}

            {paymentResult === 'success' && (
              <Button 
                className={isDark ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-green-600 hover:bg-green-700'}
                onClick={handleSuccessComplete}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Done
              </Button>
            )}

            {paymentResult === 'failed' && (
              <>
                <Button variant="outline" onClick={handleCloseAddPaymentDialog}>
                  Cancel
                </Button>
                <Button 
                  style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                  className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}
                  onClick={handleRetryPayment}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
