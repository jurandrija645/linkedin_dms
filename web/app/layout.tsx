import type { Metadata, Viewport } from 'next';
import './globals.css';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Mindaptive Outreach',
  description: 'Loom outreach dashboard',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f766e',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hr">
      {/* Ekstenzije (ColorZilla dodaje cz-shortcut-listen) mijenjaju <body>
          prije nego React hidrira, pa se atributi ne poklapaju. */}
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <Nav />
        <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-5 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
