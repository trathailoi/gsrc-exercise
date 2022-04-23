<template>
  <div>
    <n-space justify="space-between">
      <n-button quaternary class="my-4" @click="back">
        <template #icon>
          <n-icon size="20">
            <i-mdi-backburger />
          </n-icon>
        </template>
        Back
      </n-button>
      <n-button class="my-4" @click="fetchDetail">
        <template #icon>
          <n-icon size="20">
            <i-mdi-refresh />
          </n-icon>
        </template>
        Refresh
      </n-button>
    </n-space>
    <div class="n-layout-page-header">
      <n-card :bordered="false" title="Search results for">
        <h1 class="my-0">
          {{ keywordDetail?.name }}
        </h1>
        <n-collapse>
          <n-collapse-item title="Scraping status">
            <ul class="mt-0 pt-0">
              <li>Job ID: {{ keywordDetail?.jobQueueId }}</li>
              <li>Finished: {{ keywordDetail?.isFinishedScraping ? 'Yes' : 'No' }}</li>
            </ul>
          </n-collapse-item>
        </n-collapse>
        <p class="mb-0">
          {{ keywordDetail?.isFinishedScraping ? keywordDetail?.resultStats : 'Searching...' }}
        </p>
      </n-card>
    </div>

    <n-card
      v-if="keywordDetail?.isFinishedScraping"
      :bordered="false"
      title="Stats"
      class="mt-4 proCard"
      size="small"
      :segmented="{ content: true }"
    >
      <n-descriptions bordered label-placement="left" class="py-2">
        <n-descriptions-item label="Total number of AdWords advertisers">
          <n-tag type="info">
            {{ keywordDetail?.adwordsCount }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="Total number of links (all of them) on the page">
          <n-tag type="info">
            {{ keywordDetail?.linksCount }}
          </n-tag>
        </n-descriptions-item>
      </n-descriptions>
      <n-descriptions bordered class="py-2">
        <n-descriptions-item label="HTML code of the page">
          <n-collapse>
            <n-collapse-item title="Collapse/Expanse to view the code">
              <pre>
                {{ keywordDetail?.rawHtml }}
              </pre>
            </n-collapse-item>
          </n-collapse>
        </n-descriptions-item>
      </n-descriptions>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getKeywordDetail } from '@/services/keywords'

const route = useRoute()
const router = useRouter()

// data
// eslint-disable-next-line no-undef
const keywordDetail = ref<KeywordDetail | null>(null)

// methods
const back = () => {
  router.push({ name: 'home' })
}
const fetchDetail = async () => {
  const { data } = await getKeywordDetail(String(route.params.id))
  keywordDetail.value = data
}

onMounted(() => {
  fetchDetail()
})

</script>
