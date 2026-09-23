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
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/eugenioenko/yarcl-ui' }],
      components: {
        SocialIcons: './src/components/SocialIcons.astro',
      },
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        { label: 'Getting Started', items: [{ autogenerate: { directory: 'getting-started' } }] },
        { label: 'Configuration', items: [{ autogenerate: { directory: 'configuration' } }] },
        {
          label: 'Components',
          items: [
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
