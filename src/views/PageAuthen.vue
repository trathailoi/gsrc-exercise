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
import { FormInst, InputInst } from 'naive-ui'

import { useAuthStore } from '@/stores/auth'

import PopupSignUp from '../views/PopupSignUp.vue'
import { rules } from '@/utils/input-validation'
import { useRouter } from 'vue-router'

const router = useRouter()
const formRef = ref<FormInst | null>(null)
const pwdInputInstRef = ref<InputInst | null>(null)

// data
const isSignUpPopupVisible = ref(false)
const formValue = ref({
  email: '',
  password: ''
})
const isSubmitting = ref(false)

const { login } = useAuthStore()

// methods
const showSignUpPopup = (val: boolean) => {
  isSignUpPopupVisible.value = val
}

const doSignIn = (e: MouseEvent | KeyboardEvent) => {
  e.preventDefault()
  if (isSubmitting.value) return
  if (formRef.value) {
    isSubmitting.value = true
    formRef.value?.validate((errors) => {
      if (!errors) {
        const { email, password } = formValue.value
        login({ email, password }, () => {
          formValue.value = { email: '', password: '' }
          router.push({ name: 'home' })
        })
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
