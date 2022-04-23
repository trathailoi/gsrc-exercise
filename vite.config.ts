import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

import ViteLegacy from '@vitejs/plugin-legacy'

import ViteVisualizer from 'rollup-plugin-visualizer'

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
