-- Website demo asset. Zalijepi u Supabase SQL Editor i pokreni.
-- Idempotentno, smije se pokrenuti vise puta.

alter table mlo_leads add column if not exists asset_type  text;
alter table mlo_leads add column if not exists demo_url    text;
alter table mlo_leads add column if not exists demo_status text;

alter table mlo_leads drop constraint if exists mlo_leads_asset_type_check;
alter table mlo_leads add  constraint mlo_leads_asset_type_check
  check (asset_type in ('website_demo','n8n_loom','none'));

alter table mlo_leads drop constraint if exists mlo_leads_demo_status_check;
alter table mlo_leads add  constraint mlo_leads_demo_status_check
  check (demo_status in ('todo','built','sent'));

-- novi status: brief je gotov, ali demo jos nije izgradjen
alter table mlo_leads drop constraint if exists mlo_leads_status_check;
alter table mlo_leads add  constraint mlo_leads_status_check
  check (status in (
    'new','queued','ready','needs_demo','recorded','sent','followed_up',
    'replied','call_booked','not_interested','skipped','legacy'
  ));

create index if not exists mlo_leads_asset_type_idx  on mlo_leads (asset_type);
create index if not exists mlo_leads_demo_status_idx on mlo_leads (demo_status) where asset_type = 'website_demo';
