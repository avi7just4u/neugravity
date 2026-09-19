export const ENV = {
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  // Explicit opt-in to show demo/seed data in production.
  // Set SHOW_DEMO_DATA=true in Vercel to re-enable during development previews.
  // Default: false in production, true in development.
  showDemoData: process.env.NODE_ENV !== 'production' || process.env.SHOW_DEMO_DATA === 'true',
  // Set FILTER_DEMO_DATA=true AFTER running migration 008 to activate demo filtering in production.
  filterDemoData: process.env.NODE_ENV === 'production' && process.env.FILTER_DEMO_DATA === 'true',
}
