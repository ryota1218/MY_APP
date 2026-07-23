-- ============================================================
-- KFC 上流工程サポートツール データベース定義
-- DB: PostgreSQL
-- ============================================================

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

-- ============================================================
-- ユーザー・プロジェクト管理
-- ============================================================

CREATE TABLE public.users (
  id uuid NOT NULL,
  name text NOT NULL,
  create_at timestamp with time zone NOT NULL DEFAULT now(),
  update_at timestamp with time zone NOT NULL DEFAULT now(),
  icon text,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  name text NOT NULL,
  pending_owner_id uuid,
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.users(id),
  CONSTRAINT projects_pending_owner_id_fkey FOREIGN KEY (pending_owner_id) REFERENCES public.users(id)
);

CREATE TABLE public.project_members (
  project_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'editor'::text,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT project_members_pkey PRIMARY KEY (project_id, user_id),
  CONSTRAINT project_members_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT project_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- ============================================================
-- 作成した図（システム構成図、UML等）
-- ============================================================

CREATE TABLE public.images (
  id uuid NOT NULL,
  project_id uuid NOT NULL,
  name text NOT NULL,
  json text NOT NULL,
  create_at timestamp without time zone DEFAULT now(),
  update_att timestamp with time zone DEFAULT now(),
  stats text NOT NULL,
  chart_type text NOT NULL DEFAULT 'システム構成図'::text,
  CONSTRAINT images_pkey PRIMARY KEY (id),
  CONSTRAINT images_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);

-- ============================================================
-- カラー設定
-- ============================================================

CREATE TABLE public.colors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid NOT NULL,
  main text NOT NULL DEFAULT '#f8fafc'::text,
  sub text NOT NULL DEFAULT '#ffffff'::text,
  accent text NOT NULL DEFAULT '#0ea5e9'::text,
  CONSTRAINT colors_pkey PRIMARY KEY (id),
  CONSTRAINT colors_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT colors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE
) TABLESPACE pg_default;


-- ============================================================
-- ガントチャート
-- ============================================================

CREATE TABLE public.gantt (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid,
  json text NOT NULL,
  CONSTRAINT gantt_pkey PRIMARY KEY (id),
  CONSTRAINT gantt_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);

-- ============================================================
-- その他（テスト用）
-- ============================================================

CREATE TABLE public.test (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text,
  image_path text,
  CONSTRAINT test_pkey PRIMARY KEY (id)
);
