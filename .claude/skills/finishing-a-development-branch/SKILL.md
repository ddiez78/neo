---
name: finishing-a-development-branch
description: Use when implementation is complete, all tests pass, and you need to decide how to integrate the work - guides completion of development work by presenting structured options for merge, PR, or cleanup
---

# Finishing a Development Branch

## Overview

Guide completion of development work by presenting clear options and handling chosen workflow.

**Core principle:** Verify tests then Detect environment then Present options then Execute choice then Clean up.

**Announce at start:** "I am using the finishing-a-development-branch skill to complete this work."

## Step 1: Verify Tests

Run the project test suite. If tests fail, stop and do not proceed until fixed.

## Step 2: Detect Environment

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
```

This determines which menu to show and how cleanup works.

## Step 3: Determine Base Branch

```bash
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

## Step 4: Present Options

**Normal repo - present exactly these 4 options:**

1. Merge back to base branch locally
2. Push and create a Pull Request
3. Keep the branch as-is (I will handle it later)
4. Discard this work

**Detached HEAD - present exactly these 3 options (no merge):**

1. Push as new branch and create a Pull Request
2. Keep as-is (I will handle it later)
3. Discard this work

## Step 5: Execute Choice

**Option 1 (Merge locally):** cd to main repo root, checkout base, pull, merge feature branch, verify tests pass, then cleanup worktree, then delete branch.

**Option 2 (Push and PR):** Push branch, create PR with gh pr create. Do NOT clean up worktree.

**Option 3 (Keep as-is):** Report branch and worktree preserved. Do not cleanup.

**Option 4 (Discard):** Require typed "discard" confirmation first. Then cleanup worktree, force-delete branch.

## Step 6: Cleanup Workspace (Options 1 and 4 only)

If worktree path is under .worktrees/, worktrees/, or ~/.config/superpowers/worktrees/ - we own cleanup:

```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
git worktree remove "$WORKTREE_PATH"
git worktree prune
```

Otherwise do NOT remove the worktree (harness owns it).

## Red Flags

Never:
- Proceed with failing tests
- Delete work without confirmation
- Force-push without explicit request
- Remove a worktree before confirming merge success
- Run git worktree remove from inside the worktree
- Clean up worktrees you did not create

Always:
- Verify tests before offering options
- Present exactly 4 options (or 3 for detached HEAD)
- Get typed confirmation for Option 4
- cd to main repo root before worktree removal
- Run git worktree prune after removal
