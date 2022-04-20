<template>
  <n-space
    vertical
    justify="center"
    align="center"
    item-style="width: 100%;"
  >
    <!-- <h1 class="mt-8 text-center">Login as a googler</h1> -->
    <n-form
      ref="formRef"
      :model="formValue"
      :rules="rules"
      class="max-w-2xl mx-auto flex-none mt-8"
    >
      <n-form-item label="Email" path="email">
        <n-input v-model:value="formValue.email" placeholder="Input Email" />
      </n-form-item>
      <n-form-item label="Password" path="password">
        <n-input
          ref="pwdInputInstRef"
          v-model:value="formValue.password"
          type="password"
          @keydown.enter="doSignIn"
        />
      </n-form-item>
      <n-form-item>
        <n-space>
          <n-button @click="doSignIn">
            Sign In
          </n-button>
          <n-button @click="$event.preventDefault();showSignUpPopup(true)">
            Sign Up
          </n-button>
        </n-space>
      </n-form-item>
    </n-form>
    <PopupSignUp v-model:value="isSignUpPopupVisible" @close="showSignUpPopup(false)" @signup-succeed="onSignUpSucceed" />
  </n-space>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FormInst, InputInst, useMessage } from 'naive-ui'

import { useRootStore } from '@/stores/index'
import { setCookie } from '@/utils/index'

import { signin } from '@/services/authen'
import PopupSignUp from '../views/PopupSignUp.vue'
import { rules } from '@/utils/input-validation'
import { useRouter } from 'vue-router'

const router = useRouter()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const pwdInputInstRef = ref<InputInst | null>(null)

// data
const isSignUpPopupVisible = ref(false)
const formValue = ref({
  email: '',
  password: ''
})
const isSubmitting = ref(false)

// computed
const { updateAuthUser } = useRootStore()

const tokenKey = String(import.meta.env.VITE_TOKEN_KEY) || 'gsrs-token'

// methods
const showSignUpPopup = (val: boolean) => {
  isSignUpPopupVisible.value = val
}

const doSignIn = (e: MouseEvent | KeyboardEvent) => {
  e.preventDefault()
  if (isSubmitting.value) return
  if (formRef.value) {
    isSubmitting.value = true
    formRef.value?.validate(async (errors) => {
      if (!errors) {
        const { email, password } = formValue.value
        try {
          const { data } = await signin({ email, password })
          if (data.success) {
            message.success('Sign in successfuly')
            setCookie(tokenKey, data.access_token)
            updateAuthUser(data.user)
            formValue.value = { email: '', password: '' }
            router.push({ name: 'home' })
          } else {
            message.error(data.message)
          }
        } catch (err: any) {
          if (err.response) {
            if (err.response.status === 401) {
              message.error('The email or password is incorrect!')
              // message.error(err.response.data.message)
            } else {
              message.error(err.message)
            }
          } else if (err.request) {
            message.error(err.request)
          } else {
            // message.error('Something went wrong')
            message.error(err.message)
          }
        }
      }
      isSubmitting.value = false
    })
  }
}

const onSignUpSucceed = (email: string) => {
  formValue.value = { email, password: '' }
  showSignUpPopup(false)
  pwdInputInstRef.value?.focus()
}
</script>
