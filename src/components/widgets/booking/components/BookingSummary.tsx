import React from 'react';
import { ShoppingCart, Users, Award, Calendar, Clock, Info } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { Separator } from '../../../ui/separator';

interface BookingSummaryProps {
    selectedActivityData: any;
    selectedDate: number | null;
    selectedTime: string | null;
    partySize: number;
    totalPrice: number;
    primaryColor: string;
    onPartySizeChange: (size: number) => void;
    onShowDetails: () => void;
    onContinue: () => void;
    canContinue: boolean;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
    selectedActivityData,
    selectedDate,
    selectedTime,
    partySize,
    totalPrice,
    primaryColor,
    onPartySizeChange,
    onShowDetails,
    onContinue,
    canContinue
}) => {
    return (
        <Card className="p-6 sm:p-8 bg-gradient-to-br from-white to-gray-50 shadow-2xl border-2 rounded-2xl max-h-[calc(100vh-2rem)] overflow-y-auto" style={{ borderColor: `${primaryColor}20` }}>
            <div className="space-y-6 pb-20 sm:pb-6">
                <div className="flex items-center gap-3 pb-4 border-b-2" style={{ borderColor: `${primaryColor}20` }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                        <ShoppingCart className="w-5 h-5" style={{ color: primaryColor }} />
                    </div>
                    <h2 className="text-xl text-gray-900">Your Booking</h2>
                </div>

                {/* Party Size */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <label className="text-sm text-gray-700 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" style={{ color: primaryColor }} />
                        <span className="">Number of Participants</span>
                    </label>
                    <div className="flex items-center justify-between gap-4 mt-3">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onPartySizeChange(Math.max(2, partySize - 1))}
                            className="h-12 w-12 rounded-full hover:scale-110 transition-transform"
                            style={{ borderColor: primaryColor, color: primaryColor }}
                        >
                            -
                        </Button>
                        <div className="text-center">
                            <div className="text-3xl text-gray-900" style={{ color: primaryColor }}>{partySize}</div>
                            <div className="text-xs text-gray-500">participants</div>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onPartySizeChange(Math.min(10, partySize + 1))}
                            className="h-12 w-12 rounded-full hover:scale-110 transition-transform"
                            style={{ borderColor: primaryColor, color: primaryColor }}
                        >
                            +
                        </Button>
                    </div>
                </div>

                {/* Summary Details */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 flex items-center gap-2">
                                <Award className="w-4 h-4" style={{ color: primaryColor }} />
                                Activity
                            </span>
                            <span className="text-gray-900 text-right truncate max-w-[55%]">{selectedActivityData.name}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 flex items-center gap-2">
                                <Calendar className="w-4 h-4" style={{ color: primaryColor }} />
                                Date
                            </span>
                            <span className="text-gray-900">Nov {selectedDate}, 2025</span>
                        </div>
                        {selectedTime && (
                            <>
                                <Separator />
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 flex items-center gap-2">
                                        <Clock className="w-4 h-4" style={{ color: primaryColor }} />
                                        Time
                                    </span>
                                    <span className="text-gray-900">{selectedTime}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Price */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 border-2" style={{ borderColor: `${primaryColor}30` }}>
                    <div className="flex justify-between mb-3 text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-900">${selectedActivityData.price} × {partySize}</span>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex justify-between items-center">
                        <span className="text-base text-gray-900">Total</span>
                        <div className="text-right">
                            <div className="text-3xl" style={{ color: primaryColor }}>
                                ${totalPrice}
                            </div>
                            <div className="text-xs text-gray-500">USD</div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Button
                        onClick={onShowDetails}
                        variant="outline"
                        className="w-full h-12 text-base border-2 hover:bg-gray-50"
                        style={{ borderColor: `${primaryColor}30`, color: primaryColor }}
                    >
                        <Info className="w-4 h-4 mr-2" />
                        See Full Details
                    </Button>
                    <Button
                        onClick={onContinue}
                        disabled={!canContinue}
                        className="w-full text-white h-14 text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all relative overflow-hidden group"
                        style={{
                            backgroundColor: canContinue ? primaryColor : undefined,
                            opacity: canContinue ? 1 : 0.5
                        }}
                    >
                        <div className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <ShoppingCart className="w-5 h-5 mr-2 relative z-10" />
                        <span className="relative z-10">
                            {selectedTime ? 'Continue to Cart' : 'Select Time to Continue'}
                        </span>
                    </Button>
                    {!selectedTime && (
                        <p className="text-xs text-center text-gray-500 mt-2">
                            Please select a time slot to continue
                        </p>
                    )}
                </div>
            </div>
        </Card>
    );
};
