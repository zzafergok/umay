---
name: git-workflow-skill
description: Use Git safely for commits, interactive rebases, cherry-picks, bisect, worktrees, conflict resolution, and reflog recovery. Use when managing repository history, splitting commits, isolating hotfixes, or diagnosing regressions.
---

# Git Workflow Skill

Maintain clean, bisectable history and recover safely from Git mistakes.

## 1. Inspect Before Mutating

Always check working tree state before staging, committing, or rewriting history:

```bash
git status --short
git diff --stat
git log --oneline -5
```

Never discard or overwrite unrelated user changes; stage explicit files rather than blind `git add -A` when unrelated edits exist.

## 2. Commit Discipline

- Keep commits atomic: separate refactoring, formatting, and distinct features/fixes.
- Write imperative summaries focused on **what** and **why** (`Fix timezone boundary in expiry calculation`).

## 3. Everyday Safe Operations

- **Branch history cleanup:** `git rebase -i $(git merge-base HEAD main)` (`squash`/`fixup`/`reword`), then `git push --force-with-lease` (never `--force` blindly on shared branches).
- **Hotfix propagation:** `git cherry-pick <sha>` (use `-n` to review before committing).
- **Regression hunting:** `git bisect start HEAD <good-tag>` and `git bisect run npm test`, finishing with `git bisect reset`.
- **Parallel work:** `git worktree add ../repo-hotfix -b hotfix/name main` to test or patch without disturbing the main worktree; clean up with `git worktree remove`.

## 4. Conflicts & Recovery

- Resolve conflicts deliberately — inspect both sides rather than defaulting to `ours`/`theirs`.
- Recover lost commits or reset mistakes via `git reflog` and `git branch recovered <sha>` before running destructive commands.
