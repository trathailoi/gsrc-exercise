<template>
  <n-space vertical>
    <n-space justify="space-between">
      <n-upload
        :show-file-list="false"
        :custom-request="uploadHandler"
        :accept="'.csv'"
        class="my-4"
      >
        <n-button>Upload csv file containing keywords</n-button>
      </n-upload>
      <n-button class="my-4" @click="getList">
        <template #icon>
          <n-icon size="20">
            <i-mdi-refresh />
          </n-icon>
        </template>
        Refresh
      </n-button>
    </n-space>
    <n-input-group>
      <n-input
        v-model:value="q"
        clearable
        placeholder="Type keywords to search"
        :style="{ width: '50%' }"
        @keydown.enter="getList"
      />
      <n-button type="primary" ghost @click="getList">
        Search
      </n-button>
    </n-input-group>
    <n-data-table
      :columns="columns"
      :data="keywords"
      :pagination="pagination"
      :bordered="false"
      :remote="true"
      :loading="loading"
      max-height="calc(100vh - 298px)"
    />
  </n-space>
</template>

<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NDropdown, NIcon, useDialog, useMessage, UploadCustomRequestOptions } from 'naive-ui'
import type { PaginationInfo } from 'naive-ui'
import { storeToRefs } from 'pinia'

import IconDotsVertical from '~icons/mdi/dots-vertical'
import { dialogOptions, renderIcon } from '@/utils/index'

import { useKeywordStore } from '@/stores/keyword'

const router = useRouter()
const dialog = useDialog()
const message = useMessage()
const { uploadFile, fetchKeywords, removeKeyword } = useKeywordStore()

const { keywords, total } = storeToRefs(useKeywordStore())
const q = ref('')

const loading = ref(true)

const columns = [
  {
    title: '#',
    key: 'id',
    width: 120
  },
  {
    title: 'Name',
    key: 'name',
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: 'Finished scraping?',
    key: 'isFinishedScraping',
    ellipsis: {
      tooltip: true
    },
    render(row: { isFinishedScraping: boolean }) {
      return row.isFinishedScraping ? 'Yes' : 'No'
    }
  },
  {
    title: 'Adwords count',
    key: 'adwordsCount',
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: 'Total links',
    key: 'linksCount',
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: 'Result stats',
    key: 'resultStats',
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '',
    key: 'action',
    width: 50,
    render(row: { id: string, name: string }) {
      return h(NDropdown,
        {
          trigger: 'hover',
          options: [
            {
              label: 'View',
              key: 'view',
              props: {
                onClick: () => router.push({ name: 'keyword-detail', params: { id: row.id } })
              }
            },
            {
              label: 'Remove',
              key: 'remove',
              props: {
                onClick: () => dialog.warning(dialogOptions({
                  title: 'Delete keyword',
                  content: `This action cannot be undo. Delete the keyword "${row.name}"?`,
                  positiveText: 'Delete',
                  negativeText: 'Cancel',
                  onPositiveClick: () => removeKeyword(row.id)
                }))
              }
            }
          ]
        },
        renderIcon(IconDotsVertical, { size: '16' })
      )
    }
  }
]

const pagination = reactive({
  page: 1,
  itemCount: 0,
  pageSize: 20,
  prefix(info: PaginationInfo) {
    return `Total ${info.itemCount} items`
  },
  onChange: (page: number) => {
    pagination.page = page
    getList()
  }
})

async function getList() {
  loading.value = true
  await fetchKeywords({
    pageSize: pagination.pageSize,
    currentPage: pagination.page,
    ...(q.value ? { q: q.value } : {})
  })
  pagination.itemCount = total.value
  loading.value = false
}

const uploadHandler = ({
  file,
  data,
  onFinish,
  onError
}: UploadCustomRequestOptions) => {
  const formData = new FormData()
  if (data) {
    Object.keys(data).forEach((key) => {
      formData.append(
        key,
        data[key as keyof UploadCustomRequestOptions['data']]
      )
    })
  }
  formData.append('file', file.file as File)
  uploadFile(formData)
    .then((data) => {
      if (data.length === 0) {
        message.warning('No new keywords found')
      } else {
        message.success(`${data.length} keywords will be searching...`)
        getList()
      }
      onFinish()
    })
    .catch(() => onError())
}

onMounted(() => {
  getList()
})
</script>
