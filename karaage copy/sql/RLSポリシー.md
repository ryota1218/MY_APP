# RLSポリシー一覧

データベース（PostgreSQL / Supabase）の各テーブルに適用するRow Level Security (RLS) ポリシーの一覧です。

---

## 1. gantt (ガントチャート)

### SQL定義
```sql
-- すべての操作ポリシー 所属しているプロジェクトのメンバーのみ、ガントチャートの全操作が可能
alter policy "Allow members to manage gantt"
on "public"."gantt"
to authenticated
using (
  (project_id IN ( SELECT project_members.project_id
  FROM project_members
  WHERE (project_members.user_id = auth.uid())))
) with check (
  (project_id IN ( SELECT project_members.project_id
  FROM project_members
  WHERE (project_members.user_id = auth.uid())))
);
```

---

## 2. images (作成した図)

### SQL定義
```sql
-- すべての操作ポリシー 所属しているプロジェクトのメンバーのみ、図の全操作が可能
alter policy "Allow members to manage images"
on "public"."images"
to authenticated
using (
  (project_id IN ( SELECT project_members.project_id
  FROM project_members
  WHERE (project_members.user_id = auth.uid())))
) with check (
  (project_id IN ( SELECT project_members.project_id
  FROM project_members
  WHERE (project_members.user_id = auth.uid())))
);
```

---

## 3. project_members (プロジェクトメンバー)

### SQL定義
```sql
-- 参照ポリシー 所属しているプロジェクトのメンバーのみが一覧を参照可能
alter policy "Enable read access for project members"
on "public"."project_members"
to authenticated
using (
  (project_id IN ( SELECT project_members_1.project_id
  FROM project_members project_members_1
  WHERE (project_members_1.user_id = auth.uid())))
);

-- 追加ポリシー すでにプロジェクトのメンバーであるユーザーのみが新しいメンバーを追加可能
alter policy "Enable insert for existing project members"
on "public"."project_members"
to authenticated
with check (
  (project_id IN ( SELECT project_members_1.project_id
  FROM project_members project_members_1
  WHERE (project_members_1.user_id = auth.uid())))
);
```

---

## 4. projects (プロジェクト)

### SQL定義
```sql
-- 参照ポリシー 自分が所属しているプロジェクトのみを参照可能
alter policy "Enable read access for joined projects"
on "public"."projects"
to authenticated
using (
  (id IN ( SELECT project_members.project_id
  FROM project_members
  WHERE (project_members.user_id = auth.uid())))
);

-- 追加ポリシー 認証ユーザー本人のみプロジェクトを作成可能
alter policy "Enable insert for authenticated users"
on "public"."projects"
to authenticated
with check (
  (auth.uid() = account_id)
);
```

---

## 5. users (ユーザー情報)

### SQL定義
```sql
-- 参照ポリシー すべてのユーザーがユーザー情報を参照可能
alter policy "Enable read access for all users"
on "public"."users"
to public
using (
  true
);

-- 追加ポリシー 認証された本人のみがユーザー情報を新規登録可能
alter policy "Enable insert for authenticated users"
on "public"."users"
to public
with check (
  (auth.uid() = id)
);

-- 更新ポリシー 認証された本人のみがユーザー情報を更新可能
alter policy "Enable update for users based on id"
on "public"."users"
to public
using (
  (auth.uid() = id)
);
```

---

## 6. color (カラー設定)

### SQL定義
```sql
-- すべての操作ポリシー 所属しているプロジェクトのメンバーのみ、カラー設定の全操作が可能
alter policy "Allow members to manage colors"
on "public"."color"
to authenticated
using (
  (project_id IN ( SELECT project_members.project_id
  FROM project_members
  WHERE (project_members.user_id = auth.uid())))
) with check (
  (project_id IN ( SELECT project_members.project_id
  FROM project_members
  WHERE (project_members.user_id = auth.uid())))
);
```

---
