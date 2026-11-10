import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Post Free Property Advertisement | Property in Lahore',
  description: 'Submit your property for sale, rent, or property wanted in Lahore with direct WhatsApp inquiries.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PostPropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
