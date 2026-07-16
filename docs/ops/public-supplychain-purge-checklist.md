# Public SupplyChain+ — secret ref purge checklist

**Date:** 2026-07-16  
**Operator:** automated local purge (Cursor agent)  
**Repo:** `vishalkdotcom/supplychain-plus` (renamed from `wovo`)  
**Spec context:** public-supplychain-plus (purge ticket); spec files were not modified.

## Patterns scanned (no values recorded here)

| Pattern | Purpose |
|--------|---------|
| `npg_` | Neon role password prefix |
| `ep-shiny-mountain-a177kqeb` | Neon endpoint from local-only branch |
| `rds-mssql.c82p8fd7rdnk` | AWS RDS SQL Server hostname |
| `13.213.70.189` | MySQL host |
| `net_read_offline` | SQL Server account name |
| `moodle_admin_offline` | MySQL account name |

## Evidence before purge

### Local-only Neon credential branch

- **Branch:** `backup-neon-oracle` (never on `origin`; confirmed via `git ls-remote` and `git branch -r --contains 6c91f7e`).
- **Tip commit:** `eb3f8f3` (2026-04-03).
- **Secret introduced:** commit `6c91f7e` (2026-04-03) — `feat: decouple mssql types for Vercel-safe builds`.
- **File:** `scripts/push-drizzle-to-neon.ts` — hardcoded `NEON_CONNECTION_STRING` fallback with Neon password and pooler host `ep-shiny-mountain-a177kqeb-pooler.ap-southeast-1.aws.neon.tech`, database `neondb`.

### Remote production hostname / offline account branch

- **Branch:** `origin/claude/brave-pike` (local tracking branch also named `claude/brave-pike`).
- **Tip commit:** `73ec43c`.
- **Primary file:** `.env.example` — production RDS SQL Server hostname, MySQL IP, offline account names (`net_read_offline`, `moodle_admin_offline`); password fields empty in example.
- **Additional matches on that branch:** `init/mysql/01_schema.sql`, `schemas/moodle_schema.sql` (same hostname/account patterns).

### Other local branches (same hostname patterns, not on origin)

- `claude/sleepy-sammet` (tip `19fa1d4`)
- `claude/wizardly-galileo` (tip `19fa1d4`)

No other `origin/*` branch tips matched the scan patterns before deletion.

## Actions taken

| Action | Target | Result |
|--------|--------|--------|
| Delete local branch | `backup-neon-oracle` | Deleted (`git branch -D`) |
| Delete local branch | `claude/brave-pike` | Deleted |
| Delete remote branch | `origin/claude/brave-pike` | Deleted (`git push origin --delete claude/brave-pike`) |
| Delete local branch | `claude/sleepy-sammet` | Deleted (hostname exposure; was not on origin) |
| Delete local branch | `claude/wizardly-galileo` | Deleted (hostname exposure; was not on origin) |
| Prune | `git fetch origin --prune` | Stale remote-tracking refs cleaned |

**Not done (per instructions):** history rewrite, repo visibility change, git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>" of this note, Neon provider API rotation.

## Re-scan results (after purge)

- **Remote branch tips (`origin/*`):** CLEAN for all patterns above.
- **Local branch tips:** CLEAN for all patterns above.
- **Remote tags:** none present.
- **History pickaxe (`git log -G` per remaining `origin/*` ref):** no matches reported before scan completed.

Re-run tip scan (PowerShell):

```powershell
cd c:\vishal\xp\wovo
$patterns = @('npg_','rds-mssql\.c82p8fd7rdnk','13\.213\.70\.189','net_read_offline','moodle_admin_offline','ep-shiny-mountain-a177kqeb')
git branch -r --format='%(refname:short)' | Where-Object { $_ -notmatch 'HEAD' } | ForEach-Object {
  $br = $_
  foreach ($p in $patterns) {
    if (git grep -l -E $p $br 2>$null) { Write-Output "$br :: $p" }
  }
}
```

Expect no output.

## Owner actions still required

### 1. Rotate Neon credential — DONE

Owner rotated the Neon role password for endpoint `ep-shiny-mountain-a177kqeb` and updated local + Vercel env (2026-07-16). Old password should no longer authenticate.

### 2. Infra exposure from deleted `claude/brave-pike` (recommended)

Hostnames and offline account **names** were public on the deleted remote branch. Passwords in `.env.example` were blank, but names + hosts aid targeting.

- Review AWS RDS (`rds-mssql…amazonaws.com`) and MySQL (`13.213.70.189`) access logs and security groups.
- Confirm `net_read_offline` and `moodle_admin_offline` still follow least privilege; rotate passwords if there is any chance real secrets were ever committed elsewhere.

### 3. Local reflog (optional hygiene)

Deleted branches may remain in local reflog until expiry/`git gc`. On machines that had `backup-neon-oracle`, consider `git reflog expire` / `git gc` after confirming no need to recover, or re-clone.

## Acceptance criteria status

| Criterion | Status |
|-----------|--------|
| Neon password rotated/revoked at provider | **DONE** (owner rotated; local + Vercel env updated 2026-07-16) |
| Local secret branch deleted, not on origin | **DONE** |
| Remote hostname/offline-account branches deleted | **DONE** (`claude/brave-pike`) |
| Re-scan clean on remaining remotes | **DONE** |
| Checklist note (no secret values) | **DONE** (this file) |
