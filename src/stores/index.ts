import type { Router } from 'vue-router'
import { defineStore } from 'pinia'
import { useOsTheme } from 'naive-ui'

import axios from 'axios'

import { setCookie } from '@/utils/index'
import { signout } from '@/services/authen'

declare module 'pinia' {
  export interface PiniaCustomProperties {
    router: Router
  }
}

const osThemeRef = useOsTheme()

const tokenKey = String(import.meta.env.VITE_TOKEN_KEY) || 'gsrs-token'
type IUser = { // NOTE: should this be a common type for both frontend and backend? --> will try monorepos
  id?: string
  email?: string,
  // firstName?: string,
  // lastName?: string,
  // fullName?: string
}
const user: IUser = {}

const authCheckSvc = () => axios.get(`${import.meta.env.VITE_BASE_API}${import.meta.env.VITE_BASE_API_VERSION || '/api/v1.0'}/authen/check`, {
  withCredentials: true,
  validateStatus: status => status >= 200 && status < 500
})

export const useRootStore = defineStore('rootStore', {
  state: () => ({
    isDarkMode: osThemeRef.value === 'dark',
    user
  }),

  getters: {
    getIsDarkMode(): boolean {
      return this.isDarkMode
    }
  },

  actions: {
    setDarkMode(value: boolean) {
      this.isDarkMode = value
    },
    updateAuthUser(user: IUser) {
      this.user = user
    },
    logout() {
      signout()
      setCookie(tokenKey, '', 0)
      this.user = {}
      this.router.push({ name: 'authen' })
    },
    async authCheck(): Promise<IUser> {
      try {
        const result = await authCheckSvc()
        if (result.status === 401) {
          // this.router.push({ name: 'authen' })
        } else if (result && result.data) {
          this.updateAuthUser(result.data)
          return result.data
        }
        return {}
      } catch (error) {
        this.logout()
        throw error
      }
    }
  }
})
