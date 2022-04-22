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
      try {
        await source.cancel('Cancel for keywork.')
        source = CancelToken.source()
        const { data } = await getKeywords(params, source.token)
        this.keywords = data.data
        this.total = data.count
        return data.count
      } catch (err: any) {
        if (err instanceof axios.Cancel) {
          return
        }
        if (err.response) {
          window.$message.error(err.message)
        } else if (err.request) {
          window.$message.error(err.request)
        } else {
          window.$message.error(err.message || 'Something went wrong')
        }
      }
    },
    async removeKeyword(id: string) {
      await removeKeyword(id)
      this.keywords = this.keywords.filter((item) => item.id !== id)
    },
    async uploadFile(formData: FormData) {
      try {
        const { data } = await uploadCsvFile(formData)
        return data
      } catch (err: any) {
        if (err.response) {
          window.$message.error(err.message)
        } else if (err.request) {
          window.$message.error(err.request)
        } else {
          window.$message.error(err.message || 'Something went wrong')
        }
      }
    }
  }
})
