/**
 * Sanity Studio Configuration for KRISHFICIENT
 * Run with: npx sanity dev
 * Or deploy via: npx sanity deploy
 */
export const sanityConfig = {
  name: 'krishficient-studio',
  title: 'KRISHFICIENT Editorial Studio',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'your-project-id',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  basePath: '/studio',
};
