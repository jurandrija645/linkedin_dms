-- Mindaptive Loom Outreach — schema
-- Pokreni preko: npx tsx scripts/apply-schema.ts
-- ili zalijepi u Supabase SQL Editor.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------
create or replace function mlo_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------
create table if not exists mlo_leads (
  -- identitet
  id                  uuid primary key default gen_random_uuid(),
  linkedin_url        text not null unique,
  first_name          text,
  last_name           text,
  headline_position   text,
  company             text,
  email               text,
  connected_on        date,
  csv_order           int,

  -- status
  status              text not null default 'new'
                      check (status in (
                        'new','queued','ready','needs_demo','recorded','sent','followed_up',
                        'replied','call_booked','not_interested','skipped','legacy'
                      )),

  -- brief
  tier                text check (tier in ('A','B','C','SKIP')),
  identity_confidence text check (identity_confidence in ('high','medium','low')),
  vertical            text,
  language            text check (language in ('en','hr')),
  hook_type           text,
  offer               text,
  brief               jsonb,

  -- opener (salje se dan prije Looma)
  opener              text,
  opener_sent_at      timestamptz,
  tech_stack          text[],

  -- poruke
  dm_draft            text,
  dm_final            text,
  permission_dm       text,
  followup_viewed     text,
  followup_not_viewed text,

  -- praćenje
  loom_url            text,
  viewed              boolean not null default false,
  sent_at             timestamptz,
  followup_due        date,
  followed_up_at      timestamptz,

  -- odgovor
  reply_text          text,
  reply_sentiment     text check (reply_sentiment in ('pozitivan','neutralan','negativan','ne_sad')),
  replied_at          timestamptz,
  skip_reason         text,

  -- asset
  asset_type          text check (asset_type in ('website_demo','n8n_loom','none')),
  demo_url            text,
  demo_status         text check (demo_status in ('todo','built','sent')),
  notes               text,

  -- vrijeme
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

drop trigger if exists mlo_leads_set_updated_at on mlo_leads;
create trigger mlo_leads_set_updated_at
  before update on mlo_leads
  for each row execute function mlo_set_updated_at();

create index if not exists mlo_leads_status_idx       on mlo_leads (status);
create index if not exists mlo_leads_csv_order_idx    on mlo_leads (csv_order desc nulls first);
create index if not exists mlo_leads_followup_due_idx on mlo_leads (followup_due) where status = 'sent';
create index if not exists mlo_leads_tier_idx         on mlo_leads (tier);
create index if not exists mlo_leads_vertical_idx     on mlo_leads (vertical);
create index if not exists mlo_leads_sent_at_idx      on mlo_leads (sent_at desc);
create index if not exists mlo_leads_asset_type_idx   on mlo_leads (asset_type);
create index if not exists mlo_leads_opener_idx      on mlo_leads (status) where opener is not null and opener_sent_at is null;
create index if not exists mlo_leads_demo_status_idx  on mlo_leads (demo_status) where asset_type = 'website_demo';

-- ---------------------------------------------------------------
-- workflows
-- ---------------------------------------------------------------
create table if not exists mlo_workflows (
  id                 text primary key,
  name               text not null,
  n8n_url            text,
  what_it_does       text,
  trigger            text,
  integrations       text[] default '{}',
  best_for_verticals text[] default '{}',
  demo_tip           text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

drop trigger if exists mlo_workflows_set_updated_at on mlo_workflows;
create trigger mlo_workflows_set_updated_at
  before update on mlo_workflows
  for each row execute function mlo_set_updated_at();

-- ---------------------------------------------------------------
-- activity_log
-- ---------------------------------------------------------------
create table if not exists mlo_activity_log (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid references mlo_leads (id) on delete cascade,
  action     text not null,
  payload    jsonb,
  created_at timestamptz not null default now()
);

create index if not exists mlo_activity_log_lead_idx    on mlo_activity_log (lead_id);
create index if not exists mlo_activity_log_created_idx on mlo_activity_log (created_at desc);
create index if not exists mlo_activity_log_action_idx  on mlo_activity_log (action);

-- ---------------------------------------------------------------
-- RLS: sve ide preko service role ključa server-side.
-- RLS je uključen bez ijedne policy → anon i authenticated ne vide ništa.
-- ---------------------------------------------------------------
alter table mlo_leads        enable row level security;
alter table mlo_workflows    enable row level security;
alter table mlo_activity_log enable row level security;
