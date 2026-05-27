#!/usr/bin/env node
/**
 * EAS Build pre-install hook.
 *
 * Runs in the cloud builder BEFORE `pod install` / `npm install`.
 * Pulls env vars from the EAS Build environment (set via `eas env:create`)
 * and writes them to a .env file that react-native-config can read at
 * bundle time.
 *
 * Why this exists:
 * - .env.development and .env.production are gitignored (good, they contain
 *   secrets). They are NOT in the source tarball EAS uses.
 * - react-native-config reads from a .env file at build time, not from
 *   process.env at runtime.
 * - So we re-materialize the file in the EAS builder from EAS env vars.
 *
 * To set EAS env vars (one-time, from your local machine):
 *   eas env:create production --name SUPABASE_URL --value https://xznkzbowdzdcdvzyzobl.supabase.co
 *   eas env:create production --name SUPABASE_ANON_KEY --value sb_publishable_Ag7uFK...
 *   eas env:create production --name SENTRY_DSN --value https://c7482...
 *   eas env:create production --name SENTRY_AUTH_TOKEN --value <secret>  --secret
 *   eas env:create production --name PRIVACY_POLICY_URL --value https://precisionriflelogbook.app/privacy
 *   eas env:create production --name TERMS_OF_SERVICE_URL --value https://precisionriflelogbook.app/terms
 *
 * (Repeat with `preview` and `development` for the other profiles, or share
 * via eas.json `env` block for non-secrets.)
 */

const fs = require('fs');
const path = require('path');

const ENV_KEYS = [
  'APP_ENV',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SENTRY_DSN',
  'PRIVACY_POLICY_URL',
  'TERMS_OF_SERVICE_URL',
];

const profile = process.env.EAS_BUILD_PROFILE || 'production';
const envFile = profile === 'development' ? '.env.development' : '.env.production';
const outputPath = path.join(process.cwd(), envFile);

const missing = [];
const lines = [];

for (const key of ENV_KEYS) {
  const value = process.env[key];
  if (value === undefined || value === '') {
    missing.push(key);
    lines.push(`${key}=`);
  } else {
    lines.push(`${key}=${value}`);
  }
}

// APP_ENV defaults from build profile if not explicitly set
if (!process.env.APP_ENV) {
  const idx = lines.findIndex((l) => l.startsWith('APP_ENV='));
  lines[idx] = `APP_ENV=${profile === 'development' ? 'development' : 'production'}`;
}

fs.writeFileSync(outputPath, lines.join('\n') + '\n');

console.log(`[eas-build-pre-install] Wrote ${envFile} for profile=${profile}`);
console.log(`[eas-build-pre-install]   Keys set:     ${ENV_KEYS.length - missing.length}`);
if (missing.length) {
  console.log(`[eas-build-pre-install]   Keys missing: ${missing.join(', ')}`);
  console.log(`[eas-build-pre-install]   Set them with: eas env:create ${profile} --name <KEY> --value <VALUE>`);
}
