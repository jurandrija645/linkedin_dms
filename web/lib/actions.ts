'use server';

import { revalidatePath } from 'next/cache';
import { db, logActivity } from './supabase';

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function refresh() {
  revalidatePath('/');
  revalidatePath('/openeri');
  revalidatePath('/followup');
  revalidatePath('/leads');
  revalidatePath('/stats');
}

async function update(id: string, patch: Record<string, unknown>, action: string, payload?: unknown) {
  const { error } = await db().from('mlo_leads').update(patch).eq('id', id);
  if (error) throw new Error(error.message);
  await logActivity(id, action, payload ?? patch);
  refresh();
}

/** Opener poslan. Lead ostaje u istom statusu, Loom ide svejedno. */
export async function markOpenerSent(formData: FormData) {
  const id = String(formData.get('id'));
  try {
    await update(id, { opener_sent_at: new Date().toISOString() }, 'opener_sent');
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('opener_sent_at')) {
      throw new Error(
        'Kolona opener_sent_at ne postoji. Pokreni supabase/2026-09-22_opener.sql u Supabase SQL Editoru.'
      );
    }
    throw e;
  }
}

/** Demo stranica izgradjena: spremi URL i pusti lead u snimanje. */
export async function markDemoBuilt(formData: FormData) {
  const id = String(formData.get('id'));
  const demoUrl = String(formData.get('demo_url') ?? '').trim();
  if (!demoUrl) return;
  await update(
    id,
    { demo_url: demoUrl, demo_status: 'built', status: 'ready' },
    'demo_built',
    { demo_url: demoUrl }
  );
}

/** Snimljeno: spremi Loom URL. */
export async function markRecorded(formData: FormData) {
  const id = String(formData.get('id'));
  const loom = String(formData.get('loom_url') ?? '').trim();
  if (!loom) return;
  await update(id, { loom_url: loom, status: 'recorded' }, 'recorded', { loom_url: loom });
}

/**
 * Poslano: spremi finalni DM, timestamp i follow-up za 4 dana.
 * Ako je oznaceno `jucer`, datum se pomakne dan unatrag pa follow-up
 * pada na ispravan dan umjesto da se odgodi za 24 sata.
 */
export async function markSent(formData: FormData) {
  const id = String(formData.get('id'));
  const dmFinal = String(formData.get('dm_final') ?? '').trim();
  const yesterday = formData.get('yesterday') === 'on';

  const when = new Date();
  if (yesterday) when.setDate(when.getDate() - 1);

  const due = new Date(when);
  due.setDate(due.getDate() + 4);
  const dueStr = due.toISOString().slice(0, 10);

  await update(
    id,
    {
      dm_final: dmFinal || null,
      status: 'sent',
      sent_at: when.toISOString(),
      followup_due: dueStr,
    },
    'sent',
    { dm_final: dmFinal, followup_due: dueStr, yesterday }
  );
}

/** Preskoči s razlogom. */
export async function markSkipped(formData: FormData) {
  const id = String(formData.get('id'));
  const reason = String(formData.get('skip_reason') ?? '').trim();
  await update(id, { status: 'skipped', skip_reason: reason || null }, 'skipped', { reason });
}

/** Follow-up poslan. */
export async function markFollowedUp(formData: FormData) {
  const id = String(formData.get('id'));
  const viewed = formData.get('viewed') === 'on';
  await update(
    id,
    { status: 'followed_up', followed_up_at: new Date().toISOString(), viewed },
    'followed_up',
    { viewed }
  );
}

/** Odgovorio: tekst + sentiment. */
export async function markReplied(formData: FormData) {
  const id = String(formData.get('id'));
  const text = String(formData.get('reply_text') ?? '').trim();
  const sentiment = String(formData.get('reply_sentiment') ?? '') || null;
  await update(
    id,
    {
      status: 'replied',
      reply_text: text || null,
      reply_sentiment: sentiment,
      replied_at: new Date().toISOString(),
      followup_due: null,
    },
    'replied',
    { sentiment }
  );
}

/** Ishod nakon odgovora. */
export async function markOutcome(formData: FormData) {
  const id = String(formData.get('id'));
  const outcome = String(formData.get('outcome'));
  if (outcome !== 'call_booked' && outcome !== 'not_interested') return;
  await update(id, { status: outcome }, outcome);
}

/** Ručna promjena statusa / bilješke na detalju. */
export async function updateNotes(formData: FormData) {
  const id = String(formData.get('id'));
  const notes = String(formData.get('notes') ?? '').trim();
  await update(id, { notes: notes || null }, 'notes_updated');
}

/** Označi da je pogledao Loom. */
export async function toggleViewed(formData: FormData) {
  const id = String(formData.get('id'));
  const viewed = formData.get('viewed') === 'true';
  await update(id, { viewed }, 'viewed_toggled', { viewed });
}
