/**
 * Terminology Hook
 * Provides dynamic labels for UI elements based on the venue type.
 * Implements the "Polymorphic Strategy" for multi-niche support.
 */

import { useMemo } from 'react';

export type Terminology = {
    singular: string;
    plural: string;
    actionAdd: string;
    actionEdit: string;
    actionDelete: string;
    labelName: string;
    labelDescription: string;
    labelDuration: string;
    labelPrice: string;
};

export function useTerminology(venueType: string = 'escape_room'): Terminology {
    return useMemo(() => {
        const type = venueType.toLowerCase();

        if (type.includes('salon') || type.includes('spa') || type.includes('barber')) {
            return {
                singular: 'Service',
                plural: 'Services',
                actionAdd: 'Add Service',
                actionEdit: 'Edit Service',
                actionDelete: 'Delete Service',
                labelName: 'Service Name',
                labelDescription: 'Service Description',
                labelDuration: 'Duration',
                labelPrice: 'Price',
            };
        }

        if (type.includes('consultant') || type.includes('coaching') || type.includes('therapy')) {
            return {
                singular: 'Session',
                plural: 'Sessions',
                actionAdd: 'Add Session',
                actionEdit: 'Edit Session',
                actionDelete: 'Delete Session',
                labelName: 'Session Name',
                labelDescription: 'Session Details',
                labelDuration: 'Session Length',
                labelPrice: 'Fee',
            };
        }

        if (type.includes('class') || type.includes('workshop') || type.includes('course')) {
            return {
                singular: 'Class',
                plural: 'Classes',
                actionAdd: 'Add Class',
                actionEdit: 'Edit Class',
                actionDelete: 'Delete Class',
                labelName: 'Class Name',
                labelDescription: 'Class Description',
                labelDuration: 'Class Duration',
                labelPrice: 'Class Fee',
            };
        }

        // Default to "Activity" for Escape Rooms and general use
        return {
            singular: 'Activity',
            plural: 'Activities',
            actionAdd: 'Add Activity',
            actionEdit: 'Edit Activity',
            actionDelete: 'Delete Activity',
            labelName: 'Activity Name',
            labelDescription: 'Description',
            labelDuration: 'Duration',
            labelPrice: 'Price',
        };
    }, [venueType]);
}
