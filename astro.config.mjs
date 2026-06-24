// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://andrewthyip.com',
  vite: {
    server: {
      watch: {
        ignored: ['**/public/**'],
      },
    },
  },
});
