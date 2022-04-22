<template>
  <n-config-provider :theme="currentTheme">
    <n-layout class="h-screen">
      <n-layout :native-scrollbar="false" class="p-6">
        <n-page-header :title="routerTitle" :subtitle="routerTitle">
          <template #avatar>
            <router-link :to="{ name: 'home' }" class="no-underline text-black dark:text-white">
              <n-icon size="35">
                <i-mdi-google />
              </n-icon>
            </router-link>
          </template>
          <template #title>
            <router-link :to="{ name: 'home' }" class="no-underline text-black dark:text-white">
              Google Search Results Scraper (GSRS)
            </router-link>
          </template>
          <template #extra>
            <n-space v-if="user && user.email">
              <div class="flex items-center h-full">
                Welcome, {{ user.email }}
              </div>
              <n-button @click="logout">
                Logout
              </n-button>
            </n-space>
            <!-- <n-space>
              <n-switch v-model:value="isDarkMode" class="mb-3">
                <template #checked>
                  🌙
                </template>
                <template #unchecked>
                  🌞
                </template>
              </n-switch>
            </n-space> -->
          </template>
        </n-page-header>

        <n-layout-content :native-scrollbar="false">
          <router-view />
        </n-layout-content>
      </n-layout>
    </n-layout>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { darkTheme } from 'naive-ui'
import { useRoute, RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useRootStore } from '@/stores/index'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
// computed
const { isDarkMode } = storeToRefs(useRootStore())
const { user } = storeToRefs(useAuthStore())
const { logout } = useAuthStore()
const currentTheme = computed(() => isDarkMode.value ? darkTheme : undefined)

const routerTitle = computed<string>(() => (
  ((route.meta && route.meta.title) || '') as string
))
</script>
