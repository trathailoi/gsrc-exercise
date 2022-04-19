import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import { useRootStore } from '@/stores/index'

const title = 'Google Search Results Scraper (GSRS)'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('@/layouts/default.vue'),
    children: [
      { // Home
        path: '/',
        name: 'home',
        component: () => import('@/views/PageHome.vue'),
        meta: {
          authen: true
        }
      },
      { // Authentication
        path: '/authen',
        name: 'authen',
        component: () => import('@/views/PageAuthen.vue')
      },
      { // 404
        path: '/:pathMatch(.*)',
        name: 'not-found',
        component: () => import('@/views/PageNotFound.vue')
      },
      { // About
        path: 'about',
        name: 'about',
        component: () => import('@/views/PageAbout.vue'),
        meta: {
          title: 'About GSRS'
        }
      },
      {
        path: 'keyword/:id',
        name: 'keyword-detail',
        component: () => import('@/views/PageKeywordDetail.vue'),
        meta: {
          authen: true
        }
      }
    ]
  }
]

// console.log('import.meta.env.DEV', import.meta.env.DEV)
const router = createRouter({
  history: import.meta.env.DEV ? createWebHashHistory() : createWebHistory(),
  routes,
  scrollBehavior() {
    // always scroll to top
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const { authCheck } = useRootStore()
  authCheck().then(auth => {
    if ((to.meta.authen === true) && !auth.email) {
      next({ name: 'authen' })
    } else if (to.name === 'authen' && auth.email) {
      next({ name: 'home' })
    } else {
      next()
    }
  }).finally(() => next())
})

router.afterEach((to) => {
  document.title = to.meta.title ? String(to.meta.title) : title
})

export default router
