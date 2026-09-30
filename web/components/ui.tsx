import type { Confidence, Tier } from '@/lib/types';

export function TierBadge({ tier }: { tier: Tier | null }) {
  if (!tier) return null;
  const styles: Record<Tier, string> = {
    A: 'bg-teal-700 text-white',
    B: 'bg-amber-500 text-white',
    C: 'bg-slate-500 text-white',
    SKIP: 'bg-slate-200 text-slate-600',
  };
  const label: Record<Tier, string> = {
    A: 'A · snimi Loom',
    B: 'B · permission DM',
    C: 'C · samo DM',
    SKIP: 'SKIP',
  };
  return (
    <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${styles[tier]}`}>{label[tier]}</span>
  );
}

export function ConfidenceBadge({ level }: { level: Confidence | null }) {
  if (!level) return null;
  const styles: Record<Confidence, string> = {
    high: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    medium: 'bg-amber-50 text-amber-700 ring-amber-200',
    low: 'bg-red-50 text-red-700 ring-red-300',
  };
  const label: Record<Confidence, string> = {
    high: 'identitet potvrđen',
    medium: 'identitet vjerojatan',
    low: 'identitet nesiguran',
  };
  return (
    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ring-1 ${styles[level]}`}>
      {label[level]}
    </span>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</h3>
      {children}
    </div>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}>
      {children}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-8 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}
