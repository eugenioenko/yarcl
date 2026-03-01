// Consumer's design token config.
// The keys here become the only valid values for the `size` prop on components.
// Try adding or removing keys — TypeScript will immediately reflect the change.
export const yarcl = {
  button: {
    sizes: {
      xs: '28px',
      sm: '36px',
      md: '44px',
      lg: '52px',
      xl: '60px',
    },
    radii: {
      none:    '0px',
      sm:      '4px',
      md:      '8px',
      lg:      '12px',
      rounded: '9999px',
    },
  },
  colors: {
    primary:   '#2d4bb8',
    secondary: '#8240b3',
    danger:    '#dc2626',
    success:   '#16a34a',
  },
} as const;
