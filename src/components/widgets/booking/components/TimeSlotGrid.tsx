import React from 'react';
import { X, Users, RefreshCw } from 'lucide-react';
import { Card } from '../../../ui/card';
import { TimeSlot } from '../hooks/useAvailability';

interface TimeSlotGridProps {
    timeSlots: TimeSlot[];
    selectedDate: number | null;
    currentMonth: number;
    currentYear: number;
    timezoneLabel: string;
    selectedTime: string | null;
    onTimeSelect: (time: string) => void;
    primaryColor: string;
    slotDurationMinutes: number;
    loading?: boolean;
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
    timeSlots,
    selectedDate,
    currentMonth,
    currentYear,
    timezoneLabel,
    selectedTime,
    onTimeSelect,
    primaryColor,
    slotDurationMinutes,
    loading
}) => {
    if (!selectedDate) return null;

    return (
        <Card className="p-6 sm:p-8 bg-white shadow-sm border border-gray-200 rounded-2xl">
            <h2 className="text-lg sm:text-xl text-gray-900 mb-1 sm:mb-2">
                Available Times - {new Date(currentYear, currentMonth, selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </h2>
            <div className="text-xs text-gray-500 mb-4">Timezone: {timezoneLabel}</div>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="p-4 sm:p-5 rounded-xl border-2 border-gray-100 h-[100px] animate-pulse bg-gray-50" />
                    ))}
                </div>
            ) : timeSlots.length === 0 ? (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                        <X className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Available Times</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                        This date is not available for booking. It may be blocked by the admin or outside operating hours. Please select another date.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {timeSlots.map((slot) => (
                        <button
                            key={slot.time}
                            onClick={() => slot.available && onTimeSelect(slot.time)}
                            disabled={!slot.available}
                            className={`
                p-4 sm:p-5 rounded-xl border-2 text-center transition-all
                ${selectedTime === slot.time
                                    ? 'shadow-lg transform scale-105'
                                    : slot.available
                                        ? 'border-gray-200 hover:border-gray-300 hover:shadow-md hover:scale-102'
                                        : 'border-gray-100 cursor-not-allowed opacity-50'
                                }
              `}
                            style={{
                                backgroundColor: selectedTime === slot.time ? primaryColor : undefined,
                                borderColor: selectedTime === slot.time ? primaryColor : undefined,
                            }}
                        >
                            <div className={`text-sm sm:text-base mb-2 ${selectedTime === slot.time ? 'text-white' : slot.available ? 'text-gray-900' : 'text-gray-400'
                                }`}>
                                {slot.time}
                            </div>
                            <div className={`text-xs flex items-center justify-center gap-1 ${selectedTime === slot.time ? 'text-white/90' : slot.available ? 'text-green-600' : 'text-red-500'
                                }`}>
                                {slot.available ? (
                                    <>
                                        <Users className="w-3 h-3" />
                                        <span>{slot.spots} spots</span>
                                    </>
                                ) : (
                                    <span>Sold out</span>
                                )}
                            </div>
                            <div className={`mt-2 text-[11px] ${selectedTime === slot.time ? 'text-white/80' : 'text-gray-500'}`}>
                                Duration: {slotDurationMinutes} min
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </Card>
    );
};
