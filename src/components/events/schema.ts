import { z } from 'zod';

export const basicInfoSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    category: z.string().min(1, 'Category is required'),
    tagline: z.string().optional(),
    eventType: z.enum(['public', 'private']),
    activityType: z.enum(['physical', 'virtual', 'hybrid']),
    organizationId: z.string().optional(),
    venueId: z.string().optional(),
    timezone: z.string().min(1, "Time zone is required"),
});

export const capacityPricingSchema = z.object({
    minAdults: z.number().min(1, 'Minimum adults must be at least 1'),
    maxAdults: z.number().min(1, 'Maximum adults must be at least 1'),
    minChildren: z.number().min(0),
    maxChildren: z.number().min(0),
    adultPrice: z.number().min(0, 'Price must be non-negative'),
    childPrice: z.number().min(0, 'Price must be non-negative'),
    groupDiscount: z.boolean(),
    dynamicPricing: z.boolean(),
    peakPricing: z.object({
        enabled: z.boolean(),
        weekdayPeakPrice: z.number(),
        weekendPeakPrice: z.number(),
        peakStartTime: z.string(),
        peakEndTime: z.string(),
    }),
    groupTiers: z.array(z.object({
        minSize: z.number(),
        maxSize: z.number(),
        discountPercent: z.number(),
    })),
    customCapacityFields: z.array(z.object({
        id: z.string(),
        name: z.string(),
        min: z.number(),
        max: z.number(),
        price: z.number(),
    })),
}).refine((data) => data.maxAdults >= data.minAdults, {
    message: "Maximum adults must be greater than or equal to minimum adults",
    path: ["maxAdults"],
});

export const activityDetailsSchema = z.object({
    duration: z.number().min(1, 'Duration must be greater than 0'),
    difficulty: z.number().min(1).max(5),
    minAge: z.number().min(0),
    language: z.array(z.string()),
    successRate: z.number().min(0).max(100),
    activityDetails: z.string(),
    additionalInformation: z.string(),
    faqs: z.array(z.object({
        id: z.string(),
        question: z.string(),
        answer: z.string(),
    })),
    cancellationPolicies: z.array(z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
    })),
    accessibility: z.object({
        strollerAccessible: z.boolean(),
        wheelchairAccessible: z.boolean(),
    }),
    location: z.string(),
});

export const mediaSchema = z.object({
    coverImage: z.string().min(1, 'Cover image is required'),
    galleryImages: z.array(z.string()),
    videos: z.array(z.string()),
});

export const scheduleSchema = z.object({
    operatingDays: z.array(z.string()).min(1, 'Select at least one operating day'),
    startTime: z.string(),
    endTime: z.string(),
    slotInterval: z.number().min(1),
    advanceBooking: z.number().min(0),
    customHoursEnabled: z.boolean(),
    customHours: z.record(z.string(), z.object({
        enabled: z.boolean(),
        startTime: z.string(),
        endTime: z.string(),
    })),
    customDates: z.array(z.object({
        id: z.string(),
        date: z.string(),
        startTime: z.string(),
        endTime: z.string(),
    })),
    blockedDates: z.array(z.union([
        z.string(),
        z.object({
            date: z.string(),
            startTime: z.string(),
            endTime: z.string(),
            reason: z.string().optional(),
        })
    ])),
}).refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
});

export const paymentSchema = z.object({
    stripeProductId: z.string().optional(),
    stripePriceId: z.string().optional(),
    checkoutEnabled: z.boolean().optional(),
});

export const widgetSchema = z.object({
    selectedWidget: z.string(),
    requiresWaiver: z.boolean(),
    selectedWaiver: z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
    }).nullable(),
    cancellationWindow: z.number(),
    specialInstructions: z.string(),
    slug: z.string().optional(),
});

export const activityDataSchema = z.intersection(
    basicInfoSchema,
    z.intersection(
        capacityPricingSchema,
        z.intersection(
            activityDetailsSchema,
            z.intersection(
                mediaSchema,
                z.intersection(
                    scheduleSchema,
                    z.intersection(
                        paymentSchema,
                        widgetSchema
                    )
                )
            )
        )
    )
);

export type ActivityDataSchema = z.infer<typeof activityDataSchema>;
