<template>
  <n-dialog-provider>
    <DialogContent />
    <n-message-provider>
      <MessageContent />
      <router-view />
    </n-message-provider>
  </n-dialog-provider>
</template>
