import { Metadata } from 'next';
import { PropertyManagementTable } from '@/components/admin/PropertyManagementTable';

export const metadata: Metadata = {
  title: 'Approved Properties | Admin Portal | Property in Lahore',
  robots: { index: false, follow: false },
};

export default function AdminApprovedPropertiesPage() {
  return (
    <PropertyManagementTable
      initialStatus="APPROVED"
      pageTitle="Approved Properties"
      description="Live public properties on Property in Lahore. Feature listings for prime visibility, update status to Sold/Rented, or edit details."
    />
  );
}
