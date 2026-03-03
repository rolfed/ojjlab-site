/**
 * Deterministic test data for E2E tests.
 * Never hardcode values in spec files — import from here.
 */

export const TRIAL_FORM_DATA = {
  name: 'Alex Torres',
  email: 'alex.torres.test@ojjlab.dev',
  phone: '503-555-0100',
  preferredDay: 'Tuesday',
} as const

export const PAGES = [
  { path: '/', title: 'Oregon Jiu Jitsu Lab', navLabel: 'Home' },
  { path: '/about/', title: 'About', navLabel: 'About' },
  { path: '/schedule/', title: 'Class Schedule', navLabel: 'Schedule' },
  { path: '/programs/', title: 'Programs', navLabel: 'Programs' },
  { path: '/shop/', title: 'Shop', navLabel: 'Shop' },
  { path: '/login/', title: 'Member Login', navLabel: 'Login' },
] as const
