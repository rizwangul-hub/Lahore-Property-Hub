import { Metadata } from 'next';
import { PropertyManagementTable } from '@/components/admin/PropertyManagementTable';

export const metadata: Metadata = {
  title: 'All Properties | Admin Portal | Property in Lahore',
  robots: { index: false, follow: false },
};

export default function AdminAllPropertiesPage() {
  return (
    <PropertyManagementTable
      initialStatus="ALL"
      pageTitle="All Properties"
      description="Comprehensive directory of all property submissions and listings across all workflow statuses."
    />
  );
}
