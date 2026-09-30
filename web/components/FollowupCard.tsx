'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Lead } from '@/lib/types';
import { fullName } from '@/lib/types';
import { markFollowedUp, markReplied } from '@/lib/actions';
import { EditableMessage } from './LinkButtons';

function daysAgo(iso: string | null): string {
  if (!iso) return '';
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return 'danas';
  if (d === 1) return 'jučer';
  return `prije ${d} dana`;
}

export default function FollowupCard({ lead }: { lead: Lead }) {
  const [viewed, setViewed] = useState(lead.viewed);
  const [replying, setReplying] = useState(false);

  const text = (viewed ? lead.followup_viewed : lead.followup_not_viewed) ?? '';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-baseline gap-2">
        <h2 className="text-[15px] font-semibold">{fullName(lead)}</h2>
        <span className="text-sm text-slate-500">
          {lead.company ?? lead.headline_position ?? ''}
        </span>
        <Link href={`/leads/${lead.id}`} className="ml-auto text-xs text-slate-400 hover:text-slate-600">
          detalj
        </Link>
      </div>

      <p className="mt-1 text-xs text-slate-500">
        Poslano {daysAgo(lead.sent_at)}
        {lead.loom_url && (
          <>
            {' · '}
            <a
              href={lead.loom_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-700 underline underline-offset-2"
            >
              Loom
            </a>
          </>
        )}
        {' · '}
        <a
          href={lead.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-700 underline underline-offset-2"
        >
          LinkedIn
        </a>
      </p>

      <label className="mt-3 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={viewed}
          onChange={(e) => setViewed(e.target.checked)}
          className="h-4 w-4 accent-teal-700"
        />
        pogledao Loom
      </label>

      <form action={markFollowedUp} className="mt-3 space-y-2">
        <input type="hidden" name="id" value={lead.id} />
        {viewed && <input type="hidden" name="viewed" value="on" />}
        {text ? (
          <EditableMessage name="followup_text" defaultValue={text} rows={4} />
        ) : (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Nema pripremljen follow-up za ovu verziju.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
            Follow-up poslan
          </button>
          <button
            type="button"
            onClick={() => setReplying((v) => !v)}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Odgovorio
          </button>
        </div>
      </form>

      {replying && (
        <form action={markReplied} className="mt-3 space-y-2 border-t border-slate-100 pt-3">
          <input type="hidden" name="id" value={lead.id} />
          <textarea
            name="reply_text"
            rows={3}
            placeholder="Zalijepi tekst odgovora"
            className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-teal-600"
          />
          <div className="flex flex-wrap items-center gap-2">
            <select
              name="reply_sentiment"
              defaultValue="neutralan"
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="pozitivan">pozitivan</option>
              <option value="neutralan">neutralan</option>
              <option value="negativan">negativan</option>
              <option value="ne_sad">ne sad</option>
            </select>
            <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
              Spremi odgovor
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
