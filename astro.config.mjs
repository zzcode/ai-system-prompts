import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.kodatools.com',
  output: 'static',
  build: {
    format: 'directory'
  },
  trailingSlash: 'never'
});
