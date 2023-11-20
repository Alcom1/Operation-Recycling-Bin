import {defineConfig} from 'vite';
import {resolve} from 'path'
import {dirname} from 'path'
import {fileURLToPath} from 'url'


export default defineConfig({
   base: process.env['BASE_PATH'],
   publicDir: 'assets',
   resolve: {
      alias: [{
         find: "engine", 
         replacement: resolve(dirname(fileURLToPath(import.meta.url)), './src/engine') 
      },{
         find: "game", 
         replacement: resolve(dirname(fileURLToPath(import.meta.url)), './src/game') 
      }]
   },
   build: {
      sourcemap: true,
   },
   esbuild: {
      minifyIdentifiers: false,
   }
});