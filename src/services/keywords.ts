import api from './index'
import type { CancelToken } from 'axios'

const getKeywords = (params?: { pageSize?: number, currentPage?: number, q?: string }, cancelToken?: CancelToken) => api.get('/keywords', { params: params || {}, cancelToken })
const uploadCsvFile = (formData: FormData) => api.post('/scraper', formData)
const getKeywordDetail = (keywordId: string) => api.get(`/keywords/${keywordId}`)
const removeKeyword = (keywordId: string) => api.delete(`/keywords/${keywordId}`)

export {
  getKeywords,
  uploadCsvFile,
  getKeywordDetail,
  removeKeyword
}
