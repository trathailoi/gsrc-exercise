import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// import { esbuildCommonjs } from '@originjs/vite-plugin-commonjs'
import ViteLegacy from '@vitejs/plugin-legacy'

// import importToCDN, { autoComplete } from 'vite-plugin-cdn-import'
// import analyzer from 'rollup-plugin-analyzer'
import ViteVisualizer from 'rollup-plugin-visualizer'
// import viteCompression from 'vite-plugin-compression'
// import compress from 'vite-plugin-compress'
// import removeConsole from 'vite-plugin-remove-console'
// import { ViteWebfontDownload } from 'vite-plugin-webfont-dl'
// import ViteFonts from 'vite-plugin-fonts'

import ViteComponents from 'unplugin-vue-components/vite'
import ViteIcons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

import { dependencies, devDependencies, name, version } from './package.json'

const __APP_INFO__ = {
  pkg: { dependencies, devDependencies, name, version },
  lastBuildTime: new Date().toISOString()
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // const isDev = mode === 'development'
  const isProd = mode === 'production'
  const isReport = mode === 'report'

  const root = process.cwd()
  const env = loadEnv(mode, root)
  console.log('mode', mode)
  console.log('env', env)

  const plugins = [
    vue(),
    // analyzer(),
    // viteCompression(),
    // compress(),
    // analyzer({ summaryOnly: true }),
    // removeConsole()

    ViteComponents({
      dts: true,
      resolvers: [
        NaiveUiResolver(),
        IconsResolver()
      ]
    }),
    ViteIcons({
      compiler: 'vue3',
      autoInstall: true // expiremental
    })
    // ViteWebfontDownload([
    //   'https://fonts.googleapis.com/css2?family=Open+Sans&display=swap'
    // ])
    // ViteFonts({
    //   google: {
    //     families: ['Source Sans Pro']
    //   },
    // })
    // importToCDN({
    //   modules: [
    //     autoComplete('vue'),
    //     autoComplete('moment'),
    //     autoComplete('axios')
    //     // {
    //     //   name: 'vis-util',
    //     //   var: 'VisTimelineESNext',
    //     //   path: 'esnext/umd/vis-timeline-graph2d.min.js'
    //     // },
    //     // {
    //     //   name: 'vis-data',
    //     //   var: 'VisTimelineESNext',
    //     //   path: 'esnext/umd/vis-timeline-graph2d.min.js'
    //     // },
    //     // {
    //     //   name: 'vis-timeline',
    //     //   var: 'VisTimelineESNext',
    //     //   // path: 'esnext/umd/vis-timeline-graph2d.min.js'
    //     //   // path: 'peer/umd/vis-timeline-graph2d.min.js'
    //     //   path: 'standalone/umd/vis-timeline-graph2d.min.js'
    //     // }
    //     // {
    //     //   name: 'react-dom',
    //     //   var: 'ReactDOM',
    //     //   path: 'umd/react-dom.production.min.js'
    //     // }
    //   ]
    // })
  ]

  const build = {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.toString().split('node_modules/')[1].split('/')[0].includes('naive-ui')) {
              return 'naive-ui'
            } else if (id.toString().split('node_modules/')[1].split('/')[0].includes('vis-')) {
              return 'vis-timeline'
            } else {
              return 'vendors'
            }
          }
        }
      }
    },
    manifest: false
  }
  if (isProd) {
    build.manifest = true

    plugins.push(
      /**
       * DESC:
       * provides support for legacy browsers
       * that do not support native ESM
       */
      ViteLegacy({
        targets: [
          'defaults',
          'not IE 11'
        ]
      })
    )
  }

  if (isReport) {
    plugins.push(
      /**
       * DESC:
       * visualize bundle
       */
      ViteVisualizer({
        filename: './dist/report.html',
        open: true,
        brotliSize: true
      })
    )
  }

  // let optimizeDeps = {}
  // if (isDev) {
  //   /**
  //    * DESC:
  //    * dependency pre-bundling
  //    */
  //   optimizeDeps = {
  //     include: [
  //       'vue',
  //       'pinia',
  //       'vue-router',
  //       // 'naive-ui',
  //       'moment'
  //     ]
  //   }
  // }

  return {
    plugins,
    define: {
      __APP_INFO__: JSON.stringify(__APP_INFO__)
    },
    server: {
      proxy: {
        [env.VITE_BASE_API_VERSION || '/api/v1.0']: {
          target: env.VITE_BASE_API || 'http://localhost:3000',
          changeOrigin: true
        }
      }
    },
    build,
    // optimizeDeps,
    // optimizeDeps: {
    //   // exclude: [
    //   //   './src/test/HelloWorld.test.ts'
    //   // ]
    //   // esbuildOptions: {
    //   //   plugins: [
    //   //     esbuildCommonjs(['vis-timeline', 'vis-data', 'vis-util'])
    //   //   ]
    //   // }
    // },
    // build: {
    //   rollupOptions: {
    //     output: {
    //       manualChunks: {
    //         vendor: ['vis-timeline', 'vis-data', 'vis-util'],
    //         ...renderChunks(dependencies)
    //       }
    //     }
    //   }
    //   // target: 'es2015',
    //   // outDir: OUTPUT_DIR,
    //   // terserOptions: {
    //   //   compress: {
    //   //     keep_infinity: true,
    //   //     drop_console: true // VITE_DROP_CONSOLE
    //   //   }
    //   // }
    //   // brotliSize: false,
    //   // chunkSizeWarningLimit: 2000
    // },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      },
      dedupe: ['vue']
    },
    test: { // for Vitest
      globals: true,
      environment: 'jsdom'
    }
  }
})
