import { h } from 'vue'
import type { Component } from 'vue'
import { NIcon } from 'naive-ui'
import type { DialogOptions, NotificationOptions } from 'naive-ui'

export function renderIcon(icon: Component, attrs: object = {}) {
  return () => h(NIcon, attrs, { default: () => h(icon) })
}

export const dialogOptions = (options: DialogOptions) => ({
  title: 'Confirm',
  content: 'Are you sure?',
  positiveText: 'Sure',
  negativeText: 'Not Sure',
  ...options
})

export const notificationOptions = (options: NotificationOptions) => ({
  title: 'Notification',
  duration: 10000,
  closable: true,
  ...options
})

export const setCookie = (cname: string, cvalue: string | null, exdays = 60): void => {
  const d = new Date()
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))
  const expires = 'expires=' + d.toUTCString()
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/'
}

export const getCookie = (cname: string): string => {
  const name = cname + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ''
}
