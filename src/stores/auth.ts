import { defineStore } from 'pinia'

import { setCookie } from '@/utils/index'
import { signup, signin, signout, authCheckSvc } from '@/services/authen'

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

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user
  }),

  actions: {
    updateAuthUser(user: IUser) {
      this.user = user
    },
    async register (formData: ISignUpForm, onSuccess?: () => void) {
      await signup(formData)
      window.$message.destroyAll()
      window.$message.success('Sign up successfully! Please sign in!')
      onSuccess && onSuccess()
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
          window.$message.error(err.message || 'Something went wrong')
        }
      }
    },
    async logout() {
      await signout()
      setCookie(tokenKey, '', 0)
      this.user = {}
      this.router.push({ name: 'authen' })
    },
    async authCheck(): Promise<IUser> {
      try {
        const result = await authCheckSvc()
        if (result.status === 401) {
          // window.$message.error('Unauthenticated!')
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
