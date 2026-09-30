'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Danas' },
  { href: '/openeri', label: 'Openeri' },
  { href: '/followup', label: 'Follow-up' },
  { href: '/leads', label: 'Svi leadovi' },
  { href: '/stats', label: 'Statistika' },
];

export default function Nav() {
  const path = usePathname();
  if (path === '/login') return null;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-3xl items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6">
        {TABS.map((t) => {
          const active = t.href === '/' ? path === '/' : path.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                active ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
