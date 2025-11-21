import React from 'react';
import Step1BasicInfo from './Step1BasicInfo';
import Step3GameDetails from './Step3GameDetails';
import { StepProps } from '../types';

export default function Step1Basics(props: StepProps) {
    return (
        <div className="space-y-8">
            <Step1BasicInfo {...props} />
            <Step3GameDetails {...props} />
        </div>
    );
}
