<template>
  <div>
    <div class="n-layout-page-header">
      <n-card :bordered="false" title="General Info">
        Project name: {{ name }}
        <br>
        Desc: Vue3, Vite2, TypeScript
      </n-card>
    </div>
    <n-card
      :bordered="false"
      title="Project Info"
      class="mt-4 proCard"
      size="small"
      :segmented="{ content: true }"
    >
      <n-descriptions bordered label-placement="left" class="py-2">
        <n-descriptions-item label="Version">
          <n-tag type="info">
            {{ version }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="Last build time">
          <n-tag type="info">
            {{ lastBuildTime }}
          </n-tag>
        </n-descriptions-item>
      </n-descriptions>
    </n-card>

    <n-card
      :bordered="false"
      title="devDependencies"
      class="mt-4 proCard"
      size="small"
      :segmented="{ content: true }"
    >
      <n-descriptions bordered label-placement="left" class="py-2">
        <n-descriptions-item v-for="item in devSchema" :key="item.field" :label="item.field">
          {{ item.label }}
        </n-descriptions-item>
      </n-descriptions>
    </n-card>

    <n-card
      :bordered="false"
      title="Dependencies"
      class="mt-4 proCard"
      size="small"
      :segmented="{ content: true }"
    >
      <n-descriptions bordered label-placement="left" class="py-2">
        <n-descriptions-item v-for="item in schema" :key="item.field" :label="item.field">
          {{ item.label }}
        </n-descriptions-item>
      </n-descriptions>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
export interface schemaItem {
    field: string;
    label: string;
  }

// eslint-disable-next-line no-undef
const { pkg, lastBuildTime } = __APP_INFO__
const { dependencies, devDependencies, name, version } = pkg

const schema: schemaItem[] = []
const devSchema: schemaItem[] = []

Object.keys(dependencies).forEach((key) => {
  schema.push({ field: key, label: dependencies[key] })
})

Object.keys(devDependencies).forEach((key) => {
  devSchema.push({ field: key, label: devDependencies[key] })
})
</script>
