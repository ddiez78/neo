-- The previous "workspaces member read" policy required is_workspace_member(id)
-- to read a workspace row. createWorkspaceAction does an INSERT ... RETURNING *
-- and at that moment the creator is not yet in workspace_members (the member
-- row is inserted in a subsequent statement), so the RETURNING failed RLS
-- with "new row violates row-level security policy for table workspaces".
--
-- Fix: allow the creator to read rows they just created, in addition to
-- members of the workspace. This unblocks INSERT ... RETURNING * without
-- weakening access for other users.

drop policy if exists "workspaces member read" on public.workspaces;
create policy "workspaces member read" on public.workspaces
  for select
  using (
    created_by = auth.uid()
    or is_workspace_member(id)
  );
