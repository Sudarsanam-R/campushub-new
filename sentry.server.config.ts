import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0, // Adjust this value in production
  environment: process.env.NODE_ENV,
  debug: false,
  // Add any server-side specific configurations here
  // Note: autoDiscoverNodePerformanceMonitoringIntegrations is not available in @sentry/nextjs
  // For Node.js specific integrations, they need to be imported from @sentry/node
});
