/**
 * Embed Pro 2.0 - Widget Party Size Component
 * @module embed-pro/widget-components/WidgetPartySize
 * 
 * Party size selector with adult/child counters.
 */

import React from 'react';
import { Minus, Plus, Users } from 'lucide-react';
import type { WidgetActivity, WidgetStyle } from '../types/widget.types';

// =====================================================
// PROPS INTERFACE
// =====================================================

interface WidgetPartySizeProps {
  activity: WidgetActivity;
  partySize: number;
  childCount: number;
  onPartySizeChange: (size: number) => void;
  onChildCountChange: (count: number) => void;
  style: WidgetStyle;
}

// =====================================================
// COUNTER COMPONENT
// =====================================================

interface CounterProps {
  label: string;
  sublabel?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  price?: number;
  currency?: string;
  primaryColor: string;
}

const Counter: React.FC<CounterProps> = ({
  label,
  sublabel,
  value,
  min,
  max,
  onChange,
  price,
  currency = 'USD',
  primaryColor,
}) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex items-center justify-between py-4 border-b border-white/30 last:border-b-0">
      <div>
        <p className="font-semibold text-gray-800">{label}</p>
        {sublabel && <p className="text-xs text-gray-500">{sublabel}</p>}
        {price !== undefined && (
          <p className="text-sm font-semibold mt-0.5" style={{ color: primaryColor }}>
            {formatPrice(price)} each
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {/* Decrease Button - Liquid Glass */}
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-10 h-10 rounded-xl flex items-center justify-center 
                     bg-white/60 backdrop-blur-sm border border-white/80
                     shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_4px_rgba(255,255,255,0.6)]
                     hover:bg-white/80 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]
                     disabled:opacity-30 disabled:cursor-not-allowed 
                     transition-all duration-200 active:scale-95"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="w-4 h-4 text-gray-600" />
        </button>
        
        {/* Value Display */}
        <span className="w-10 text-center font-bold text-xl text-gray-800">{value}</span>
        
        {/* Increase Button - Liquid Glass Primary */}
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-10 h-10 rounded-xl flex items-center justify-center 
                     shadow-[0_4px_12px_rgba(0,0,0,0.15)]
                     hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)]
                     disabled:opacity-30 disabled:cursor-not-allowed 
                     transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ 
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
            color: 'white' 
          }}
          aria-label={`Increase ${label}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export const WidgetPartySize: React.FC<WidgetPartySizeProps> = ({
  activity,
  partySize,
  childCount,
  onPartySizeChange,
  onChildCountChange,
  style,
}) => {
  const { minPlayers, maxPlayers, price, childPrice, currency } = activity;
  const hasChildPricing = childPrice !== null && childPrice !== undefined;
  
  // Calculate total adults (partySize includes children if no child pricing)
  const adultCount = hasChildPricing ? partySize : partySize;
  const totalParty = hasChildPricing ? partySize + childCount : partySize;

  // Calculate total price
  const totalPrice = hasChildPricing
    ? (adultCount * price) + (childCount * (childPrice || 0))
    : partySize * price;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <div 
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ 
            background: `linear-gradient(135deg, ${style.primaryColor}20 0%, ${style.primaryColor}10 100%)` 
          }}
        >
          <Users className="w-4 h-4" style={{ color: style.primaryColor }} />
        </div>
        <h3 className="font-semibold text-gray-800">Select Guests</h3>
        <span 
          className="text-xs px-2 py-0.5 rounded-full backdrop-blur-sm"
          style={{ 
            background: `${style.primaryColor}15`,
            color: style.primaryColor 
          }}
        >
          {minPlayers}-{maxPlayers}
        </span>
      </div>

      {/* Counter Container - Liquid Glass */}
      <div className="rounded-2xl p-4 bg-white/50 backdrop-blur-sm border border-white/60
                      shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_2px_8px_rgba(255,255,255,0.4)]">
        {/* Adults Counter */}
        <Counter
          label={hasChildPricing ? 'Adults' : 'Players'}
          sublabel={hasChildPricing ? 'Ages 13+' : undefined}
          value={partySize}
          min={minPlayers}
          max={hasChildPricing ? maxPlayers - childCount : maxPlayers}
          onChange={onPartySizeChange}
          price={price}
          currency={currency}
          primaryColor={style.primaryColor}
        />

        {/* Children Counter (if child pricing exists) */}
        {hasChildPricing && (
          <Counter
            label="Children"
            sublabel="Ages 4-12"
            value={childCount}
            min={0}
            max={maxPlayers - partySize}
            onChange={onChildCountChange}
            price={childPrice || 0}
            currency={currency}
            primaryColor={style.primaryColor}
          />
        )}
      </div>

      {/* Total Summary - Liquid Glass Card */}
      <div 
        className="mt-4 p-4 rounded-2xl relative overflow-hidden
                   backdrop-blur-md border
                   shadow-[0_4px_20px_rgba(0,0,0,0.1),inset_0_2px_12px_rgba(255,255,255,0.3)]"
        style={{ 
          background: `linear-gradient(135deg, ${style.primaryColor}15 0%, ${style.primaryColor}08 100%)`,
          borderColor: `${style.primaryColor}40`
        }}
      >
        {/* Decorative shine */}
        <div 
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20"
          style={{ background: `radial-gradient(circle, ${style.primaryColor} 0%, transparent 70%)` }}
        />
        
        <div className="flex items-center justify-between relative">
          <div>
            <p className="text-sm text-gray-600 font-medium">
              Total for {totalParty} {totalParty === 1 ? 'guest' : 'guests'}
            </p>
            <p className="text-3xl font-bold mt-1" style={{ color: style.primaryColor }}>
              {formatPrice(totalPrice)}
            </p>
          </div>
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: `${style.primaryColor}15` }}
          >
            <Users className="w-7 h-7" style={{ color: style.primaryColor }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetPartySize;
