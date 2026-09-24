// @ts-check
import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import { yarcl } from 'yarcl/plugin';

export default defineConfig({
  integrations: [
    starlight({
      title: 'yarcl',
      description: 'A React component library where your config file is the design system.',
      logo: { src: './src/assets/yarcl.svg' },
      favicon: '/yarcl.svg',
      head: [
        { tag: 'link', attrs: { rel: 'icon', href: '/favicon.ico', sizes: '32x32' } },
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' } },
      ],
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/eugenioenko/yarcl' }],
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        { label: 'Getting Started', items: [{ autogenerate: { directory: 'getting-started' } }] },
        { label: 'Configuration', items: [{ autogenerate: { directory: 'configuration' } }] },
        {
          label: 'Components',
          items: [
            { label: 'Overview', link: '/components/' },
            { label: 'Buttons', items: [{ autogenerate: { directory: 'components/buttons' } }] },
            { label: 'Forms', items: [{ autogenerate: { directory: 'components/forms' } }] },
            { label: 'Typography', items: [{ autogenerate: { directory: 'components/typography' } }] },
            { label: 'Layout', items: [{ autogenerate: { directory: 'components/layout' } }] },
            { label: 'Overlays', items: [{ autogenerate: { directory: 'components/overlays' } }] },
            { label: 'Data display', items: [{ autogenerate: { directory: 'components/data' } }] },
            { label: 'Feedback', items: [{ autogenerate: { directory: 'components/feedback' } }] },
          ],
        },
        { label: 'Reference', items: [{ autogenerate: { directory: 'reference' } }] },
      ],
    }),
    react(),
  ],
  vite: {
    plugins: [yarcl({ config: 'src/yarcl.config.ts' })],
  },
});
