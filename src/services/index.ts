import Axios from 'axios'

const api = Axios.create({
  baseURL: `${import.meta.env.VITE_BASE_API || ''}${import.meta.env.VITE_BASE_API_VERSION || '/api/v1.0'}`,
  withCredentials: true
})

api.interceptors.response.use(
  (res) => res,
  (err: any) => {
    if (err instanceof Axios.Cancel) {
      return
    }
    window.$message.destroyAll()
    if (err.response) {
      window.$message.error(err.message)
    } else if (err.request) {
      window.$message.error(err.request)
    } else {
      window.$message.error(err.message || 'Something went wrong')
    }
    return Promise.reject(err)
  }
)

export default api
