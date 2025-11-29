/**
 * Step1CustomerInfo Component
 * 
 * First step of AddBookingDialog - collects customer information.
 * @module features/bookings/components/add-booking/Step1CustomerInfo
 */
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';

interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Step1CustomerInfoProps {
  formData: CustomerFormData;
  onChange: (updates: Partial<CustomerFormData>) => void;
}

/**
 * Customer information form - collects name, email, and phone.
 */
export function Step1CustomerInfo({ formData, onChange }: Step1CustomerInfoProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">1</div>
        <h3 className="text-sm sm:text-base text-gray-900 dark:text-white">Customer Information</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName" className="text-sm">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            placeholder="Enter first name"
            className="mt-1 h-11"
          />
        </div>
        <div>
          <Label htmlFor="lastName" className="text-sm">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
            placeholder="Enter last name"
            className="mt-1 h-11"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email" className="text-sm">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="customer@example.com"
            className="mt-1 h-11"
          />
        </div>
        <div>
          <Label htmlFor="phone" className="text-sm">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
            className="mt-1 h-11"
          />
        </div>
      </div>
    </div>
  );
}
