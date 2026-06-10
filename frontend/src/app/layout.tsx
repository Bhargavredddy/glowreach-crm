import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'GlowReach AI | Mini CRM',
  description: 'AI-Native Customer Engagement Platform for Beauty & Fashion Brands',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <div className="flex">
          {/* Persistent navigation sidebar */}
          <Sidebar />
          
          {/* Main content wrapper */}
          <main className="flex-1 min-h-screen pl-72 bg-transparent">
            <div className="max-w-7xl mx-auto p-8 md:p-12">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
