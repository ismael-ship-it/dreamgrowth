-- DreamGrowth Stage 1 Foundation
-- Supabase/PostgreSQL schema with strict multi-tenant isolation.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.company_status as enum ('active', 'trialing', 'past_due', 'paused', 'cancelled');
create type public.company_member_role as enum ('owner', 'admin', 'manager', 'member', 'viewer');
create type public.integration_provider as enum ('google', 'meta', 'openai', 'supabase', 'vercel');
create type public.integration_status as enum ('not_connected', 'connected', 'expired', 'error', 'revoked');
create type public.task_status as enum ('pending', 'approved', 'completed', 'skipped', 'snoozed', 'failed');
create type public.task_type as enum (
  'wasted_spend',
  'negative_keyword_review',
  'review_response',
  'review_request',
  'google_business_post',
  'photo_upload',
  'meta_post',
  'lead_follow_up',
  'weekly_report',
  'seo_cleanup',
  'general'
);
create type public.source_platform as enum ('google_business', 'google_ads', 'ga4', 'search_console', 'meta', 'facebook', 'instagram', 'manual', 'ai');
create type public.recommendation_status as enum ('pending', 'accepted', 'rejected', 'applied', 'expired');
create type public.post_status as enum ('draft', 'pending_approval', 'approved', 'scheduled', 'published', 'failed');
create type public.review_sentiment as enum ('positive', 'neutral', 'negative', 'unknown');
create type public.search_term_decision as enum ('unreviewed', 'keep', 'watch', 'negative');
create type public.media_type as enum ('image', 'video', 'document');
create type public.social_channel_type as enum ('google_business', 'facebook_page', 'instagram_business');
create type public.publish_target_type as enum ('google_business_post', 'facebook_post', 'instagram_post');
create type public.audit_action as enum ('insert', 'update', 'delete', 'approve', 'publish', 'sync', 'login', 'disconnect', 'other');
create type public.campaign_goal as enum ('calls', 'website_leads', 'showroom_visits');
create type public.campaign_draft_status as enum ('draft', 'pending_approval', 'approved', 'publishing', 'published', 'failed', 'archived');
create type public.keyword_match_type as enum ('exact', 'phrase', 'broad');

-- ---------------------------------------------------------------------------
-- Shared functions
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_user_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

create or replace function public.is_company_member(target_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = target_company_id
      and cm.user_id = auth.uid()
      and cm.is_active = true
  );
$$;

create or replace function public.has_company_role(
  target_company_id uuid,
  allowed_roles public.company_member_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = target_company_id
      and cm.user_id = auth.uid()
      and cm.is_active = true
      and cm.role = any(allowed_roles)
  );
$$;

create or replace function public.can_manage_company(target_company_id uuid)
returns boolean
language sql
stable
as $$
  select public.has_company_role(target_company_id, array['owner', 'admin', 'manager']::public.company_member_role[]);
$$;

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  industry text,
  primary_city text,
  primary_state text,
  timezone text not null default 'America/New_York',
  status public.company_status not null default 'trialing',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  default_company_id uuid references public.companies(id) on delete set null,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.company_member_role not null default 'member',
  is_active boolean not null default true,
  invited_by uuid references auth.users(id) on delete set null,
  invited_at timestamptz,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, user_id)
);

create or replace function public.create_company_with_owner(
  company_name text,
  company_slug text,
  company_industry text default null,
  company_primary_city text default null,
  company_primary_state text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_company_id uuid;
  normalized_slug text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  normalized_slug := lower(regexp_replace(trim(company_slug), '[^a-zA-Z0-9]+', '-', 'g'));
  normalized_slug := trim(both '-' from normalized_slug);

  if normalized_slug = '' then
    raise exception 'Company slug is required';
  end if;

  insert into public.companies (name, slug, industry, primary_city, primary_state)
  values (company_name, normalized_slug, company_industry, company_primary_city, company_primary_state)
  returning id into new_company_id;

  insert into public.profiles (id, default_company_id)
  values (auth.uid(), new_company_id)
  on conflict (id) do update
    set default_company_id = excluded.default_company_id,
        updated_at = now();

  insert into public.company_members (company_id, user_id, role, is_active, joined_at)
  values (new_company_id, auth.uid(), 'owner', true, now());

  return new_company_id;
end;
$$;

create table public.integrations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  provider public.integration_provider not null,
  status public.integration_status not null default 'not_connected',
  external_account_id text,
  display_name text,
  scopes text[] not null default '{}',
  token_vault_ref text,
  expires_at timestamptz,
  last_sync_at timestamptz,
  sync_error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, provider, external_account_id)
);

create table public.growth_tasks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  task_type public.task_type not null,
  status public.task_status not null default 'pending',
  title text not null,
  reason text not null,
  suggested_action text not null,
  impact_score integer not null default 0 check (impact_score between 0 and 100),
  urgency_score integer not null default 0 check (urgency_score between 0 and 100),
  confidence_score integer not null default 0 check (confidence_score between 0 and 100),
  estimated_time_minutes integer not null default 5 check (estimated_time_minutes >= 0),
  requires_approval boolean not null default true,
  source_platform public.source_platform not null default 'ai',
  related_table text,
  related_record_id uuid,
  due_at timestamptz,
  snoozed_until timestamptz,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  completed_by uuid references auth.users(id) on delete set null,
  completed_at timestamptz,
  skipped_reason text,
  ai_model text,
  ai_prompt_version text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_recommendations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  growth_task_id uuid references public.growth_tasks(id) on delete set null,
  recommendation_type text not null,
  status public.recommendation_status not null default 'pending',
  title text not null,
  explanation text not null,
  recommended_action text not null,
  source_platform public.source_platform not null default 'ai',
  related_table text,
  related_record_id uuid,
  impact_score integer not null default 0 check (impact_score between 0 and 100),
  confidence_score integer not null default 0 check (confidence_score between 0 and 100),
  requires_approval boolean not null default true,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  applied_at timestamptz,
  ai_model text,
  ai_prompt_version text,
  input_snapshot jsonb not null default '{}'::jsonb,
  output_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action public.audit_action not null,
  entity_table text not null,
  entity_id uuid,
  summary text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Google tables
-- ---------------------------------------------------------------------------

create table public.google_accounts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  integration_id uuid references public.integrations(id) on delete set null,
  google_account_id text not null,
  email text,
  display_name text,
  scopes text[] not null default '{}',
  connected_at timestamptz not null default now(),
  last_sync_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, google_account_id)
);

create table public.google_business_locations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  google_account_id uuid references public.google_accounts(id) on delete set null,
  external_location_id text not null,
  location_name text not null,
  business_name text,
  primary_category text,
  address jsonb,
  phone text,
  website_url text,
  verification_state text,
  profile_url text,
  metadata jsonb not null default '{}'::jsonb,
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, external_location_id)
);

create table public.google_reviews (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  location_id uuid references public.google_business_locations(id) on delete cascade,
  external_review_id text not null,
  reviewer_name text,
  rating integer check (rating between 1 and 5),
  comment text,
  sentiment public.review_sentiment not null default 'unknown',
  review_created_at timestamptz,
  review_updated_at timestamptz,
  owner_reply text,
  owner_reply_updated_at timestamptz,
  response_draft text,
  response_status public.post_status not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, external_review_id)
);

create table public.google_business_posts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  location_id uuid references public.google_business_locations(id) on delete cascade,
  external_post_id text,
  status public.post_status not null default 'draft',
  topic_type text,
  title text,
  body text not null,
  call_to_action text,
  media_urls text[] not null default '{}',
  scheduled_at timestamptz,
  published_at timestamptz,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.google_business_photos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  location_id uuid references public.google_business_locations(id) on delete cascade,
  media_library_id uuid,
  external_photo_id text,
  category text,
  url text,
  caption text,
  uploaded_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.google_ads_accounts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  google_account_id uuid references public.google_accounts(id) on delete set null,
  customer_id text not null,
  descriptive_name text,
  currency_code text,
  time_zone text,
  last_sync_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, customer_id)
);

create table public.google_ads_campaigns (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  ads_account_id uuid not null references public.google_ads_accounts(id) on delete cascade,
  external_campaign_id text not null,
  name text not null,
  status text,
  channel_type text,
  budget_amount_micros bigint,
  impressions bigint not null default 0,
  clicks bigint not null default 0,
  cost_micros bigint not null default 0,
  conversions numeric(12, 2) not null default 0,
  start_date date,
  end_date date,
  metrics_date date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, ads_account_id, external_campaign_id, metrics_date)
);

create table public.google_ads_search_terms (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  ads_account_id uuid not null references public.google_ads_accounts(id) on delete cascade,
  campaign_id uuid references public.google_ads_campaigns(id) on delete set null,
  search_term text not null,
  match_type text,
  impressions bigint not null default 0,
  clicks bigint not null default 0,
  cost_micros bigint not null default 0,
  conversions numeric(12, 2) not null default 0,
  low_intent_reason text,
  decision public.search_term_decision not null default 'unreviewed',
  first_seen_at timestamptz,
  last_seen_at timestamptz,
  metrics_start_date date,
  metrics_end_date date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.negative_keyword_suggestions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  search_term_id uuid references public.google_ads_search_terms(id) on delete cascade,
  suggested_keyword text not null,
  match_type text not null default 'phrase',
  reason text not null,
  estimated_wasted_spend_micros bigint not null default 0,
  confidence_score integer not null default 0 check (confidence_score between 0 and 100),
  status public.recommendation_status not null default 'pending',
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  applied_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.google_ads_campaign_drafts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  ads_account_id uuid references public.google_ads_accounts(id) on delete set null,
  status public.campaign_draft_status not null default 'draft',
  goal public.campaign_goal not null,
  name text not null,
  services text[] not null default '{}',
  location_targets jsonb not null default '[]'::jsonb,
  recommended_daily_budget_micros bigint not null default 0,
  user_daily_budget_micros bigint,
  budget_reason text,
  landing_page_url text,
  landing_page_reason text,
  call_asset_phone text,
  conversion_tracking_notes text,
  external_campaign_id text,
  broad_match_enabled boolean not null default false,
  ai_max_enabled boolean not null default false,
  expansion_enabled boolean not null default false,
  requires_approval boolean not null default true,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  published_at timestamptz,
  failure_reason text,
  ai_model text,
  ai_prompt_version text,
  input_snapshot jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (broad_match_enabled = false),
  check (ai_max_enabled = false),
  check (expansion_enabled = false),
  check (requires_approval = true)
);

create table public.google_ads_campaign_draft_keywords (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  campaign_draft_id uuid not null references public.google_ads_campaign_drafts(id) on delete cascade,
  keyword text not null,
  match_type public.keyword_match_type not null default 'phrase',
  is_negative boolean not null default false,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (match_type <> 'broad')
);

create table public.google_ads_campaign_draft_ads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  campaign_draft_id uuid not null references public.google_ads_campaign_drafts(id) on delete cascade,
  headlines text[] not null default '{}',
  descriptions text[] not null default '{}',
  call_to_action text,
  final_url text,
  path_1 text,
  path_2 text,
  status public.post_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ga4_metrics (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  google_account_id uuid references public.google_accounts(id) on delete set null,
  property_id text not null,
  metric_date date not null,
  source text,
  medium text,
  page_path text,
  sessions bigint not null default 0,
  users bigint not null default 0,
  conversions numeric(12, 2) not null default 0,
  event_count bigint not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.search_console_metrics (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  google_account_id uuid references public.google_accounts(id) on delete set null,
  site_url text not null,
  metric_date date not null,
  query text,
  page text,
  country text,
  device text,
  clicks bigint not null default 0,
  impressions bigint not null default 0,
  ctr numeric(8, 6) not null default 0,
  position numeric(8, 2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Meta/social tables
-- ---------------------------------------------------------------------------

create table public.meta_accounts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  integration_id uuid references public.integrations(id) on delete set null,
  external_account_id text not null,
  display_name text,
  email text,
  scopes text[] not null default '{}',
  last_sync_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, external_account_id)
);

create table public.meta_pages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  meta_account_id uuid references public.meta_accounts(id) on delete set null,
  external_page_id text not null,
  name text not null,
  username text,
  category text,
  page_url text,
  last_sync_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, external_page_id)
);

create table public.meta_instagram_accounts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  meta_account_id uuid references public.meta_accounts(id) on delete set null,
  meta_page_id uuid references public.meta_pages(id) on delete set null,
  external_instagram_id text not null,
  username text,
  profile_picture_url text,
  last_sync_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, external_instagram_id)
);

create table public.meta_ad_accounts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  meta_account_id uuid references public.meta_accounts(id) on delete set null,
  external_ad_account_id text not null,
  name text,
  currency text,
  timezone_name text,
  account_status text,
  last_sync_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, external_ad_account_id)
);

create table public.meta_campaigns (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  meta_ad_account_id uuid not null references public.meta_ad_accounts(id) on delete cascade,
  external_campaign_id text not null,
  name text not null,
  status text,
  objective text,
  impressions bigint not null default 0,
  clicks bigint not null default 0,
  spend numeric(12, 2) not null default 0,
  leads bigint not null default 0,
  metrics_date date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, meta_ad_account_id, external_campaign_id, metrics_date)
);

create table public.meta_leads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  meta_page_id uuid references public.meta_pages(id) on delete set null,
  external_lead_id text not null,
  form_id text,
  lead_created_at timestamptz,
  full_name text,
  email text,
  phone text,
  status text not null default 'new',
  payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, external_lead_id)
);

create table public.social_channels (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  channel_type public.social_channel_type not null,
  display_name text not null,
  external_id text,
  google_business_location_id uuid references public.google_business_locations(id) on delete set null,
  meta_page_id uuid references public.meta_pages(id) on delete set null,
  meta_instagram_account_id uuid references public.meta_instagram_accounts(id) on delete set null,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.social_posts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  social_channel_id uuid references public.social_channels(id) on delete set null,
  ai_generated_post_id uuid,
  status public.post_status not null default 'draft',
  title text,
  body text not null,
  media_urls text[] not null default '{}',
  scheduled_at timestamptz,
  published_at timestamptz,
  external_post_id text,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.publishing_queue (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  target_type public.publish_target_type not null,
  social_post_id uuid references public.social_posts(id) on delete cascade,
  google_business_post_id uuid references public.google_business_posts(id) on delete cascade,
  status public.post_status not null default 'pending_approval',
  scheduled_at timestamptz,
  attempted_at timestamptz,
  published_at timestamptz,
  failure_reason text,
  created_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (social_post_id is not null and google_business_post_id is null)
    or (social_post_id is null and google_business_post_id is not null)
  )
);

-- ---------------------------------------------------------------------------
-- Content/media tables
-- ---------------------------------------------------------------------------

create table public.media_library (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  uploaded_by uuid references auth.users(id) on delete set null,
  media_type public.media_type not null default 'image',
  storage_bucket text not null,
  storage_path text not null,
  public_url text,
  file_name text,
  mime_type text,
  file_size_bytes bigint,
  city text,
  state text,
  service_type text,
  material_type text,
  project_date date,
  notes text,
  alt_text text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, storage_bucket, storage_path)
);

create table public.geo_checkins (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  media_library_id uuid references public.media_library(id) on delete set null,
  city text not null,
  state text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  service_type text,
  material_type text,
  project_notes text,
  checked_in_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_calendar (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  description text,
  scheduled_for timestamptz not null,
  status public.post_status not null default 'draft',
  source_platform public.source_platform not null default 'manual',
  social_post_id uuid references public.social_posts(id) on delete set null,
  google_business_post_id uuid references public.google_business_posts(id) on delete set null,
  assigned_to uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ai_generated_posts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  media_library_id uuid references public.media_library(id) on delete set null,
  target_type public.publish_target_type not null,
  status public.post_status not null default 'pending_approval',
  city text,
  material_type text,
  service_type text,
  notes text,
  title text,
  body text not null,
  hashtags text[] not null default '{}',
  ai_model text,
  ai_prompt_version text,
  input_snapshot jsonb not null default '{}'::jsonb,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.google_business_photos
  add constraint google_business_photos_media_library_fk
  foreign key (media_library_id) references public.media_library(id) on delete set null;

alter table public.social_posts
  add constraint social_posts_ai_generated_post_fk
  foreign key (ai_generated_post_id) references public.ai_generated_posts(id) on delete set null;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index companies_slug_idx on public.companies (slug);
create index profiles_default_company_idx on public.profiles (default_company_id);
create index company_members_company_idx on public.company_members (company_id);
create index company_members_user_idx on public.company_members (user_id);
create index integrations_company_provider_idx on public.integrations (company_id, provider, status);
create index growth_tasks_company_status_due_idx on public.growth_tasks (company_id, status, due_at);
create index growth_tasks_company_type_idx on public.growth_tasks (company_id, task_type);
create index growth_tasks_score_idx on public.growth_tasks (company_id, status, impact_score desc, urgency_score desc, confidence_score desc);
create index ai_recommendations_company_status_idx on public.ai_recommendations (company_id, status);
create index audit_logs_company_created_idx on public.audit_logs (company_id, created_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_table, entity_id);

create index google_reviews_company_location_idx on public.google_reviews (company_id, location_id, review_created_at desc);
create index google_reviews_response_status_idx on public.google_reviews (company_id, response_status, sentiment);
create index google_business_posts_company_status_idx on public.google_business_posts (company_id, status, scheduled_at);
create index google_business_photos_company_location_idx on public.google_business_photos (company_id, location_id, uploaded_at desc);
create index google_ads_search_terms_company_decision_idx on public.google_ads_search_terms (company_id, decision, cost_micros desc);
create index negative_keyword_suggestions_company_status_idx on public.negative_keyword_suggestions (company_id, status, estimated_wasted_spend_micros desc);
create index google_ads_campaign_drafts_company_status_idx on public.google_ads_campaign_drafts (company_id, status, created_at desc);
create index google_ads_campaign_draft_keywords_company_idx on public.google_ads_campaign_draft_keywords (company_id, campaign_draft_id, is_negative);
create index google_ads_campaign_draft_ads_company_idx on public.google_ads_campaign_draft_ads (company_id, campaign_draft_id);
create index ga4_metrics_company_date_idx on public.ga4_metrics (company_id, metric_date desc);
create index search_console_metrics_company_date_idx on public.search_console_metrics (company_id, metric_date desc);

create index meta_leads_company_status_idx on public.meta_leads (company_id, status, lead_created_at desc);
create index social_channels_company_active_idx on public.social_channels (company_id, is_active);
create index social_posts_company_status_idx on public.social_posts (company_id, status, scheduled_at);
create index publishing_queue_company_status_idx on public.publishing_queue (company_id, status, scheduled_at);
create index media_library_company_created_idx on public.media_library (company_id, created_at desc);
create index media_library_local_project_idx on public.media_library (company_id, city, service_type, material_type);
create index geo_checkins_company_checked_idx on public.geo_checkins (company_id, checked_in_at desc);
create index content_calendar_company_scheduled_idx on public.content_calendar (company_id, scheduled_for);
create index ai_generated_posts_company_status_idx on public.ai_generated_posts (company_id, status, created_at desc);

-- ---------------------------------------------------------------------------
-- Updated-at triggers
-- ---------------------------------------------------------------------------

create trigger set_companies_updated_at before update on public.companies for each row execute function public.set_updated_at();
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_company_members_updated_at before update on public.company_members for each row execute function public.set_updated_at();
create trigger set_integrations_updated_at before update on public.integrations for each row execute function public.set_updated_at();
create trigger set_growth_tasks_updated_at before update on public.growth_tasks for each row execute function public.set_updated_at();
create trigger set_ai_recommendations_updated_at before update on public.ai_recommendations for each row execute function public.set_updated_at();
create trigger set_google_accounts_updated_at before update on public.google_accounts for each row execute function public.set_updated_at();
create trigger set_google_business_locations_updated_at before update on public.google_business_locations for each row execute function public.set_updated_at();
create trigger set_google_reviews_updated_at before update on public.google_reviews for each row execute function public.set_updated_at();
create trigger set_google_business_posts_updated_at before update on public.google_business_posts for each row execute function public.set_updated_at();
create trigger set_google_business_photos_updated_at before update on public.google_business_photos for each row execute function public.set_updated_at();
create trigger set_google_ads_accounts_updated_at before update on public.google_ads_accounts for each row execute function public.set_updated_at();
create trigger set_google_ads_campaigns_updated_at before update on public.google_ads_campaigns for each row execute function public.set_updated_at();
create trigger set_google_ads_search_terms_updated_at before update on public.google_ads_search_terms for each row execute function public.set_updated_at();
create trigger set_negative_keyword_suggestions_updated_at before update on public.negative_keyword_suggestions for each row execute function public.set_updated_at();
create trigger set_google_ads_campaign_drafts_updated_at before update on public.google_ads_campaign_drafts for each row execute function public.set_updated_at();
create trigger set_google_ads_campaign_draft_keywords_updated_at before update on public.google_ads_campaign_draft_keywords for each row execute function public.set_updated_at();
create trigger set_google_ads_campaign_draft_ads_updated_at before update on public.google_ads_campaign_draft_ads for each row execute function public.set_updated_at();
create trigger set_ga4_metrics_updated_at before update on public.ga4_metrics for each row execute function public.set_updated_at();
create trigger set_search_console_metrics_updated_at before update on public.search_console_metrics for each row execute function public.set_updated_at();
create trigger set_meta_accounts_updated_at before update on public.meta_accounts for each row execute function public.set_updated_at();
create trigger set_meta_pages_updated_at before update on public.meta_pages for each row execute function public.set_updated_at();
create trigger set_meta_instagram_accounts_updated_at before update on public.meta_instagram_accounts for each row execute function public.set_updated_at();
create trigger set_meta_ad_accounts_updated_at before update on public.meta_ad_accounts for each row execute function public.set_updated_at();
create trigger set_meta_campaigns_updated_at before update on public.meta_campaigns for each row execute function public.set_updated_at();
create trigger set_meta_leads_updated_at before update on public.meta_leads for each row execute function public.set_updated_at();
create trigger set_social_channels_updated_at before update on public.social_channels for each row execute function public.set_updated_at();
create trigger set_social_posts_updated_at before update on public.social_posts for each row execute function public.set_updated_at();
create trigger set_publishing_queue_updated_at before update on public.publishing_queue for each row execute function public.set_updated_at();
create trigger set_media_library_updated_at before update on public.media_library for each row execute function public.set_updated_at();
create trigger set_geo_checkins_updated_at before update on public.geo_checkins for each row execute function public.set_updated_at();
create trigger set_content_calendar_updated_at before update on public.content_calendar for each row execute function public.set_updated_at();
create trigger set_ai_generated_posts_updated_at before update on public.ai_generated_posts for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.company_members enable row level security;
alter table public.integrations enable row level security;
alter table public.growth_tasks enable row level security;
alter table public.ai_recommendations enable row level security;
alter table public.audit_logs enable row level security;
alter table public.google_accounts enable row level security;
alter table public.google_business_locations enable row level security;
alter table public.google_reviews enable row level security;
alter table public.google_business_posts enable row level security;
alter table public.google_business_photos enable row level security;
alter table public.google_ads_accounts enable row level security;
alter table public.google_ads_campaigns enable row level security;
alter table public.google_ads_search_terms enable row level security;
alter table public.negative_keyword_suggestions enable row level security;
alter table public.google_ads_campaign_drafts enable row level security;
alter table public.google_ads_campaign_draft_keywords enable row level security;
alter table public.google_ads_campaign_draft_ads enable row level security;
alter table public.ga4_metrics enable row level security;
alter table public.search_console_metrics enable row level security;
alter table public.meta_accounts enable row level security;
alter table public.meta_pages enable row level security;
alter table public.meta_instagram_accounts enable row level security;
alter table public.meta_ad_accounts enable row level security;
alter table public.meta_campaigns enable row level security;
alter table public.meta_leads enable row level security;
alter table public.social_channels enable row level security;
alter table public.social_posts enable row level security;
alter table public.publishing_queue enable row level security;
alter table public.media_library enable row level security;
alter table public.geo_checkins enable row level security;
alter table public.content_calendar enable row level security;
alter table public.ai_generated_posts enable row level security;

create policy "Members can view their companies" on public.companies
  for select using (public.is_company_member(id));
create policy "Admins can update their companies" on public.companies
  for update using (public.has_company_role(id, array['owner', 'admin']::public.company_member_role[]))
  with check (public.has_company_role(id, array['owner', 'admin']::public.company_member_role[]));

create policy "Users can view own profile" on public.profiles
  for select using (id = auth.uid());
create policy "Users can update own profile" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy "Users can insert own profile" on public.profiles
  for insert with check (id = auth.uid());

create policy "Members can view company members" on public.company_members
  for select using (public.is_company_member(company_id));
create policy "Admins can manage company members" on public.company_members
  for all using (public.has_company_role(company_id, array['owner', 'admin']::public.company_member_role[]))
  with check (public.has_company_role(company_id, array['owner', 'admin']::public.company_member_role[]));

-- Generic tenant policies. Service-role clients bypass RLS for background syncs.
create policy "Members can view integrations" on public.integrations for select using (public.is_company_member(company_id));
create policy "Admins can manage integrations" on public.integrations for all using (public.has_company_role(company_id, array['owner', 'admin']::public.company_member_role[])) with check (public.has_company_role(company_id, array['owner', 'admin']::public.company_member_role[]));

create policy "Members can view growth tasks" on public.growth_tasks for select using (public.is_company_member(company_id));
create policy "Managers can manage growth tasks" on public.growth_tasks for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Members can view ai recommendations" on public.ai_recommendations for select using (public.is_company_member(company_id));
create policy "Managers can manage ai recommendations" on public.ai_recommendations for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Members can view audit logs" on public.audit_logs for select using (public.is_company_member(company_id));
create policy "Admins can insert audit logs" on public.audit_logs for insert with check (public.can_manage_company(company_id));

create policy "Members can view google accounts" on public.google_accounts for select using (public.is_company_member(company_id));
create policy "Admins can manage google accounts" on public.google_accounts for all using (public.has_company_role(company_id, array['owner', 'admin']::public.company_member_role[])) with check (public.has_company_role(company_id, array['owner', 'admin']::public.company_member_role[]));

create policy "Members can view google business locations" on public.google_business_locations for select using (public.is_company_member(company_id));
create policy "Managers can manage google business locations" on public.google_business_locations for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Members can view google reviews" on public.google_reviews for select using (public.is_company_member(company_id));
create policy "Managers can manage google reviews" on public.google_reviews for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Members can view google business posts" on public.google_business_posts for select using (public.is_company_member(company_id));
create policy "Managers can manage google business posts" on public.google_business_posts for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Members can view google business photos" on public.google_business_photos for select using (public.is_company_member(company_id));
create policy "Managers can manage google business photos" on public.google_business_photos for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Members can view google ads accounts" on public.google_ads_accounts for select using (public.is_company_member(company_id));
create policy "Admins can manage google ads accounts" on public.google_ads_accounts for all using (public.has_company_role(company_id, array['owner', 'admin']::public.company_member_role[])) with check (public.has_company_role(company_id, array['owner', 'admin']::public.company_member_role[]));

create policy "Members can view google ads campaigns" on public.google_ads_campaigns for select using (public.is_company_member(company_id));
create policy "Managers can manage google ads campaigns" on public.google_ads_campaigns for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Members can view google ads search terms" on public.google_ads_search_terms for select using (public.is_company_member(company_id));
create policy "Managers can manage google ads search terms" on public.google_ads_search_terms for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Members can view negative keyword suggestions" on public.negative_keyword_suggestions for select using (public.is_company_member(company_id));
create policy "Managers can manage negative keyword suggestions" on public.negative_keyword_suggestions for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Members can view google ads campaign drafts" on public.google_ads_campaign_drafts for select using (public.is_company_member(company_id));
create policy "Managers can manage google ads campaign drafts" on public.google_ads_campaign_drafts for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Members can view google ads campaign draft keywords" on public.google_ads_campaign_draft_keywords for select using (public.is_company_member(company_id));
create policy "Managers can manage google ads campaign draft keywords" on public.google_ads_campaign_draft_keywords for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Members can view google ads campaign draft ads" on public.google_ads_campaign_draft_ads for select using (public.is_company_member(company_id));
create policy "Managers can manage google ads campaign draft ads" on public.google_ads_campaign_draft_ads for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Members can view ga4 metrics" on public.ga4_metrics for select using (public.is_company_member(company_id));
create policy "Managers can manage ga4 metrics" on public.ga4_metrics for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Members can view search console metrics" on public.search_console_metrics for select using (public.is_company_member(company_id));
create policy "Managers can manage search console metrics" on public.search_console_metrics for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Members can view meta accounts" on public.meta_accounts for select using (public.is_company_member(company_id));
create policy "Admins can manage meta accounts" on public.meta_accounts for all using (public.has_company_role(company_id, array['owner', 'admin']::public.company_member_role[])) with check (public.has_company_role(company_id, array['owner', 'admin']::public.company_member_role[]));

create policy "Members can view meta pages" on public.meta_pages for select using (public.is_company_member(company_id));
create policy "Managers can manage meta pages" on public.meta_pages for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Members can view meta instagram accounts" on public.meta_instagram_accounts for select using (public.is_company_member(company_id));
create policy "Managers can manage meta instagram accounts" on public.meta_instagram_accounts for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Members can view meta ad accounts" on public.meta_ad_accounts for select using (public.is_company_member(company_id));
create policy "Admins can manage meta ad accounts" on public.meta_ad_accounts for all using (public.has_company_role(company_id, array['owner', 'admin']::public.company_member_role[])) with check (public.has_company_role(company_id, array['owner', 'admin']::public.company_member_role[]));

create policy "Members can view meta campaigns" on public.meta_campaigns for select using (public.is_company_member(company_id));
create policy "Managers can manage meta campaigns" on public.meta_campaigns for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Members can view meta leads" on public.meta_leads for select using (public.is_company_member(company_id));
create policy "Managers can manage meta leads" on public.meta_leads for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Members can view social channels" on public.social_channels for select using (public.is_company_member(company_id));
create policy "Managers can manage social channels" on public.social_channels for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Members can view social posts" on public.social_posts for select using (public.is_company_member(company_id));
create policy "Managers can manage social posts" on public.social_posts for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Members can view publishing queue" on public.publishing_queue for select using (public.is_company_member(company_id));
create policy "Managers can manage publishing queue" on public.publishing_queue for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Members can view media library" on public.media_library for select using (public.is_company_member(company_id));
create policy "Managers can manage media library" on public.media_library for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Members can view geo checkins" on public.geo_checkins for select using (public.is_company_member(company_id));
create policy "Managers can manage geo checkins" on public.geo_checkins for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Members can view content calendar" on public.content_calendar for select using (public.is_company_member(company_id));
create policy "Managers can manage content calendar" on public.content_calendar for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));

create policy "Members can view ai generated posts" on public.ai_generated_posts for select using (public.is_company_member(company_id));
create policy "Managers can manage ai generated posts" on public.ai_generated_posts for all using (public.can_manage_company(company_id)) with check (public.can_manage_company(company_id));
