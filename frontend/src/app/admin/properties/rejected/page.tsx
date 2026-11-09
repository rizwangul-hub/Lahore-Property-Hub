import { Metadata } from 'next';
import { PropertyManagementTable } from '@/components/admin/PropertyManagementTable';

export const metadata: Metadata = {
  title: 'Rejected Listings | Admin Portal | Lahore Property Hub',
  robots: { index: false, follow: false },
};

export default function AdminRejectedPropertiesPage() {
  return (
    <PropertyManagementTable
      initialStatus="REJECTED"
      pageTitle="Rejected Listings"
      description="Listings that were declined during moderation. Review submission history and recorded rejection rationales."
    />
  );
}
