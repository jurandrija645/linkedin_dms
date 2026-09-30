export type Status =
  | 'new' | 'queued' | 'ready' | 'needs_demo' | 'recorded' | 'sent' | 'followed_up'
  | 'replied' | 'call_booked' | 'not_interested' | 'skipped' | 'legacy';

export type Tier = 'A' | 'B' | 'C' | 'SKIP';
export type Confidence = 'high' | 'medium' | 'low';
export type AssetType = 'website_demo' | 'n8n_loom' | 'none';
export type DemoStatus = 'todo' | 'built' | 'sent';
export type Sentiment = 'pozitivan' | 'neutralan' | 'negativan' | 'ne_sad';

export type Brief = {
  name?: string;
  linkedin_url?: string;
  role?: string;
  company?: string;
  company_website?: string;
  location?: string;
  vertical?: string;
  identity_confidence?: Confidence;
  identity_note?: string;
  tier?: Tier;
  tier_reason?: string;
  asset_type?: AssetType;
  asset_reason?: string;
  one_liner?: string;
  summary?: string[];
  observed_on_site?: string[];
  offer?: string;
  hook_type?: string;
  hook_line?: string;
  tech_stack?: string[];
  opener?: string;
  video_beats?: string[];
  show_on_their_site?: { what: string; url: string }[];
  website_demo?: {
    why?: string;
    current_site_problems?: string[];
    pages_to_build?: string[];
    ai_widget?: string;
    inquiry_flow?: string;
    seo_fixes?: string[];
    brand_risk?: string;
    demo_url?: string;
    demo_status?: DemoStatus;
  };
  workflows?: { id: string; why: string }[];
  workflow_gap?: { what_to_show: string; n8n_search: string };
  language?: 'en' | 'hr';
  dm?: string;
  permission_dm?: string;
  followup_viewed?: string;
  followup_not_viewed?: string;
  avoid?: string[];
  sources?: string[];
};

export type Lead = {
  id: string;
  linkedin_url: string;
  first_name: string | null;
  last_name: string | null;
  headline_position: string | null;
  company: string | null;
  email: string | null;
  connected_on: string | null;
  csv_order: number | null;
  status: Status;
  tier: Tier | null;
  identity_confidence: Confidence | null;
  vertical: string | null;
  language: 'en' | 'hr' | null;
  hook_type: string | null;
  offer: string | null;
  brief: Brief | null;
  opener: string | null;
  opener_sent_at: string | null;
  tech_stack: string[] | null;
  asset_type: AssetType | null;
  demo_url: string | null;
  demo_status: DemoStatus | null;
  dm_draft: string | null;
  dm_final: string | null;
  permission_dm: string | null;
  followup_viewed: string | null;
  followup_not_viewed: string | null;
  loom_url: string | null;
  viewed: boolean;
  sent_at: string | null;
  followup_due: string | null;
  followed_up_at: string | null;
  reply_text: string | null;
  reply_sentiment: Sentiment | null;
  replied_at: string | null;
  skip_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Workflow = {
  id: string;
  name: string;
  n8n_url: string | null;
  what_it_does: string | null;
  trigger: string | null;
  integrations: string[] | null;
  best_for_verticals: string[] | null;
  demo_tip: string | null;
};

export const STATUS_LABEL: Record<Status, string> = {
  new: 'novi',
  queued: 'u queueu',
  ready: 'spreman',
  needs_demo: 'treba demo',
  recorded: 'snimljen',
  sent: 'poslano',
  followed_up: 'follow-up poslan',
  replied: 'odgovorio',
  call_booked: 'call bukiran',
  not_interested: 'nije zainteresiran',
  skipped: 'preskočen',
  legacy: 'legacy',
};

export function fullName(l: Pick<Lead, 'first_name' | 'last_name'>): string {
  return [l.first_name, l.last_name].filter(Boolean).join(' ').trim() || 'Bez imena';
}
