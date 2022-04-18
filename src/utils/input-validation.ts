import { FormItemRule } from 'naive-ui'

export const rules = {
  email: {
    required: true,
    validator(rule: FormItemRule, value: string) {
      if (!value) {
        return new Error('Please enter your email')
      } else if (!/.+@.+\..+/i.test(value)) {
        return new Error('Please enter a valid email')
      }
      return true
    },
    message: 'Please enter your email!',
    trigger: ['input', 'blur']
  }
}
