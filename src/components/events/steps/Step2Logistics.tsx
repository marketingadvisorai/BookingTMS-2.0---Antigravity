import React from 'react';
import Step2CapacityPricing from './Step2CapacityPricing';
import Step5Schedule from './Step5Schedule';
import { StepProps } from '../types';

export default function Step2Logistics(props: StepProps) {
    return (
        <div className="space-y-8">
            <Step2CapacityPricing {...props} />
            <Step5Schedule {...props} />
        </div>
    );
}
