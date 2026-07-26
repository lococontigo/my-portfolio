// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site:          'https://andrewthyip.com',
  trailingSlash: 'always',
  i18n: {
    locales: [
      'en',
      { path: 'ch', codes: ['zh-Hant'] },
    ],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    server: {
      watch: {
        ignored: ['**/public/**'],
      },
    },
  },
});
