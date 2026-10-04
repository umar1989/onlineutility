// Single place for site-wide settings. Edit here, nothing else needs to change.
export const SITE = {
  // PLACEHOLDER: replace with your real domain (no trailing slash) before going live.
  url: 'https://example.com',
  name: 'Online Utility',
  tagline: 'Free exam-form and classroom tools that run in your browser',
  description:
    'Free browser-based tools for exam applicants, students and teachers: photo and signature resizer, PDF tools, percentage, CGPA and age calculators.',
  language: 'en-IN',
  locale: 'en_IN',
  // Google Search Console verification: paste the content value of the meta tag. Leave empty to omit it.
  googleSiteVerification: '',
  author: {
    name: 'Your Name', // AUTHOR REVIEW: replace with your name
    role: 'Teacher and site author', // AUTHOR REVIEW
    url: '/about/',
  },
  email: 'your-email@example.com', // AUTHOR REVIEW: replace with your contact email
  ogImage: '/og-default.png',
  // Date the site structure was last reviewed, used as lastmod for non-guide pages.
  lastUpdated: '2026-10-04',
};

// Ad slots are empty reserved blocks. No AdSense code is included.
// When you get approved, put your slot ids here and add the AdSense script in Base.astro.
export const ADS = {
  enabled: true,
  slots: {
    top: { id: '', minHeight: 100 },
    bottom: { id: '', minHeight: 280 },
  },
};
