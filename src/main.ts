import { createApp, markRaw } from 'vue'
import { createPinia } from 'pinia'

import router from './router'
import App from './App.vue'
import './styles/tailwind.css'

const pinia = createPinia()
pinia.use(({ store }) => {
  store.router = markRaw(router)
})

if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

const meta = document.createElement('meta')
meta.name = 'naive-ui-style'
document.head.appendChild(meta)

createApp(App)
  .use(pinia)
  .use(router)
  .mount('#app')
