// Library's internal default config — used only during library development.
// Consumers provide their own config via the @yarcl/config alias.
export const yarcl = {
  button: {
    sizes: { sm: '32px', md: '40px', lg: '48px' },
    radii: { none: '0px', sm: '4px', md: '8px', lg: '12px', rounded: '9999px' },
  },
  colors: {
    primary:   '#2d4bb8',
    secondary: '#8240b3',
    danger:    '#dc2626',
    success:   '#16a34a',
    warning:   '#f59e0b',
    info:      '#0ea5e9',
    accent:    '#2fb3a8',
    neutral:   '#4a5568',
  },
} as const;
