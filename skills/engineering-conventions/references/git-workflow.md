# Git Workflow

Complete guide to the branching, merge and branch protection workflow for `myapp`.


---

## Branch structure

```
main          ← production — always deployable, only via PR
dev           ← integration — base for all features
feat/xxx      ← new feature (ephemeral, from dev)
fix/xxx       ← bugfix (ephemeral, from dev)
```

### Branch naming

Follow the same pattern as conventional commits:

```bash
feat/product-order-flow
feat/discount-rules
fix/image-pipeline-timeout
fix/reviews-score-calculation
refactor/order-domain-model
chore/update-dependencies
```

---

## Daily workflow

```
1. Always start from an up-to-date dev
   git checkout dev && git pull

2. Create a feature or fix branch
   git checkout -b feat/descriptive-name

3. Work with conventional commits
   git commit -m "feat(products): add discount calculation"

4. Open PR: feat/xxx → dev  (Squash and merge)

5. When dev is stable → PR: dev → main  (Merge commit)
   This triggers the automatic deploy to production
```

---

## Merge strategy

| PR               | Method               | Why                                                                 |
| ---------------- | -------------------- | ------------------------------------------------------------------- |
| `feat/*` → `dev` | **Squash and merge** | One clean commit per feature: removes "wip", "saving", "fix typo"   |
| `fix/*` → `dev`  | **Squash and merge** | Same: one commit per fix                                            |
| `dev` → `main`   | **Merge commit**     | Explicit mark of each release in the production history             |

**Rebase and merge is disabled.**

The branch names and merge table below are defaults for the example repository, not universal authority. Follow the active project's `AGENTS.md`, branch protection, PR template and CI for its actual rules. The user must explicitly authorize each parent-branch or remote mutation; a named push/PR authorization does not implicitly authorize a merge. Generic skills do not add issue-link or changed-line requirements that the target repository does not have.

### Worktree phases and child PRs

Parallel task branches may be integrated into their feature/fix parent before the final PR. Use the parent and integration strategy recorded in the plan or explicitly authorized by the user; do not assume a child `refactor/*` PR follows the same route as `feat/*` → `dev`. Remote push, PR creation and PR merge are individually scoped operations. Target-repository rules and current user authorization take precedence over generic skill defaults.

---

## Branch Protection Rules

### `main` — Production

| Rule                                                   | Value                     |
| ------------------------------------------------------ | ------------------------- |
| Require a pull request before merging                  | ✅                        |
| Required approvals                                     | 0 (solo dev)              |
| Dismiss stale PR approvals when new commits are pushed | ✅                        |
| Require status checks to pass                          | ✅                        |
| Required status checks                                 | `ci / api`, `ci / client` |
| Require branches to be up to date before merging       | ✅                        |
| Do not allow bypassing the above settings              | ✅                        |
| Allow force pushes                                     | ❌                        |
| Allow deletions                                        | ❌                        |

### `dev` — Integration

| Rule                                             | Value                     |
| ------------------------------------------------ | ------------------------- |
| Require a pull request before merging            | ✅                        |
| Required approvals                               | 0                         |
| Require status checks to pass                    | ✅                        |
| Required status checks                           | `ci / api`, `ci / client` |
| Require branches to be up to date before merging | ✅                        |
| Allow force pushes                               | ❌                        |
| Allow deletions                                  | ❌                        |

---

## How to enable Branch Protection on GitHub

### Option A — Web interface (manual)

1. Go to `github.com/AbrahamVilchesDeLaCruz/myapp`
2. **Settings** → **Branches** → **Add branch ruleset**
3. In **Branch name pattern** write `main` (repeat for `dev`)
4. Enable the rules from the table above
5. **Save changes**

### Option B — GitHub CLI (recommended)

```bash
# Branch protection for main
gh api repos/AbrahamVilchesDeLaCruz/myapp/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["ci / api","ci / client"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":0,"dismiss_stale_reviews":true}' \
  --field restrictions=null

# Branch protection for dev
gh api repos/AbrahamVilchesDeLaCruz/myapp/branches/dev/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["ci / api","ci / client"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":0}' \
  --field restrictions=null
```

> ⚠️ The status checks (`ci / api`, `ci / client`) must exist before enabling this protection: run the CI at least once first.

### Option C — GitHub CLI rulesets (new API, recommended for new repos)

```bash
gh api repos/AbrahamVilchesDeLaCruz/myapp/rulesets \
  --method POST \
  --field name="protect-main" \
  --field target="branch" \
  --field enforcement="active" \
  --field conditions='{"ref_name":{"include":["refs/heads/main"],"exclude":[]}}' \
  --field rules='[
    {"type":"deletion"},
    {"type":"non_fast_forward"},
    {"type":"pull_request","parameters":{"required_approving_review_count":0,"dismiss_stale_reviews_on_push":true}},
    {"type":"required_status_checks","parameters":{"required_status_checks":[{"context":"ci / api"},{"context":"ci / client"}],"strict_required_status_checks_policy":true}}
  ]'
```

---

## Configure merge strategies on GitHub

**Settings** → **General** → **Pull Requests**:

```
✅ Allow merge commits        ← for dev → main
✅ Allow squash merging       ← for feat/* → dev
❌ Allow rebase merging       ← disabled
```

Default commit message for squash: **Pull request title**: uses the PR title as the commit message.

---

## Resulting history

```
# git log --oneline on main
a1b2c3d (HEAD → main) Merge pull request #12 from dev  ← release
e4f5g6h Merge pull request #8 from dev                 ← previous release

# git log --oneline on dev
i7j8k9l feat(reviews): add rating score
m0n1o2p feat(products): implement discount rules
q3r4s5t feat(auth): add JWT authentication
```
