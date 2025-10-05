'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const personalInfoSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  postalCode: z.string().min(3, 'Postal code must be at least 3 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

interface Step1PersonalInfoProps {
  initialData?: Partial<PersonalInfoFormData>;
  onNext: (data: PersonalInfoFormData) => void;
}

export function Step1PersonalInfo({ initialData, onNext }: Step1PersonalInfoProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: initialData,
  });

  const onSubmit = (data: PersonalInfoFormData) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            {...register('fullName')}
            placeholder="John Doe"
            className="mt-2"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            {...register('dateOfBirth')}
            className="mt-2"
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phoneNumber">Phone Number *</Label>
          <Input
            id="phoneNumber"
            type="tel"
            {...register('phoneNumber')}
            placeholder="+1 234 567 8900"
            className="mt-2"
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="address">Street Address *</Label>
          <Input
            id="address"
            {...register('address')}
            placeholder="123 Main Street, Apt 4B"
            className="mt-2"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            {...register('city')}
            placeholder="New York"
            className="mt-2"
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="postalCode">Postal Code *</Label>
          <Input
            id="postalCode"
            {...register('postalCode')}
            placeholder="10001"
            className="mt-2"
          />
          {errors.postalCode && (
            <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="country">Country *</Label>
          <Input
            id="country"
            {...register('country')}
            placeholder="United States"
            className="mt-2"
          />
          {errors.country && (
            <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="px-8">
          {isSubmitting ? 'Saving...' : 'Next Step'}
        </Button>
      </div>
    </form>
  );
}
