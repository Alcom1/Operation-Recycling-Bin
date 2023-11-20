import {defineConfig} from 'vite';

export default defineConfig({
   base: process.env['BASE_PATH'],
   publicDir: 'assets',
   resolve: {
      alias: {
         "engine": new URL('./src/engine', import.meta.url).pathname,
         "game": new URL('./src/game', import.meta.url).pathname,
      }
   },
   build: {
      sourcemap: true,
   },
   esbuild: {
      minifyIdentifiers: false,
   }
});
