import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0, // Adjust this value in production, or use tracesSampler for greater control
  environment: process.env.NODE_ENV,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ["localhost", /^https:\/\/api\.yourdomain\.com\/api/],
    }),
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: true,
    }),
  ],
});
