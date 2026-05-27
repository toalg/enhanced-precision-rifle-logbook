# Changelog

All notable changes to the Precision Rifle Logbook project, in reverse
chronological order. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
this project's versioning kicks in at the v1.0 App Store launch.

## [Unreleased] — App Store deployment prep

Working branch: [`deployment/phase-1-hardening`](https://github.com/toalg/enhanced-precision-rifle-logbook/tree/deployment/phase-1-hardening) (12 commits ahead of `main`, all pushed).

### Status snapshot

| Area | Status |
|---|---|
| Production Supabase project | ✅ Live (`prs-log-book-prod` / `xznkzbowdzdcdvzyzobl`, us-east-2) |
| Dev Supabase project | ✅ Live (`prs-log-book-dev` / `qmuivoboajwvgxqglabz`, us-east-2) |
| Sentry React Native project | ✅ Live + DSN wired |
| EAS Build pipeline | ✅ Scaffolded, all 7 env vars set, project linked (`5212df0d-…`) |
| iOS native config | ✅ Bundle ID, privacy strings, encryption exemption |
| Codebase hardening (Phase 1) | ✅ Complete — env vars, no debug code, no Firebase, no dead premium gates |
| App Store compliance (Phase 2) | ✅ Account deletion + Legal section + Info.plist |
| App runs locally on iOS Simulator | ✅ Verified end-to-end with dev backend, admin login works |
| **Apple Developer enrollment** | ⏳ Pending (your action — 24-48hr lead) |
| App icon + screenshots + listing copy | ⏳ Phase 4 |
| TestFlight beta | ⏳ Blocked on Apple |
| Privacy/Terms pages deployed | ⏳ Blocked on hosting decision |

### Added

- **Production Supabase project** with hardened RLS schema covering 7 tables (users, rifle_profiles, shooting_sessions, ladder_tests, ladder_charges, user_settings, analytics_events), storage buckets (target-photos, user-avatars, exports), and 4 SECURITY DEFINER RPCs (handle_new_user, delete_my_account, mark_rifle_cleaned, get_rifles_needing_cleaning). 0 ERRORs, 3 intentional WARNs in security advisor.
- **Dev Supabase project** mirroring prod schema exactly. The original dev project was archived by Supabase after >90 days paused; a fresh one (`qmuivoboajwvgxqglabz`) was provisioned and the consolidated migration re-applied.
- **Sentry React Native crash reporting** wired via `src/services/sentry.js` — no-op when DSN missing, full SDK init + ErrorBoundary + perf instrumentation when present. Sentry project `precision-rifle-logbook-ios` in org `claude-code-precision-rifle-lo`.
- **Environment variable plumbing** via `react-native-config@1.6.1`. `.env.example` (committed), `.env.development` and `.env.production` (gitignored). Loud-fail at startup if Supabase config missing.
- **Account deletion flow** (Apple Guideline 5.1.1(v) compliance) with two-step Alert confirmation that calls the `delete_my_account()` Postgres RPC, then signs out → routes to AuthScreen via AuthContext.
- **Legal section in Settings** with Privacy Policy + Terms of Service buttons opening external URLs via `Linking.openURL`. URLs read from env (`PRIVACY_POLICY_URL`, `TERMS_OF_SERVICE_URL`).
- **EAS Build pipeline** — `eas.json` with development/preview/production profiles, `app.json` extended with Expo block (slug + bundle ID + version), `scripts/eas-build-pre-install.js` that materializes the `.env` file from EAS env vars in the cloud builder.
- **EAS production env vars** — APP_ENV, SUPABASE_URL, SUPABASE_ANON_KEY, SENTRY_DSN, PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL (plaintext) + SENTRY_AUTH_TOKEN (secret, for source-map uploads).
- **`SECURITY.md`** documenting token rotation TODO and vulnerability reporting flow.
- **`supabase/README.md`** documenting the two-project layout and migration procedure.
- **`supabase/migrations/0001_init.sql`** as canonical source-of-truth schema (consolidated from three scattered SQL files).
- **`babel-plugin-transform-remove-console`** for production builds — strips `console.log` but keeps `console.warn` / `console.error` so Sentry captures them.

### Changed

- **Bundle identifier** from React Native template placeholder (`org.reactjs.native.example.…`) to `com.glenntoal.precisionriflelogbook` for both Debug and Release configs. Matches Android `applicationId`.
- **`src/config/supabase.js`** — reads URL + anon key from `Config.SUPABASE_*` instead of hardcoded literals. Also dropped obsolete exports (`createTables`, `RLS_POLICIES`, `DAILY_NOTES`, `TEMP` bucket).
- **Premium gates removed for v1** — `LogbookService.isPremium` hardcoded to `true`, all `!isPremium` UI branches simplified. The `user_settings.premium_status` DB column is retained for v1.1 IAP re-introduction without migration.
- **`AnalyticsScreen`** — renamed "Premium Features" tab to "Ladder Analysis"; removed the `renderFreeTier` upgrade interstitial; loads ladder tests unconditionally.
- **`SettingsScreen`** — removed Premium Status card entirely; simplified Cloud Sync card (no more `disabled={!isPremium}` logic); Account Deletion and Legal sections added.
- **`devConfig.js`** — stripped hardcoded test user credentials (`developer`/`shooter`/`premium` with `testpass123` passwords). Only `bypassAuth` + `mockUser` knobs remain, both under `__DEV__` guards.
- **`App.tsx`** — removed `TestBackendScreen` import + `testSupabaseConnection()` debug call; Sentry init wired at module load; AppContent wrapped in `SentryErrorBoundary` with a branded "Something went wrong → Try again" fallback; default export wrapped in `Sentry.wrap()`.
- **`Info.plist`** — added `ITSAppUsesNonExemptEncryption=false` (export-compliance exemption, skips the per-release questionnaire).
- **Auth state** — separate dev + prod Supabase projects with isolated user tables. Email confirmation enabled in both via Auth dashboard.

### Removed

- **Firebase** (everything) — verified no `@react-native-firebase/*` npm packages, no Firebase pods, no `GoogleService-Info.plist`, no `google-services.json.backup`, no `FirebaseService.js`. Stale "Firebase Login/Register" comment in AuthScreen fixed.
- **17 stray debug scripts** from repo root: `test-auth-flow.js`, `test-auth-simple.js`, `test-supabase-connection.js`, `test-supabase-schema.js`, `debug-supabase.js`, `check-rls-policies.js`, `test-rls-fix.js`, `fix-rls-policies.sql`, `fix-rls-policies-complete.sql`, `apply-supabase-schema.js`, `rebuild-supabase-db.js`, `test-schema-fix.js`, `test-final-fix.js`, `test-profile-creation.js`, `test-build.js`, `check-table-structure.js`, `check-users-table.js`, `create-missing-user.js`, `get-correct-key.js`. 1714 lines deleted.
- **`TestBackendScreen`** screen + `src/utils/testSupabase.js` connection probe — orphaned dev-only code.
- **`daily_notes` table** (and `saveDailyNote` / `getDailyNote` service methods) — was a verbatim copy-paste from a trading journal app, never used by the rifle logbook code. Trading-specific columns (`market_focus`, `trading_notes`, `analytics_reports`) would have been awkward in privacy declarations.
- **Empty `NSLocationWhenInUseUsageDescription`** from Info.plist — empty privacy strings are an auto-rejection in App Review. Verified by code grep that the app uses zero location/camera/photo APIs.
- **Auto-login + test-user methods** from `SupabaseAuthService` — `DEV_TEST_USERS`, `autoLoginWithTestUser`, `getTestUsers`, `quickLogin`, `createTestUsers`. The `bypassAuth` + `mockUser` paths (no credentials) survive under `__DEV__` guards.
- **`src/database/supabase-schema.sql`** — obsolete schema file, superseded by `supabase/migrations/0001_init.sql`.

### Security

- **RLS enabled** on all 7 application tables in both dev + prod with policies enforcing `auth.uid() = user_id` for SELECT/INSERT/UPDATE/DELETE.
- **`rifle_cleaning_status` view** recreated `WITH (security_invoker = true)` so RLS applies to view queries (was a real ERROR-level lint).
- **`SECURITY DEFINER` functions hardened** — all have `SET search_path = public` (closes search-path injection), trigger-only functions revoked from PUBLIC/anon/authenticated, user-facing RPCs revoked from PUBLIC/anon and granted only to `authenticated`.
- **No secrets in source code** — Supabase credentials moved from hardcoded literals to env vars. `.env.*` files gitignored (except `.env.example`). EAS env vars store production secrets in the build server, never in the repo.

### Verified end-to-end

- App builds in Xcode 26.2 against iOS 26.2 SDK, installs and launches on iPhone 16 Pro simulator.
- AuthScreen renders cleanly — proving Sentry init, Supabase client init, ErrorBoundary, AuthContext, and react-native-config all wired correctly.
- Sign-in with seeded admin user `glenntoal2013@gmail.com` succeeds — auth flow + RLS + handle_new_user trigger all functional against the dev project.

---

## Roadmap — what's next

### Immediately actionable (no blockers)

- **Phase 4: Branding** — design 1024×1024 app icon (sport/hunting framing, NOT tactical), produce 8× App Store screenshots at 1290×2796, write listing copy. ~1-2 days of design work.
- **Privacy/Terms hosting** — generate policy text (Termly/iubenda/template), deploy to Cloudflare Pages on `precisionriflelogbook.app/privacy` and `/terms`. Hard requirement before submission.
- **CHANGELOG.md upkeep** — keep this file current as we ship.
- **CLAUDE.md refresh** — the existing one is 16 months stale and references Firebase as installed. Low priority, would speed up future sessions.

### Blocked on Apple Developer enrollment ($99/yr, 24-48hr review)

- **First EAS Build** — `cd PrecisionRifleLogbook && eas build --platform ios --profile production`. EAS auto-provisions distribution cert against Apple, builds IPA in ~15 min.
- **TestFlight upload** — `eas submit --platform ios --latest`.
- **Internal beta** — invite yourself + 1-2 trusted shooters via TestFlight.
- **External beta** — recruit 10-20 PRS/longrange community testers.
- **App Store Connect listing** — fill app privacy ("nutrition label"), age rating questionnaire, content rights, pricing (Free).

### v1.1 candidates (post-launch)

- **Garmin Xero C1 Pro CSV import** — table-stakes for serious PRS users. Needs sample CSV from real device + papaparse + file picker + mapping UI. ~4-6 hours.
- **Group size analysis feature** — already partially built on `feature/group-analysis-wip` branch (commit `b0d2b85`). Needs `UnifiedGroupAnalysis.ladder` branch finished + `renderGroupAnalysis()` completed.
- **IAP via RevenueCat** — restore the premium gates we stripped in Phase 1.4, gate cloud sync + analytics behind subscription. Revenue.
- **Password reset flow in-app** — currently users have to use Supabase dashboard for resets.
- **Custom SMTP** for auth emails so they don't look like generic Supabase notifications.
- **Sentry source-map upload** — wire into EAS Build post-build hook (auth token already set as EAS secret) so production stack traces are symbolicated.
- **Android port** — EAS Build can do this; Play Console signup is separate.

### Tracked TODOs

- **Token rotation** — see `SECURITY.md`. The Supabase MCP PAT, GitHub MCP PAT, and Sentry auth token all flowed through chat transcripts. Rotate before sharing the session log with anyone.
- **CLAUDE.md is stale** — references Firebase as half-installed (it's fully removed) and other outdated state.

---

## Where we left off — for tomorrow

1. **Branch `deployment/phase-1-hardening`** has 12 commits on top of `main`, all pushed. When ready, open a PR from it into `main`.
2. **App is verified running locally** on iOS Simulator (iPhone 16 Pro, iOS 18.5) against the dev Supabase project. Login works with seeded user `glenntoal2013@gmail.com`.
3. **Apple Developer enrollment is the single biggest blocker.** Submit `developer.apple.com/programs/enroll/` to start the 24-48hr clock. Phase 3 (first EAS Build), Phase 5 (TestFlight), and Phase 6 (submission) all need this.
4. **Pick the next focus.** Three options:
   - **Phase 4 branding** — start the icon design conversation, generate concepts, decide direction.
   - **Privacy/Terms hosting** — generate policy text, deploy to Cloudflare Pages.
   - **Garmin CSV import** — share a sample CSV from your chronograph, I'll build it.
5. **First thing next session:** I'll open `SECURITY.md` and confirm token rotations are done (task #29 on the list reminds me).

---

## Commit log (deployment/phase-1-hardening)

```
4ce6083 docs: add SECURITY.md with token rotation TODO
19119f5 chore(eas): link to Expo project (eas init)
ac4ddda feat(build): EAS Build pipeline scaffolding (Phase 3)
62589c4 feat(ios): fix Info.plist privacy strings + production bundle ID
14fd240 feat: account deletion + legal section in Settings
c418380 feat: wire Sentry crash reporting + ErrorBoundary
0e752a9 feat: strip premium gates - v1 ships fully free
7cfde01 chore: strip dev/debug code + add prod console.log stripper
44eeac6 feat(config): env-driven Supabase config + dead code cleanup
8e2e906 chore: remove final Firebase remnants
7c83f22 chore: remove 17 stray dev scripts from repo root
```

Plus on `main` (the mobile work that was waiting in your working tree):

```
e4e4984 feat(db): production schema migration with security hardening
79ababb feat(mobile): ship-ready features from mobile dev session
```

Plus on `feature/group-analysis-wip` (incomplete, deferred to v1.1):

```
b0d2b85 wip: group size analysis feature (incomplete)
```
