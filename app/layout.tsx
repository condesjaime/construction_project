import type { Metadata } from 'next';
import './globals.css';
import { SideNav } from '@/components/SideNav';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Construction Scheduling & Diary',
  description: 'Project scheduling and site diary tool',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg text-text font-sans">
        <SideNav>
          {children}
        </SideNav>
         <Toaster
          position="top-right"
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
