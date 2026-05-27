/**
 * Sentry crash reporting + performance monitoring.
 *
 * Init reads SENTRY_DSN and APP_ENV from .env via react-native-config.
 * If SENTRY_DSN is missing (e.g. fresh dev clone, or .env.production
 * not yet filled with the real DSN), init is a no-op and the SDK's
 * capture* methods become harmless logs.
 *
 * Source-map uploads for production releases are wired via EAS Build hooks
 * (configured in Phase 3) using SENTRY_AUTH_TOKEN.
 */

import * as Sentry from '@sentry/react-native';
import Config from 'react-native-config';

let initialized = false;

export const initSentry = () => {
  if (initialized) return;

  const dsn = Config.SENTRY_DSN;
  if (!dsn) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[sentry] SENTRY_DSN not set — crash reporting disabled. ' +
        'Set it in .env.development or .env.production to enable.');
    }
    initialized = true;
    return;
  }

  Sentry.init({
    dsn,
    environment: Config.APP_ENV || (__DEV__ ? 'development' : 'production'),
    debug: __DEV__,
    // Capture 10% of transactions in prod for perf monitoring; nothing in dev.
    tracesSampleRate: __DEV__ ? 0 : 0.1,
    // Capture 10% of those transactions as profiles.
    profilesSampleRate: __DEV__ ? 0 : 0.1,
    // Auto-restart broken sessions.
    enableAutoSessionTracking: true,
    // Tag every event with the app version so we can correlate to releases.
    // (release is set automatically by EAS Build sourcemap upload script.)
  });

  initialized = true;
};

// Re-export the common API surface so the rest of the app doesn't need to
// import @sentry/react-native directly.
export const captureException = (err, context) => {
  if (initialized && Config.SENTRY_DSN) {
    Sentry.captureException(err, context);
  } else if (__DEV__) {
    // eslint-disable-next-line no-console
    console.error('[sentry-stub]', err, context || '');
  }
};

export const captureMessage = (msg, level = 'info') => {
  if (initialized && Config.SENTRY_DSN) {
    Sentry.captureMessage(msg, level);
  } else if (__DEV__) {
    // eslint-disable-next-line no-console
    console.warn('[sentry-stub]', msg, level);
  }
};

export const setUser = (user) => {
  if (initialized && Config.SENTRY_DSN) {
    Sentry.setUser(user ? { id: user.id, email: user.email } : null);
  }
};

// `Sentry.wrap` gives us automatic perf instrumentation when configured.
// Returns the input component unchanged when DSN is missing.
export const wrap = (Component) => {
  if (Config.SENTRY_DSN) {
    return Sentry.wrap(Component);
  }
  return Component;
};

// Re-export ErrorBoundary so App.tsx can wrap AppContent without a separate
// import path. With a missing DSN, it still functions as a React ErrorBoundary
// (catches render errors and shows fallback) but doesn't send to Sentry.
export const ErrorBoundary = Sentry.ErrorBoundary;
