'use client';

import React, { useState } from 'react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { useTheme } from '../components/layout/ThemeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Gift, Mail, Plus, X, CreditCard, Check, Sparkles, Calendar, User, ChevronRight, ChevronLeft, ShoppingCart, Heart, Star, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface Recipient {
  id: string;
  name: string;
  email: string;
}

const GiftVouchers = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Step management
  const [currentStep, setCurrentStep] = useState<'amount' | 'recipients' | 'customize' | 'payment' | 'success'>('amount');

  // Amount selection
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  // Recipients
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: '1', name: '', email: '' }
  ]);

  // Customization
  const [personalMessage, setPersonalMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<'birthday' | 'holiday' | 'celebration' | 'general'>('general');

  // Payment
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingEmail: ''
  });

  // Predefined amounts
  const predefinedAmounts = [50, 100, 150, 200, 250, 500];

  // Theme options
  const themes = [
    { id: 'birthday', name: 'Birthday', emoji: '🎂', color: '#ec4899' },
    { id: 'holiday', name: 'Holiday', emoji: '🎄', color: '#10b981' },
    { id: 'celebration', name: 'Celebration', emoji: '🎉', color: '#f59e0b' },
    { id: 'general', name: 'General', emoji: '🎁', color: '#6366f1' }
  ];

  const addRecipient = () => {
    setRecipients([...recipients, { id: Date.now().toString(), name: '', email: '' }]);
  };

  const removeRecipient = (id: string) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter(r => r.id !== id));
    } else {
      toast.error('At least one recipient is required');
    }
  };

  const updateRecipient = (id: string, field: 'name' | 'email', value: string) => {
    setRecipients(recipients.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const getTotalAmount = () => {
    const amount = selectedAmount || parseInt(customAmount) || 0;
    return amount * recipients.length;
  };

  const handleNext = () => {
    if (currentStep === 'amount') {
      if (!selectedAmount && !customAmount) {
        toast.error('Please select or enter an amount');
        return;
      }
      setCurrentStep('recipients');
    } else if (currentStep === 'recipients') {
      // Validate recipients
      const hasEmptyFields = recipients.some(r => !r.name.trim() || !r.email.trim());
      if (hasEmptyFields) {
        toast.error('Please fill in all recipient details');
        return;
      }
      setCurrentStep('customize');
    } else if (currentStep === 'customize') {
      if (!senderName.trim()) {
        toast.error('Please enter your name');
        return;
      }
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      // Validate payment
      if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv || !paymentDetails.billingEmail) {
        toast.error('Please fill in all payment details');
        return;
      }
      // Simulate payment processing
      setTimeout(() => {
        setCurrentStep('success');
        toast.success('Gift vouchers sent successfully!');
      }, 1500);
    }
  };

  const handleBack = () => {
    if (currentStep === 'recipients') setCurrentStep('amount');
    else if (currentStep === 'customize') setCurrentStep('recipients');
    else if (currentStep === 'payment') setCurrentStep('customize');
  };

  const handleStartOver = () => {
    setCurrentStep('amount');
    setSelectedAmount(null);
    setCustomAmount('');
    setRecipients([{ id: '1', name: '', email: '' }]);
    setPersonalMessage('');
    setSenderName('');
    setDeliveryDate('');
    setSelectedTheme('general');
    setPaymentDetails({ cardNumber: '', expiryDate: '', cvv: '', billingEmail: '' });
  };

  // Color classes
  const bgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';

  return (
    <AdminLayout currentPage="gift-vouchers" onNavigate={() => { }}>
      <div className={`min-h-screen ${bgClass} py-8 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-4xl mx-auto">
          {/* Header with festive decoration */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
              <Gift className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            </div>
            <h1 className={`text-4xl mb-2 ${textClass}`}>Gift Vouchers</h1>
            <p className={textMutedClass}>Give the gift of unforgettable experiences!</p>
          </div>

          {/* Progress Steps */}
          {currentStep !== 'success' && (
            <div className={`${cardBgClass} border ${borderClass} rounded-xl p-6 mb-6 shadow-lg`}>
              <div className="flex items-center justify-between">
                {['amount', 'recipients', 'customize', 'payment'].map((step, index) => {
                  const isActive = currentStep === step;
                  const isCompleted = ['amount', 'recipients', 'customize', 'payment'].indexOf(currentStep) > index;

                  return (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted
                            ? 'bg-green-500 border-green-500 text-white'
                            : isActive
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : isDark ? 'bg-[#1e1e1e] border-[#3a3a3a] text-[#737373]' : 'bg-gray-100 border-gray-300 text-gray-400'
                          }`}>
                          {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                        </div>
                        <span className={`text-xs mt-2 capitalize ${isActive ? 'text-indigo-600 dark:text-indigo-400' : textMutedClass}`}>
                          {step === 'amount' ? 'Amount' : step === 'recipients' ? 'Recipients' : step === 'customize' ? 'Customize' : 'Payment'}
                        </span>
                      </div>
                      {index < 3 && (
                        <div className={`h-0.5 flex-1 ${isCompleted ? 'bg-green-500' : isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 1: Amount Selection */}
          {currentStep === 'amount' && (
            <Card className={`${cardBgClass} border ${borderClass} p-8 shadow-xl`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className={`text-2xl ${textClass}`}>Select Amount</h2>
                  <p className={textMutedClass}>Choose a voucher value</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {predefinedAmounts.map(amount => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                    }}
                    className={`p-6 rounded-xl border-2 transition-all hover:scale-105 ${selectedAmount === amount
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                        : isDark ? 'border-[#2a2a2a] hover:border-[#3a3a3a]' : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className={`text-3xl mb-1 ${selectedAmount === amount ? 'text-indigo-600 dark:text-indigo-400' : textClass}`}>
                      ${amount}
                    </div>
                    <div className={`text-sm ${selectedAmount === amount ? 'text-indigo-600 dark:text-indigo-400' : textMutedClass}`}>
                      Per voucher
                    </div>
                  </button>
                ))}
              </div>

              <Separator className={`my-6 ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200'}`} />

              <div className="space-y-2">
                <Label className={isDark ? 'text-white' : 'text-gray-700'}>Or enter custom amount</Label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xl ${textMutedClass}`}>$</span>
                  <Input
                    type="number"
                    placeholder="0"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    className={`pl-8 text-xl h-14 ${isDark
                        ? 'bg-[#1e1e1e] border-[#3a3a3a] text-white placeholder:text-[#737373]'
                        : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'
                      }`}
                  />
                </div>
                <p className={`text-sm ${textMutedClass}`}>Minimum $10, Maximum $1000</p>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {/* Step 2: Recipients */}
          {currentStep === 'recipients' && (
            <Card className={`${cardBgClass} border ${borderClass} p-8 shadow-xl`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className={`text-2xl ${textClass}`}>Add Recipients</h2>
                  <p className={textMutedClass}>Who should receive the gift vouchers?</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {recipients.map((recipient, index) => (
                  <div key={recipient.id} className={`p-4 rounded-lg border ${borderClass} ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-xs">
                        Recipient {index + 1}
                      </Badge>
                      {recipients.length > 1 && (
                        <button
                          onClick={() => removeRecipient(recipient.id)}
                          className={`p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 ${textMutedClass} hover:text-red-600`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className={isDark ? 'text-white' : 'text-gray-700'}>Recipient Name</Label>
                        <Input
                          placeholder="John Doe"
                          value={recipient.name}
                          onChange={(e) => updateRecipient(recipient.id, 'name', e.target.value)}
                          className={isDark ? 'bg-[#161616] border-[#3a3a3a] text-white placeholder:text-[#737373]' : 'h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className={isDark ? 'text-white' : 'text-gray-700'}>Email Address</Label>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          value={recipient.email}
                          onChange={(e) => updateRecipient(recipient.id, 'email', e.target.value)}
                          className={isDark ? 'bg-[#161616] border-[#3a3a3a] text-white placeholder:text-[#737373]' : 'h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500'}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={addRecipient}
                variant="outline"
                className={`w-full mb-6 ${isDark ? 'border-[#3a3a3a] hover:bg-[#1e1e1e]' : 'border-gray-300'}`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Recipient
              </Button>

              <Separator className={`my-6 ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200'}`} />

              <div className={`p-4 rounded-lg ${isDark ? 'bg-indigo-900/20 border border-indigo-500/30' : 'bg-indigo-50 border border-indigo-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={textMutedClass}>Total vouchers</p>
                    <p className={`text-2xl ${textClass}`}>{recipients.length} × ${selectedAmount || customAmount || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className={textMutedClass}>Total amount</p>
                    <p className={`text-3xl text-indigo-600 dark:text-indigo-400`}>${getTotalAmount()}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-3 mt-8">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  size="lg"
                  className={isDark ? 'border-[#3a3a3a]' : ''}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {/* Step 3: Customize */}
          {currentStep === 'customize' && (
            <Card className={`${cardBgClass} border ${borderClass} p-8 shadow-xl`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <h2 className={`text-2xl ${textClass}`}>Personalize Your Gift</h2>
                  <p className={textMutedClass}>Add a special touch</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className={isDark ? 'text-white' : 'text-gray-700'}>Your Name</Label>
                  <Input
                    placeholder="From: Your Name"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className={isDark ? 'bg-[#1e1e1e] border-[#3a3a3a] text-white placeholder:text-[#737373]' : 'h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500'}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={isDark ? 'text-white' : 'text-gray-700'}>Gift Theme</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {themes.map(themeOption => (
                      <button
                        key={themeOption.id}
                        onClick={() => setSelectedTheme(themeOption.id as any)}
                        className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${selectedTheme === themeOption.id
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                            : isDark ? 'border-[#2a2a2a]' : 'border-gray-200'
                          }`}
                      >
                        <div className="text-3xl mb-2">{themeOption.emoji}</div>
                        <div className={`text-sm ${textClass}`}>{themeOption.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className={isDark ? 'text-white' : 'text-gray-700'}>Personal Message (Optional)</Label>
                  <Textarea
                    placeholder="Add a heartfelt message..."
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    rows={4}
                    className={isDark ? 'bg-[#1e1e1e] border-[#3a3a3a] text-white placeholder:text-[#737373]' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}
                  />
                  <p className={`text-sm ${textMutedClass}`}>{personalMessage.length}/250 characters</p>
                </div>

                <div className="space-y-2">
                  <Label className={isDark ? 'text-white' : 'text-gray-700'}>Delivery Date (Optional)</Label>
                  <Input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className={isDark ? 'bg-[#1e1e1e] border-[#3a3a3a] text-white' : 'h-12 bg-gray-100 border-gray-300'}
                  />
                  <p className={`text-sm ${textMutedClass}`}>Leave blank to send immediately</p>
                </div>
              </div>

              <div className="flex justify-between gap-3 mt-8">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  size="lg"
                  className={isDark ? 'border-[#3a3a3a]' : ''}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Continue to Payment
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          )}

          {/* Step 4: Payment */}
          {currentStep === 'payment' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className={`${cardBgClass} border ${borderClass} p-8 shadow-xl`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h2 className={`text-2xl ${textClass}`}>Payment Details</h2>
                      <p className={textMutedClass}>Secure checkout</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className={isDark ? 'text-white' : 'text-gray-700'}>Card Number</Label>
                      <Input
                        placeholder="1234 5678 9012 3456"
                        value={paymentDetails.cardNumber}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                        className={isDark ? 'bg-[#1e1e1e] border-[#3a3a3a] text-white placeholder:text-[#737373]' : 'h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500'}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className={isDark ? 'text-white' : 'text-gray-700'}>Expiry Date</Label>
                        <Input
                          placeholder="MM/YY"
                          value={paymentDetails.expiryDate}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryDate: e.target.value })}
                          className={isDark ? 'bg-[#1e1e1e] border-[#3a3a3a] text-white placeholder:text-[#737373]' : 'h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className={isDark ? 'text-white' : 'text-gray-700'}>CVV</Label>
                        <Input
                          placeholder="123"
                          value={paymentDetails.cvv}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                          className={isDark ? 'bg-[#1e1e1e] border-[#3a3a3a] text-white placeholder:text-[#737373]' : 'h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500'}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className={isDark ? 'text-white' : 'text-gray-700'}>Billing Email</Label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={paymentDetails.billingEmail}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, billingEmail: e.target.value })}
                        className={isDark ? 'bg-[#1e1e1e] border-[#3a3a3a] text-white placeholder:text-[#737373]' : 'h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500'}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between gap-3 mt-8">
                    <Button
                      onClick={handleBack}
                      variant="outline"
                      size="lg"
                      className={isDark ? 'border-[#3a3a3a]' : ''}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Complete Purchase ${getTotalAmount()}
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Order Summary */}
              <div>
                <Card className={`${cardBgClass} border ${borderClass} p-6 shadow-xl sticky top-4`}>
                  <h3 className={`text-xl mb-4 ${textClass}`}>Order Summary</h3>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className={textMutedClass}>Voucher Amount</span>
                      <span className={textClass}>${selectedAmount || customAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={textMutedClass}>Recipients</span>
                      <span className={textClass}>{recipients.length}</span>
                    </div>
                    <Separator className={isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200'} />
                    <div className="flex justify-between">
                      <span className={`${textClass}`}>Subtotal</span>
                      <span className={textClass}>${getTotalAmount()}</span>
                    </div>
                    <Separator className={isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200'} />
                    <div className="flex justify-between items-center">
                      <span className={`text-lg ${textClass}`}>Total</span>
                      <span className="text-2xl text-green-600 dark:text-green-400">${getTotalAmount()}</span>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                        All vouchers are valid for 12 months from purchase date
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Success Screen */}
          {currentStep === 'success' && (
            <Card className={`${cardBgClass} border ${borderClass} p-12 shadow-xl text-center`}>
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mb-4">
                <Star className="w-6 h-6 text-yellow-500 animate-pulse" />
                <Zap className="w-6 h-6 text-orange-500 animate-pulse" />
                <Heart className="w-6 h-6 text-pink-500 animate-pulse" />
              </div>

              <h2 className={`text-3xl mb-4 ${textClass}`}>Gift Vouchers Sent!</h2>
              <p className={`text-lg ${textMutedClass} mb-8`}>
                {recipients.length} gift {recipients.length === 1 ? 'voucher has' : 'vouchers have'} been sent successfully
              </p>

              <div className={`max-w-md mx-auto p-6 rounded-lg ${isDark ? 'bg-[#1e1e1e] border border-[#2a2a2a]' : 'bg-gray-50 border border-gray-200'} mb-8`}>
                <div className="space-y-3">
                  {recipients.map((recipient, index) => (
                    <div key={recipient.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-left flex-1">
                        <p className={`text-sm ${textClass}`}>{recipient.name}</p>
                        <p className={`text-xs ${textMutedClass}`}>{recipient.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleStartOver}
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Send More Vouchers
                </Button>
                <Button
                  onClick={() => window.close()}
                  variant="outline"
                  size="lg"
                  className={isDark ? 'border-[#3a3a3a]' : ''}
                >
                  Close Window
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default GiftVouchers;
