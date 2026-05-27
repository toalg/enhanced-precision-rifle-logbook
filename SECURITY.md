# Security

## Reporting vulnerabilities

Open a private security advisory on GitHub:
https://github.com/toalg/enhanced-precision-rifle-logbook/security/advisories/new

Or email the maintainer directly. Do **not** open a public issue for security
problems.

## Token rotation — open TODO

The following tokens were generated during the App Store deployment setup
session and **must be rotated** because they appeared in chat transcripts
during interactive setup. They still work today; rotation is a hygiene
step, not an active incident.

| Token | Where it lives | Where to rotate |
|---|---|---|
| **Supabase personal access token** (`sbp_62de78…`) | `~/.claude.json` under `mcpServers.supabase.args` | https://supabase.com/dashboard/account/tokens — revoke the "Claude Code MCP" token, generate a new one, then re-add via `claude mcp remove supabase && claude mcp add supabase -- npx -y @supabase/mcp-server-supabase@latest --access-token=<new>` |
| **GitHub fine-grained PAT** (`github_pat_11AX…`) | `~/.claude.json` under `mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN` | https://github.com/settings/personal-access-tokens — revoke "Claude Code — Precision Rifle Logbook", generate a new one with the same scopes, then `claude mcp remove github && claude mcp add github --env GITHUB_PERSONAL_ACCESS_TOKEN=<new> -- npx -y @modelcontextprotocol/server-github` |
| **Sentry auth token** (`sntryu_dae527…`) | EAS env var `SENTRY_AUTH_TOKEN` (production, secret) | https://claude-code-precision-rifle-lo.sentry.io/settings/account/api/auth-tokens/ — revoke "eas-build-sourcemaps", create a replacement with same scopes (`org:read`, `project:read`, `project:releases`, `project:write`), then `eas env:create production --name SENTRY_AUTH_TOKEN --value <new> --visibility secret --force` |

Once rotated:
- [ ] Supabase token rotated
- [ ] GitHub PAT rotated
- [ ] Sentry auth token rotated
- [ ] Update this file: delete this section, leaving only the "Reporting
      vulnerabilities" block above.

## Recurring hygiene (post-launch)

- Rotate the Sentry auth token every 90 days minimum (sets a calendar
  cadence so a leaked token has a short half-life).
- Review the GitHub PAT scopes quarterly. Use fine-grained PATs only,
  never classic.
- Audit Supabase database advisors after every schema change:
  `mcp__supabase__get_advisors  project_id=<ref>  type=security`.
- Run `npm audit` before each App Store release; fix anything ≥ high.
