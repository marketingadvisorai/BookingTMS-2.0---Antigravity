import React from 'react';
import { Lock, CreditCard, ShieldCheck } from 'lucide-react';
import { Button } from '../../../ui/button';

interface PaymentFormProps {
    totalPrice: number;
    primaryColor: string;
    onSubmit: () => Promise<void>;
    isProcessing: boolean;
    onCancel: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
    totalPrice,
    primaryColor,
    onSubmit,
    isProcessing,
    onCancel
}) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Secure Checkout</h2>
                <p className="text-gray-600">
                    You will be redirected to Stripe to complete your payment securely.
                </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-8 flex justify-between items-center">
                <span className="font-medium text-gray-700">Total Amount</span>
                <span className="text-2xl font-bold text-gray-900">${totalPrice.toFixed(2)}</span>
            </div>

            <div className="space-y-4">
                <Button
                    onClick={onSubmit}
                    disabled={isProcessing}
                    className="w-full text-white h-14 text-lg font-semibold shadow-md hover:shadow-lg transition-all"
                    style={{ backgroundColor: primaryColor }}
                >
                    {isProcessing ? (
                        <span className="flex items-center gap-2">
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                            Processing...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            Pay ${totalPrice.toFixed(2)} Securely
                        </span>
                    )}
                </Button>

                <Button
                    variant="ghost"
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="w-full text-gray-500 hover:text-gray-700"
                >
                    Cancel and Go Back
                </Button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                <Lock className="w-3 h-3" />
                <span>Payments processed securely by Stripe</span>
            </div>
        </div>
    );
};
