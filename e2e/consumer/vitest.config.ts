import { defineConfig, mergeConfig } from 'vitest/config';
import { browserTests } from '../../vitest.shared.ts';
import viteConfig from './vite.config.ts';

export default mergeConfig(viteConfig, defineConfig(browserTests('brand-b')));
