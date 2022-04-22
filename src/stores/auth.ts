import { defineStore } from 'pinia'
import axios from 'axios'

import { setCookie } from '@/utils/index'
import { signup, signin, signout } from '@/services/authen'

const tokenKey = String(import.meta.env.VITE_TOKEN_KEY) || 'gsrs-token'

type IUser = { // NOTE: should this be a common type for both frontend and backend? --> will try monorepos
  id?: string
  email?: string,
  // firstName?: string,
  // lastName?: string,
  // fullName?: string
}
type ISignUpForm = {
  email: string,
  password: string,
  confirmPassword: string
}
const user: IUser = {}

const authCheckSvc = () => axios.get(`${import.meta.env.VITE_BASE_API}${import.meta.env.VITE_BASE_API_VERSION || '/api/v1.0'}/authen/check`, {
  withCredentials: true,
  validateStatus: status => status >= 200 && status < 500
})

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user
  }),

  actions: {
    updateAuthUser(user: IUser) {
      this.user = user
    },
    async register (formData: ISignUpForm, onSuccess?: () => void) {
      try {
        await signup(formData)
        window.$message.destroyAll()
        window.$message.success('Sign up successfully! Please sign in!')
        onSuccess && onSuccess()
        // emit('close', false)
      } catch (err: any) {
        window.$message.destroyAll()
        if (err.response) {
          window.$message.error((err.response.data && err.response.data.message) || err.message)
        } else if (err.request) {
          window.$message.error(err.request)
        } else {
          window.$message.error(err.message)
        }
      }
    },
    async login({ email, password }: { email: string, password: string }, onSuccess?: () => void) {
      try {
        const { data } = await signin({ email, password })
        if (data.success) {
          window.$message.destroyAll()
          window.$message.success('Sign in successfully')
          setCookie(tokenKey, data.access_token)
          this.updateAuthUser(data.user)
          onSuccess && onSuccess()
        } else {
          window.$message.error(data.message)
        }
      } catch (err: any) {
        window.$message.destroyAll()
        if (err.response) {
          if (err.response.status === 401) {
            window.$message.error('The email or password is incorrect!')
            // window.$message.error(err.response.data.message)
          } else {
            window.$message.error(err.message)
          }
        } else if (err.request) {
          window.$message.error(err.request)
        } else {
          // window.$message.error('Something went wrong')
          window.$message.error(err.message)
        }
      }
    },
    logout() {
      signout()
      setCookie(tokenKey, '', 0)
      this.user = {}
      this.router.push({ name: 'authen' })
    },
    async authCheck(): Promise<IUser> {
      try {
        const result = await authCheckSvc()
        if (result.status === 401) {
          // this.router.push({ name: 'authen' })
        } else if (result && result.data) {
          this.updateAuthUser(result.data)
          return result.data
        }
        return {}
      } catch (error) {
        this.logout()
        throw error
      }
    }
  }
})
