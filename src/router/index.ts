import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import { useRootStore } from '@/stores/index'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('@/layouts/default.vue'),
    meta: {
      breadcrumbs: [
        { text: 'Home', to: { name: 'home' } }
      ]
    },
    children: [
      { // Home
        path: '/',
        name: 'home',
        component: () => import('@/views/PageHome.vue'),
        meta: {
          authen: true
        }
      },
      { // Sign In
        path: '/sign-in',
        name: 'sign-in',
        component: () => import('@/views/PageSignIn.vue')
      },
      { // 404
        path: '/:pathMatch(.*)',
        name: 'not-found',
        component: () => import('@/views/PageNotFound.vue')
      },
      { // About
        path: 'about',
        name: 'about',
        component: () => import('@/views/PageAbout.vue')
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
      next({ name: 'sign-in' })
    } else if (to.name === 'sign-in' && auth.email) {
      next({ name: 'home' })
    } else {
      next()
    }
  }).finally(() => next())
})

export default router
