/**
 * Non-sensitive demo credentials for local development when ALLOW_DEMO_AUTH=true.
 */
export const demoLoginCredentials = {
  admin: {
    email: 'admin@umay.app',
    password: 'securePassword123',
  },
  user: {
    email: 'ev@umay.app',
    password: 'securePassword123',
  },
} as const;
