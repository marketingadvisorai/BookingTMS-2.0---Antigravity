import React from 'react';
import { User, Mail, Phone, AlertCircle } from 'lucide-react';
import { Card } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { validateName, validateEmail, validatePhone } from '../../../../lib/validation/formValidation';
import { CustomerData } from '../hooks/useBookingState';

interface CustomerFormProps {
    customerData: CustomerData;
    validationErrors: { name?: string; email?: string; phone?: string };
    onChange: (field: keyof CustomerData, value: string) => void;
    onValidationError: (errors: { name?: string; email?: string; phone?: string }) => void;
    primaryColor: string;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
    customerData,
    validationErrors,
    onChange,
    onValidationError,
    primaryColor
}) => {
    return (
        <Card className="p-3 sm:p-4 md:p-6 bg-white border border-gray-200 shadow-sm">
            <h2 className="text-gray-900 mb-4 sm:mb-6 text-lg sm:text-xl">Contact Information</h2>

            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-900 font-medium mb-1">✅ Required Format:</p>
                <ul className="text-xs text-green-800 space-y-0.5">
                    <li>• <strong>Name:</strong> First and Last name (e.g., John Doe)</li>
                    <li>• <strong>Email:</strong> Valid email address (e.g., john@example.com)</li>
                    <li>• <strong>Phone:</strong> 10+ digits, any format (e.g., 555-123-4567)</li>
                </ul>
            </div>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="name" className="text-gray-700">Full Name <span className="text-red-500">*</span></Label>
                    <div className="relative mt-2">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            value={customerData.name}
                            onChange={(e) => {
                                onChange('name', e.target.value);
                                if (validationErrors.name) onValidationError({ ...validationErrors, name: undefined });
                            }}
                            onBlur={() => {
                                const result = validateName(customerData.name);
                                if (!result.isValid) {
                                    onValidationError({ ...validationErrors, name: result.error });
                                }
                            }}
                            className={`pl-10 h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500 ${validationErrors.name ? 'border-red-500 bg-red-50' : ''}`}
                        />
                    </div>
                    {validationErrors.name && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {validationErrors.name}
                        </p>
                    )}
                </div>
                <div>
                    <Label htmlFor="email" className="text-gray-700">Email <span className="text-red-500">*</span></Label>
                    <div className="relative mt-2">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={customerData.email}
                            onChange={(e) => {
                                onChange('email', e.target.value);
                                if (validationErrors.email) onValidationError({ ...validationErrors, email: undefined });
                            }}
                            onBlur={() => {
                                const result = validateEmail(customerData.email);
                                if (!result.isValid) {
                                    onValidationError({ ...validationErrors, email: result.error });
                                }
                            }}
                            className={`pl-10 h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500 ${validationErrors.email ? 'border-red-500 bg-red-50' : ''}`}
                        />
                    </div>
                    {validationErrors.email && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {validationErrors.email}
                        </p>
                    )}
                </div>
                <div>
                    <Label htmlFor="phone" className="text-gray-700">Phone Number <span className="text-red-500">*</span></Label>
                    <div className="relative mt-2">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="(555) 123-4567"
                            value={customerData.phone}
                            onChange={(e) => {
                                onChange('phone', e.target.value);
                                if (validationErrors.phone) onValidationError({ ...validationErrors, phone: undefined });
                            }}
                            onBlur={() => {
                                const result = validatePhone(customerData.phone);
                                if (!result.isValid) {
                                    onValidationError({ ...validationErrors, phone: result.error });
                                }
                            }}
                            className={`pl-10 h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500 ${validationErrors.phone ? 'border-red-500 bg-red-50' : ''}`}
                        />
                    </div>
                    {validationErrors.phone && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {validationErrors.phone}
                        </p>
                    )}
                </div>
            </div>
        </Card>
    );
};
