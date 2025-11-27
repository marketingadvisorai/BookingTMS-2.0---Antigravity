/**
 * Embed Pro 2.0 - Group Booking Cart Component
 * @module embed-pro/widget-components/WidgetGroupCart
 * 
 * Displays cart for group booking with multiple activities.
 * Shows items, totals, and checkout button.
 */

import React from 'react';
import { ShoppingCart, Trash2, Calendar, Clock, Users, ChevronRight, Package } from 'lucide-react';
import type { GroupBookingCart, GroupBookingCartItem } from '../types/groupbooking.types';
import type { WidgetStyle } from '../types/widget.types';

// =====================================================
// PROPS INTERFACE
// =====================================================

interface WidgetGroupCartProps {
  /** Cart data */
  cart: GroupBookingCart;
  /** Remove item from cart */
  onRemoveItem: (index: number) => void;
  /** Edit item */
  onEditItem: (index: number) => void;
  /** Proceed to checkout */
  onCheckout: () => void;
  /** Continue shopping */
  onContinue?: () => void;
  /** Widget style */
  style: WidgetStyle;
  /** Format amount */
  formatAmount: (cents: number) => string;
  /** Format duration */
  formatDuration: (minutes: number) => string;
  /** Whether cart is valid for checkout */
  isValid: boolean;
}

// =====================================================
// CART ITEM COMPONENT
// =====================================================

const CartItem: React.FC<{
  item: GroupBookingCartItem;
  index: number;
  onRemove: () => void;
  onEdit: () => void;
  formatAmount: (cents: number) => string;
  style: WidgetStyle;
}> = ({ item, index, onRemove, onEdit, formatAmount, style }) => {
  const itemTotal = item.partySize * item.activity.pricePerPerson;
  const isComplete = item.date && item.timeSlot;

  return (
    <div className="flex gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
      {/* Image/Icon */}
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
        {item.activity.imageUrl ? (
          <img 
            src={item.activity.imageUrl} 
            alt={item.activity.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-6 h-6 text-gray-400" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-800 text-sm truncate">
          {item.activity.name}
        </h4>
        
        <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {item.partySize}
          </span>
          {item.date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {item.timeSlot && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {item.timeSlot.time}
            </span>
          )}
        </div>

        {/* Incomplete Warning */}
        {!isComplete && (
          <button
            onClick={onEdit}
            className="mt-1 text-xs font-medium flex items-center gap-1"
            style={{ color: style.primaryColor }}
          >
            Select date & time
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Price & Actions */}
      <div className="flex flex-col items-end justify-between">
        <span className="font-bold text-sm text-gray-800">
          {formatAmount(itemTotal)}
        </span>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          aria-label={`Remove ${item.activity.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export const WidgetGroupCart: React.FC<WidgetGroupCartProps> = ({
  cart,
  onRemoveItem,
  onEditItem,
  onCheckout,
  onContinue,
  style,
  formatAmount,
  formatDuration,
  isValid,
}) => {
  const totalDuration = cart.items.reduce((sum, item) => sum + item.activity.duration, 0);
  const hasDiscount = cart.promoDiscount > 0 || cart.giftCardAmount > 0;

  if (cart.items.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
          <ShoppingCart className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-semibold text-gray-800 mb-1">Your cart is empty</h3>
        <p className="text-sm text-gray-500 mb-4">
          Add activities to create your group booking
        </p>
        {onContinue && (
          <button
            onClick={onContinue}
            className="px-6 py-2.5 rounded-xl font-medium text-white"
            style={{ backgroundColor: style.primaryColor }}
          >
            Browse Activities
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" style={{ color: style.primaryColor }} />
          Your Group Booking
          <span className="text-sm font-normal text-gray-500">
            ({cart.items.length} {cart.items.length === 1 ? 'activity' : 'activities'})
          </span>
        </h3>
      </div>

      {/* Cart Items */}
      <div className="space-y-2">
        {cart.items.map((item, index) => (
          <CartItem
            key={item.id}
            item={item}
            index={index}
            onRemove={() => onRemoveItem(index)}
            onEdit={() => onEditItem(index)}
            formatAmount={formatAmount}
            style={style}
          />
        ))}
      </div>

      {/* Duration Summary */}
      <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-blue-50 text-sm">
        <span className="text-blue-700">Total Experience Time</span>
        <span className="font-semibold text-blue-800">
          {formatDuration(totalDuration)}
        </span>
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 pt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-800">{formatAmount(cart.subtotal)}</span>
        </div>

        {cart.promoDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Promo Discount</span>
            <span className="font-medium text-green-600">-{formatAmount(cart.promoDiscount)}</span>
          </div>
        )}

        {cart.giftCardAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-purple-600">Gift Card</span>
            <span className="font-medium text-purple-600">-{formatAmount(cart.giftCardAmount)}</span>
          </div>
        )}

        <div className="flex justify-between pt-2 border-t border-gray-100">
          <span className="font-bold text-gray-800">Total</span>
          <span className="font-bold text-lg" style={{ color: style.primaryColor }}>
            {formatAmount(cart.total)}
          </span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        disabled={!isValid}
        className="w-full py-3.5 rounded-xl font-semibold text-white transition-all
                 hover:shadow-lg active:scale-[0.98]
                 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: style.primaryColor }}
      >
        Proceed to Checkout
      </button>

      {/* Continue Shopping */}
      {onContinue && (
        <button
          onClick={onContinue}
          className="w-full py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
        >
          + Add Another Activity
        </button>
      )}
    </div>
  );
};

export default WidgetGroupCart;
