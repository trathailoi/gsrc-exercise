<template>
  <n-modal
    v-model:show="value"
    :mask-closable="false"
    preset="dialog"
    :on-update:show="onToggleShowModal"
    title="Sign Up"
    role="dialog"
    aria-labelledby="Sign Up"
  >
    <n-form
      ref="formSignUpRef"
      :model="formValue"
      :rules="signUpFormRules"
      size="large"
    >
      <n-form-item label="Email" path="email">
        <n-input v-model:value="formValue.email" placeholder="Input Email" />
      </n-form-item>
      <n-form-item label="Password" path="password">
        <n-input
          v-model:value="formValue.password"
          type="password"
          @input="handlePasswordInput"
          @keydown.enter.prevent
        />
      </n-form-item>
      <n-form-item
        ref="rPasswordFormItemRef"
        first
        path="confirmPassword"
        label="Re-enter the password"
      >
        <n-input
          v-model:value="formValue.confirmPassword"
          :disabled="!formValue.password"
          type="password"
          @keydown.enter.prevent
        />
      </n-form-item>
    </n-form>
    <template #action>
      <n-button @click="onSignUpClick">
        Validate
      </n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  FormInst, FormItemInst, FormItemRule,
  useMessage
} from 'naive-ui'

import { signup } from '@/services/authen'
import { rules } from '@/utils/input-validation'

// props definition
defineProps({
  value: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['close'])

const message = useMessage()
const formSignUpRef = ref<FormInst | null>(null)
const rPasswordFormItemRef = ref<FormItemInst | null>(null)
const formValue = ref({
  email: '',
  password: '',
  confirmPassword: ''
})
const isSubmitting = ref(false)
const signUpFormRules = {
  ...rules,
  password: [
    {
      required: true,
      message: 'Please enter a valid password',
      validator: (rule: FormItemRule, value: string): boolean => Boolean(value && value.length >= 8 && /(?=.*[A-Z])/.test(value) && /(?=.*\d)/.test(value))
    }
  ],
  confirmPassword: [
    {
      required: true,
      message: 'Re-entered password is required',
      trigger: ['input', 'blur']
    },
    {
      validator: (rule: FormItemRule, value: string): boolean => (
        !!formValue.value.password &&
        formValue.value.password.startsWith(value) &&
        formValue.value.password.length >= value.length
      ),
      message: 'Password is not same as re-entered password!',
      trigger: 'input'
    },
    {
      validator: (rule: FormItemRule, value: string): boolean => value === formValue.value.password,
      message: 'Password is not same as re-entered password!',
      trigger: ['blur', 'password-input']
    }
  ]
}

const handlePasswordInput = () => {
  if (formValue.value.confirmPassword) {
    rPasswordFormItemRef.value?.validate({ trigger: 'password-input' })
  }
}

const onToggleShowModal = (val: boolean) => {
  emit('close', val)
}

const onSignUpClick = (e: MouseEvent) => {
  e.preventDefault()
  if (isSubmitting.value) return
  isSubmitting.value = true
  formSignUpRef.value?.validate(async (errors) => {
    if (!errors) {
      message.loading('Signing up...')
      try {
        await signup(formValue.value)
        message.destroyAll()
        message.success('Sign up successfully! Please sign in!')
        emit('close', false)
      } catch (err: any) {
        if (err.response) {
          message.error((err.response.data && err.response.data.message) || err.message)
        } else if (err.request) {
          message.error(err.request)
        } else {
          message.error(err.message)
        }
      }
    }
    isSubmitting.value = false
  })
}
</script>
