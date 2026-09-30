-- Opener: kratko pitanje koje se salje dan prije Looma.
-- Zalijepi u Supabase SQL Editor. Idempotentno.

alter table mlo_leads add column if not exists opener         text;
alter table mlo_leads add column if not exists opener_sent_at timestamptz;
alter table mlo_leads add column if not exists tech_stack     text[];

create index if not exists mlo_leads_opener_idx
  on mlo_leads (status) where opener is not null and opener_sent_at is null;
