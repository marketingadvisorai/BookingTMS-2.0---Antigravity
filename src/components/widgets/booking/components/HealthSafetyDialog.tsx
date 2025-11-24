import React from 'react';
import { ShieldCheck, Users, Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../ui/dialog';

interface HealthSafetyDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export const HealthSafetyDialog: React.FC<HealthSafetyDialogProps> = ({
    isOpen,
    onOpenChange
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Health & Safety</DialogTitle>
                </DialogHeader>
                <div className="p-4">
                    <ul className="space-y-4">
                        <li className="flex items-start">
                            <ShieldCheck className="w-6 h-6 text-green-500 mr-4" />
                            <div>
                                <h4 className="font-semibold">Enhanced Cleaning</h4>
                                <p className="text-sm text-gray-500">We've increased the frequency of cleaning and disinfecting our facilities, especially high-touch surfaces.</p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <Users className="w-6 h-6 text-green-500 mr-4" />
                            <div>
                                <h4 className="font-semibold">Private Experiences</h4>
                                <p className="text-sm text-gray-500">All our escape room games are private, meaning you'll only be playing with the people you came with.</p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <Heart className="w-6 h-6 text-green-500 mr-4" />
                            <div>
                                <h4 className="font-semibold">Well-being</h4>
                                <p className="text-sm text-gray-500">If you're feeling unwell, please stay home. We're happy to reschedule your booking for a future date.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </DialogContent>
        </Dialog>
    );
};
