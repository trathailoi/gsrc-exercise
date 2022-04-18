<template>
  <n-layout>
    <n-result
      status="404"
      title="404 Not Found"
      description="You know life is always ridiculous."
    >
      <template #footer>
        <router-link :to="{ name: 'home' }">
          <n-button>Find Something Funny</n-button>
        </router-link>
      </template>
    </n-result>
  </n-layout>
</template>
