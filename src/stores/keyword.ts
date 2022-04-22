import { defineStore } from 'pinia'
import axios from 'axios'

import { getKeywords, removeKeyword, uploadCsvFile } from '@/services/keywords'

type fetchKeywordsParams = {
  pageSize: number
  currentPage: number
  q?: string
}

const CancelToken = axios.CancelToken
let source = CancelToken.source()

const keywords: KeywordDetail[] = []

export const useKeywordStore = defineStore('keyword', {
  state: () => ({
    keywords,
    total: 0
  }),

  actions: {
    async fetchKeywords(params: fetchKeywordsParams) {
      await source.cancel('Cancel for keywork.')
      source = CancelToken.source()
      const { data } = await getKeywords(params, source.token)
      this.keywords = data.data
      this.total = data.count
      return data.count
    },
    async removeKeyword(id: string) {
      await removeKeyword(id)
      this.keywords = this.keywords.filter((item) => item.id !== id)
    },
    async uploadFile(formData: FormData) {
      const { data } = await uploadCsvFile(formData)
      return data
    }
  }
})
