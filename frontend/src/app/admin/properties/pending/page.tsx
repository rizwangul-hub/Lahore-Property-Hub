import { Metadata } from 'next';
import { PropertyManagementTable } from '@/components/admin/PropertyManagementTable';

export const metadata: Metadata = {
  title: 'Pending Moderation Queue | Admin Portal | Property in Lahore',
  robots: { index: false, follow: false },
};

export default function AdminPendingPropertiesPage() {
  return (
    <PropertyManagementTable
      initialStatus="PENDING"
      pageTitle="Pending Moderation Queue"
      description="Review public submissions awaiting approval. Inspect listing contents, photos, pricing, and approve or reject with reasons."
    />
  );
}
