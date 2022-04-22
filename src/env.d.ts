/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_BASE_API: string
  readonly VITE_BASE_API_VERSION: string
  readonly VITE_TOKEN_KEY: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface KeywordDetail {
  id: string,
  name: string,
  jobQueueId: string,
  isFinishedScraping: boolean,
  adwordsCount?: number,
  linksCount?: number,
  resultStats?: string,
  rawHtml?: string,
  createdBy: {
    id: string,
    email: string,
  },
  modifiedBy?: {
    id: string,
    email: string,
  }
}
