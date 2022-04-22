import type { Router } from 'vue-router'
import { defineStore } from 'pinia'
import { useOsTheme } from 'naive-ui'
declare module 'pinia' {
  export interface PiniaCustomProperties {
    router: Router
  }
}

const osThemeRef = useOsTheme()

export const useRootStore = defineStore('rootStore', {
  state: () => ({
    isDarkMode: osThemeRef.value === 'dark'
  }),

  getters: {
    getIsDarkMode(): boolean {
      return this.isDarkMode
    }
  },

  actions: {
    setDarkMode(value: boolean) {
      this.isDarkMode = value
    }
  }
})
