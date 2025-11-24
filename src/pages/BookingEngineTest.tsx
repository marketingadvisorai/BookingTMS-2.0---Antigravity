import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CalendarWidget } from '../components/widgets/CalendarWidget';

export default function BookingEngineTest() {
    const dummyConfig = {
        showSecuredBadge: true,
        showHealthSafety: true,
        widgetTitle: 'Test Calendar Widget',
        games: [
            {
                id: '1',
                name: 'Test Game',
                image: 'https://via.placeholder.com/150',
                price: 25,
                duration: 60,
                description: 'A test game',
                stripe_price_id: 'price_test_123',
                gallery: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150'],
                whatToExpect: ['Fun', 'Puzzles'],
                difficulty: 3,
                players: '2-6',
                gameType: 'Adventure',
                rating: 4.8,
                reviewCount: 120,
                ageRecommendation: '10+',
                longDescription: 'This is a detailed description of the test game.',
                schedule: {
                    operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                    startTime: '09:00',
                    endTime: '23:00',
                    slotInterval: 60,
                    duration: 60,
                    advanceBooking: 30
                },
                blockedDates: [],
                customDates: []
            }
        ],
        venueId: null // Explicitly null to trigger template mode
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Booking Engine Verification</h1>

            <div className="border p-4 rounded-lg bg-white shadow">
                <h2 className="text-xl font-semibold mb-4">Calendar Widget Test</h2>
                <CalendarWidget config={dummyConfig} primaryColor="#2563eb" />
            </div>
        </div>
    );
}
