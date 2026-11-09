import { Metadata } from 'next';
import { PropertyManagementTable } from '@/components/admin/PropertyManagementTable';

export const metadata: Metadata = {
  title: 'Approved Properties | Admin Portal | Lahore Property Hub',
  robots: { index: false, follow: false },
};

export default function AdminApprovedPropertiesPage() {
  return (
    <PropertyManagementTable
      initialStatus="APPROVED"
      pageTitle="Approved Properties"
      description="Live public properties on Lahore Property Hub. Feature listings for prime visibility, update status to Sold/Rented, or edit details."
    />
  );
}
