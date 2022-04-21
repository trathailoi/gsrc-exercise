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
      :data="items"
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
import IconDotsVertival from '~icons/mdi/dots-vertical'

import { dialogOptions, renderIcon } from '@/utils/index'
import { getKeywords, removeKeyword } from '@/services/keywords'
import axios from 'axios'

const router = useRouter()
const dialog = useDialog()
const message = useMessage()

const q = ref('')
const CancelToken = axios.CancelToken
let source = CancelToken.source()

const items = ref([])
const loading = ref(true)

const baseUrl = `${import.meta.env.VITE_BASE_API || ''}${import.meta.env.VITE_BASE_API_VERSION || '/api/v1.0'}`

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
  // {
  //   title: 'State',
  //   key: 'state',
  //   ellipsis: {
  //     tooltip: true
  //   },
  //   render(row: { state_id: Array<number|string> }) {
  //     return row.state_id[1]
  //   }
  // },
  // {
  //   title: 'Country',
  //   key: 'country',
  //   ellipsis: {
  //     tooltip: true
  //   },
  //   render(row: { country_id: Array<number|string> }) {
  //     return row.country_id[1]
  //   }
  // },
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
                  onPositiveClick: async () => {
                    const data = await removeKeyword(row.id)
                    if (data) {
                      items.value = items.value.filter((item: { id: string }) => item.id !== row.id)
                    }
                  }
                }))
              }
            }
          ]
        },
        renderIcon(IconDotsVertival, { size: '16' })
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
  try {
    loading.value = true
    await source.cancel('Cancel for keywork.')
    source = CancelToken.source()
    const { data } = await getKeywords(
      {
        pageSize: pagination.pageSize,
        currentPage: pagination.page,
        ...(q.value ? { q: q.value } : {})
      },
      source.token
    )
    items.value = data.data
    pagination.itemCount = data.count
    loading.value = false
    // message.success('Successfully fetched keywords')
  } catch (err: any) {
    if (err instanceof axios.Cancel) {
      return
    }
    if (err.response) {
      message.error(err.message)
    } else if (err.request) {
      message.error(err.request)
    } else {
      message.error(err.message || 'Something went wrong')
    }
  }
}

const uploadHandler = ({
  file,
  data,
  onFinish,
  onError,
  onProgress
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
  axios
    .post(`${baseUrl}/scraper`, formData, {
      withCredentials: true,
      onUploadProgress: ({ percent }: { percent: any }) => {
        onProgress({ percent: Math.ceil(percent) })
      }
    })
    .then((res) => {
      if (res.data.length === 0) {
        message.warning('No new keywords found')
      } else {
        message.success(`${res.data.length} keywords will be searching...`)
        getList()
      }
      onFinish()
    })
    .catch((err) => {
      if (err.response) {
        message.error(err.message)
      } else if (err.request) {
        message.error(err.request)
      } else {
        message.error(err.message || 'Something went wrong')
      }
      // message.success(err.message)
      onError()
    })
}

onMounted(() => {
  // console.log('onMounted')
  getList()
})
</script>
