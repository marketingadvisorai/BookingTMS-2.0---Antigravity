import React, { useState } from 'react';
import DataSyncServiceWithEvents, { GiftVoucher, VoucherRecipient, DataSyncEvents } from '../../services/DataSyncService';
import { X, Gift, Mail, Plus, Minus, CreditCard, Check, Sparkles, Calendar, ChevronRight, ChevronLeft, ShoppingCart, Heart, Star, Zap, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { WidgetContainer } from './WidgetContainer';

interface GiftVoucherWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  primaryColor?: string;
  theme?: 'light' | 'dark';
}

interface Recipient {
  id: string;
  name: string;
  email: string;
}

export default function GiftVoucherWidget({ 
  isOpen, 
  onClose, 
  primaryColor = '#4f46e5',
  theme: initialTheme = 'light' 
}: GiftVoucherWidgetProps) {
  const [widgetTheme, setWidgetTheme] = useState<'light' | 'dark'>(initialTheme);
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
        alert('Please select or enter an amount');
        return;
      }
      setCurrentStep('recipients');
    } else if (currentStep === 'recipients') {
      const hasEmptyFields = recipients.some(r => !r.name.trim() || !r.email.trim());
      if (hasEmptyFields) {
        alert('Please fill in all recipient details');
        return;
      }
      setCurrentStep('customize');
    } else if (currentStep === 'customize') {
      if (!senderName.trim()) {
        alert('Please enter your name');
        return;
      }
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv || !paymentDetails.billingEmail) {
        alert('Please fill in all payment details');
        return;
      }

      // 🎯 SAVE GIFT VOUCHER TO LOCALSTORAGE - Real-time sync
      try {
        // Prepare voucher recipient data
        const voucherRecipients: VoucherRecipient[] = recipients.map(recipient => ({
          name: recipient.name,
          email: recipient.email,
          status: 'sent' as const
        }));

        // Create voucher data
        const voucherData = {
          amount: selectedAmount || parseInt(customAmount),
          recipients: voucherRecipients,
          senderName: senderName,
          message: personalMessage,
          theme: selectedTheme as 'birthday' | 'holiday' | 'celebration' | 'general',
          deliveryDate: deliveryDate
        };

        // Save voucher using DataSyncService
        const savedVoucher = DataSyncServiceWithEvents.saveGiftVoucher(voucherData);

        console.log('✅ Gift voucher saved with real-time sync:', savedVoucher.id);
        console.log('📊 Total vouchers:', DataSyncServiceWithEvents.getAllGiftVouchers().length);

        // Show success after simulated payment processing
        setTimeout(() => {
          setCurrentStep('success');
        }, 1500);

      } catch (error) {
        console.error('❌ Error saving gift voucher:', error);
        alert('Error saving gift voucher. Please try again.');
        return;
      }
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

  if (!isOpen) return null;

  // Dark mode classes
  const isDark = widgetTheme === 'dark';
  const bgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const inputClass = isDark 
    ? 'bg-[#1e1e1e] border-[#3a3a3a] text-white placeholder:text-[#737373]' 
    : 'h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500';

  return (
    <WidgetContainer>
      <div className={`fixed inset-0 z-50 ${bgClass} overflow-y-auto`}>
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header with close button */}
            <div className={`${cardBgClass} border ${borderClass} rounded-xl shadow-lg p-4 sm:p-6 mb-6 sticky top-0 z-10 backdrop-blur-sm ${isDark ? 'bg-[#161616]/95' : 'bg-white/95'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                    <Gift className="w-8 h-8" style={{ color: primaryColor }} />
                    <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                  </div>
                  <div>
                    <h1 className={`text-2xl ${textClass}`}>Gift Vouchers</h1>
                    <p className={`text-sm ${textMutedClass}`}>Give unforgettable experiences</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'hover:bg-[#1e1e1e] text-[#737373] hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
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
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            isCompleted 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : isActive 
                              ? `border-2 text-white` 
                              : isDark ? 'bg-[#1e1e1e] border-[#3a3a3a] text-[#737373]' : 'bg-gray-100 border-gray-300 text-gray-400'
                          }`}
                          style={isActive ? { backgroundColor: primaryColor, borderColor: primaryColor } : undefined}
                          >
                            {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                          </div>
                          <span className={`text-xs mt-2 capitalize ${
                            isActive 
                              ? isDark ? 'text-white' : 'text-gray-900'
                              : textMutedClass
                          }`}>
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
              <div className={`${cardBgClass} border ${borderClass} rounded-xl p-6 sm:p-8 shadow-xl`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                    <ShoppingCart className="w-6 h-6" style={{ color: primaryColor }} />
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
                      className={`p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                        selectedAmount === amount
                          ? `border-2`
                          : isDark ? 'border-[#2a2a2a] hover:border-[#3a3a3a]' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={selectedAmount === amount ? { 
                        borderColor: primaryColor, 
                        backgroundColor: isDark ? `${primaryColor}20` : `${primaryColor}10` 
                      } : undefined}
                    >
                      <div className={`text-3xl mb-1 ${textClass}`}>
                        ${amount}
                      </div>
                      <div className={`text-sm ${textMutedClass}`}>
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
                      className={`pl-8 text-xl h-14 ${inputClass}`}
                    />
                  </div>
                  <p className={`text-sm ${textMutedClass}`}>Minimum $10, Maximum $1000</p>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <Button
                    onClick={handleNext}
                    size="lg"
                    style={{ backgroundColor: primaryColor }}
                    className="text-white hover:opacity-90"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Recipients */}
            {currentStep === 'recipients' && (
              <div className={`${cardBgClass} border ${borderClass} rounded-xl p-6 sm:p-8 shadow-xl`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className={`text-2xl ${textClass}`}>Add Recipients</h2>
                    <p className={textMutedClass}>Who should receive the vouchers?</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
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
                            className={inputClass}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className={isDark ? 'text-white' : 'text-gray-700'}>Email Address</Label>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            value={recipient.email}
                            onChange={(e) => updateRecipient(recipient.id, 'email', e.target.value)}
                            className={inputClass}
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

                <div className={`p-4 rounded-lg ${isDark ? 'bg-[#4f46e5]/10 border border-[#4f46e5]/30' : 'bg-indigo-50 border border-indigo-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={textMutedClass}>Total vouchers</p>
                      <p className={`text-2xl ${textClass}`}>{recipients.length} × ${selectedAmount || customAmount || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className={textMutedClass}>Total amount</p>
                      <p className="text-3xl" style={{ color: primaryColor }}>${getTotalAmount()}</p>
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
                    style={{ backgroundColor: primaryColor }}
                    className="text-white hover:opacity-90"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Customize */}
            {currentStep === 'customize' && (
              <div className={`${cardBgClass} border ${borderClass} rounded-xl p-6 sm:p-8 shadow-xl`}>
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
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className={isDark ? 'text-white' : 'text-gray-700'}>Gift Theme</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {themes.map(themeOption => (
                        <button
                          key={themeOption.id}
                          onClick={() => setSelectedTheme(themeOption.id as any)}
                          className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                            selectedTheme === themeOption.id
                              ? 'border-2'
                              : isDark ? 'border-[#2a2a2a]' : 'border-gray-200'
                          }`}
                          style={selectedTheme === themeOption.id ? {
                            borderColor: primaryColor,
                            backgroundColor: isDark ? `${primaryColor}20` : `${primaryColor}10`
                          } : undefined}
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
                      maxLength={250}
                      className={inputClass}
                    />
                    <p className={`text-sm ${textMutedClass}`}>{personalMessage.length}/250 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label className={isDark ? 'text-white' : 'text-gray-700'}>Delivery Date (Optional)</Label>
                    <Input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className={inputClass}
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
                    style={{ backgroundColor: primaryColor }}
                    className="text-white hover:opacity-90"
                  >
                    Continue to Payment
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Payment */}
            {currentStep === 'payment' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className={`${cardBgClass} border ${borderClass} rounded-xl p-6 sm:p-8 shadow-xl`}>
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
                          onChange={(e) => setPaymentDetails({...paymentDetails, cardNumber: e.target.value})}
                          className={inputClass}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className={isDark ? 'text-white' : 'text-gray-700'}>Expiry Date</Label>
                          <Input
                            placeholder="MM/YY"
                            value={paymentDetails.expiryDate}
                            onChange={(e) => setPaymentDetails({...paymentDetails, expiryDate: e.target.value})}
                            className={inputClass}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className={isDark ? 'text-white' : 'text-gray-700'}>CVV</Label>
                          <Input
                            placeholder="123"
                            value={paymentDetails.cvv}
                            onChange={(e) => setPaymentDetails({...paymentDetails, cvv: e.target.value})}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className={isDark ? 'text-white' : 'text-gray-700'}>Billing Email</Label>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={paymentDetails.billingEmail}
                          onChange={(e) => setPaymentDetails({...paymentDetails, billingEmail: e.target.value})}
                          className={inputClass}
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
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <div className={`${cardBgClass} border ${borderClass} rounded-xl p-6 shadow-xl sticky top-24`}>
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
                        <span className={textClass}>Subtotal</span>
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
                          All vouchers valid for 12 months
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Success Screen */}
            {currentStep === 'success' && (
              <div className={`${cardBgClass} border ${borderClass} rounded-xl p-12 shadow-xl text-center`}>
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
                    {recipients.map((recipient) => (
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
                    style={{ backgroundColor: primaryColor }}
                    className="text-white hover:opacity-90"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Send More Vouchers
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    size="lg"
                    className={isDark ? 'border-[#3a3a3a]' : ''}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </WidgetContainer>
  );
}
