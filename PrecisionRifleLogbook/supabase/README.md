# Supabase

Two projects in the `toalg's Org` organization on Supabase:

| Project | Ref | Purpose | URL |
|---|---|---|---|
| prs-log-book-prod | `xznkzbowdzdcdvzyzobl` | Production — App Store users | https://xznkzbowdzdcdvzyzobl.supabase.co |
| prs-log-book-dev | `qmuivoboajwvgxqglabz` | Development — local + preview builds | https://qmuivoboajwvgxqglabz.supabase.co |

Both are on the free tier (us-east-2). Schema is identical and matches
`migrations/0001_init.sql` exactly.

## Applying schema changes

When the schema needs to evolve, add a new numbered migration here
(`0002_*.sql`, `0003_*.sql`, ...) and apply via the Supabase MCP:

```
mcp__supabase__apply_migration  project_id=qmuivoboajwvgxqglabz  name=...  query=...
mcp__supabase__apply_migration  project_id=xznkzbowdzdcdvzyzobl  name=...  query=...
```

Apply to **dev first**. Verify with `mcp__supabase__get_advisors`. Then apply
to prod. Never run untested SQL against prod.

## Verifying security posture

After any schema change:

```
mcp__supabase__get_advisors  project_id=<ref>  type=security
mcp__supabase__get_advisors  project_id=<ref>  type=performance
```

Expected steady state on both projects: 3 WARNs on
`authenticated_security_definer_function_executable` for
`delete_my_account`, `mark_rifle_cleaned`, `get_rifles_needing_cleaning`.
Those are intentional — they're meant to be callable by signed-in users
via PostgREST RPC.

ZERO errors. Any new ERROR-level lint result is a regression — fix before
shipping.
