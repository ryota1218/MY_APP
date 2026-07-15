# RLSポリシー一覧

データベース（PostgreSQL / Supabase）の各テーブルに適用するRow Level Security (RLS) ポリシーの一覧です。

---

## 1. gantt (ガントチャート)

### SQL定義
```sql
-- 参照ポリシー (SELECT): 所属しているプロジェクトのメンバーなら参照可能
create policy "Allow select for project members"
on "public"."gantt"
for select
to authenticated
using (
  (project_id IN ( SELECT project_members.project_id FROM project_members WHERE (project_members.user_id = auth.uid()) ))
);

-- 追加ポリシー (INSERT): 所属しているプロジェクトのメンバーなら追加可能
create policy "Allow insert for project members"
on "public"."gantt"
for insert
to authenticated
with check (
  (project_id IN ( SELECT project_members.project_id FROM project_members WHERE (project_members.user_id = auth.uid()) ))
);

-- 更新ポリシー (UPDATE): 所属しているプロジェクトのメンバーなら更新可能
create policy "Allow update for project members"
on "public"."gantt"
for update
to authenticated
using (
  (project_id IN ( SELECT project_members.project_id FROM project_members WHERE (project_members.user_id = auth.uid()) ))
) with check (
  (project_id IN ( SELECT project_members.project_id FROM project_members WHERE (project_members.user_id = auth.uid()) ))
);

-- 削除ポリシー (DELETE): 所属しているプロジェクトのメンバーなら削除可能
create policy "Allow delete for project members"
on "public"."gantt"
for delete
to authenticated
using (
  (project_id IN ( SELECT project_members.project_id FROM project_members WHERE (project_members.user_id = auth.uid()) ))
);
```

---

## 2. images (作成した図)

### SQL定義
```sql
-- 参照ポリシー (SELECT): 所属しているプロジェクトのメンバーなら参照可能
create policy "Allow select for project members"
on "public"."images"
for select
to authenticated
using (
  (project_id IN ( SELECT project_members.project_id FROM project_members WHERE (project_members.user_id = auth.uid()) ))
);

-- 追加ポリシー (INSERT): 所属しているプロジェクトのメンバーなら追加可能
create policy "Allow insert for project members"
on "public"."images"
for insert
to authenticated
with check (
  (project_id IN ( SELECT project_members.project_id FROM project_members WHERE (project_members.user_id = auth.uid()) ))
);

-- 更新ポリシー (UPDATE): 所属しているプロジェクトのメンバーなら更新可能
create policy "Allow update for project members"
on "public"."images"
for update
to authenticated
using (
  (project_id IN ( SELECT project_members.project_id FROM project_members WHERE (project_members.user_id = auth.uid()) ))
) with check (
  (project_id IN ( SELECT project_members.project_id FROM project_members WHERE (project_members.user_id = auth.uid()) ))
);

-- 削除ポリシー (DELETE): 所属しているプロジェクトのメンバーなら削除可能
create policy "Allow delete for project members"
on "public"."images"
for delete
to authenticated
using (
  (project_id IN ( SELECT project_members.project_id FROM project_members WHERE (project_members.user_id = auth.uid()) ))
);
```

---

## 3. project_members (プロジェクトメンバー)

### SQL定義
```sql
-- 参照ポリシー (SELECT): 認証されたユーザーなら誰でも参照可能（プロジェクト情報は projects テーブルの RLS で保護されます）
create policy "Enable read access for project members"
on "public"."project_members"
for select
to authenticated
using (
  true
);

-- 追加ポリシー (INSERT): 自分自身の追加、またはプロジェクトの作成者（オーナー）のみ追加可能
create policy "Enable insert for project members"
on "public"."project_members"
for insert
to authenticated
with check (
  (user_id = auth.uid())
  OR
  (project_id IN ( SELECT id FROM projects WHERE account_id = auth.uid() ))
);

-- 更新ポリシー (UPDATE): プロジェクト作成者(オーナー)のみがメンバーの役割(role)を更新可能
create policy "Enable update for project owners"
on "public"."project_members"
for update
to authenticated
using (
  (project_id IN ( SELECT id FROM projects WHERE account_id = auth.uid() ))
) with check (
  (project_id IN ( SELECT id FROM projects WHERE account_id = auth.uid() ))
);

-- 更新ポリシー (UPDATE) 追加分: 譲渡承認待ちのユーザー(pending_owner_id)もメンバー権限を更新可能
create policy "Enable update project_members for pending owner"
on "public"."project_members"
for update
to authenticated
using (
  project_id IN (SELECT id FROM projects WHERE pending_owner_id = auth.uid())
) with check (
  project_id IN (SELECT id FROM projects WHERE pending_owner_id = auth.uid())
);

-- 削除ポリシー (DELETE): プロジェクト作成者(オーナー)がメンバーを削除、またはメンバー本人が脱退可能
create policy "Enable delete for owners or members themselves"
on "public"."project_members"
for delete
to authenticated
using (
  (project_id IN ( SELECT id FROM projects WHERE account_id = auth.uid() ))
  OR
  (user_id = auth.uid())
);
```


---

## 4. projects (プロジェクト)

### SQL定義
```sql
-- 参照ポリシー (SELECT): 自分が所属している、または自分が作成したプロジェクトのみを参照可能
create policy "Enable read access for joined projects"
on "public"."projects"
for select
to authenticated
using (
  (id IN ( SELECT project_members.project_id FROM project_members WHERE (project_members.user_id = auth.uid()) ))
  OR
  (account_id = auth.uid())
);

-- 追加ポリシー (INSERT): 認証ユーザー本人のみプロジェクトを作成可能
create policy "Enable insert for authenticated users"
on "public"."projects"
for insert
to authenticated
with check (
  (auth.uid() = account_id)
);

-- 更新ポリシー (UPDATE): プロジェクト作成者(オーナー)のみがプロジェクト情報を更新可能
create policy "Enable update for project owners"
on "public"."projects"
for update
to authenticated
using (
  (account_id = auth.uid())
) with check (
  (account_id = auth.uid())
);

-- 更新ポリシー (UPDATE) 追加分: 譲渡承認待ちのユーザー(pending_owner_id)もプロジェクト情報を更新可能
create policy "Enable update projects for pending owner"
on "public"."projects"
for update
to authenticated
using (
  pending_owner_id = auth.uid()
) with check (
  pending_owner_id = auth.uid()
);

-- 削除ポリシー (DELETE): プロジェクト作成者(オーナー)のみがプロジェクトを削除可能
create policy "Enable delete for project owners"
on "public"."projects"
for delete
to authenticated
using (
  (account_id = auth.uid())
);
```

---

## 5. users (ユーザー情報)

### SQL定義
```sql
-- 参照ポリシー (SELECT): すべてのユーザーがユーザー情報を参照可能
create policy "Enable read access for all users"
on "public"."users"
for select
to public
using (
  true
);

-- 追加ポリシー (INSERT): 認証された本人のみがユーザー情報を新規登録可能
create policy "Enable insert for authenticated users"
on "public"."users"
for insert
to public
with check (
  (auth.uid() = id)
);

-- 更新ポリシー (UPDATE): 認証された本人のみがユーザー情報を更新可能
create policy "Enable update for users based on id"
on "public"."users"
for update
to public
using (
  (auth.uid() = id)
);

-- 削除ポリシー (DELETE): 認証された本人のみがユーザー情報を削除可能
create policy "Enable delete for users based on id"
on "public"."users"
for delete
to public
using (
  (auth.uid() = id)
);
```

---

## 6. colors (カラー設定)

### SQL定義
```sql
-- 参照ポリシー (SELECT): 自分の設定、かつ所属プロジェクトのメンバーなら参照可能
create policy "Allow select for owner members"
on "public"."colors"
for select
to authenticated
using (
  (auth.uid() = user_id)
  and
  (project_id IN ( SELECT project_members.project_id FROM project_members WHERE (project_members.user_id = auth.uid()) ))
);

-- 追加ポリシー (INSERT): 自分の設定として、かつ所属プロジェクトのメンバーなら追加可能
create policy "Allow insert for owner members"
on "public"."colors"
for insert
to authenticated
with check (
  (auth.uid() = user_id)
  and
  (project_id IN ( SELECT project_members.project_id FROM project_members WHERE (project_members.user_id = auth.uid()) ))
);

-- 更新ポリシー (UPDATE): 自分の設定として、かつ所属プロジェクトのメンバーなら更新可能
create policy "Allow update for owner members"
on "public"."colors"
for update
to authenticated
using (
  (auth.uid() = user_id)
  and
  (project_id IN ( SELECT project_members.project_id FROM project_members WHERE (project_members.user_id = auth.uid()) ))
) with check (
  (auth.uid() = user_id)
  and
  (project_id IN ( SELECT project_members.project_id FROM project_members WHERE (project_members.user_id = auth.uid()) ))
);
```
