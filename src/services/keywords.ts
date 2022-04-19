import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_API || ''}${import.meta.env.VITE_BASE_API_VERSION || '/api/v1.0'}`,
  withCredentials: true
})

const getKeywords = (params?: { pageSize?: number, currentPage?: number }) => api.get('/keywords', { params: params || {} })
// const uploadCsvFile = (file) => api.post('/scraper', {})
const getKeywordDetail = (keywordId: string) => api.get(`/keywords/${keywordId}`)
const removeKeyword = (keywordId: string) => api.delete(`/keywords/${keywordId}`)

export {
  getKeywords,
  getKeywordDetail,
  removeKeyword
}
