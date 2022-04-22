/* eslint-disable @typescript-eslint/no-explicit-any */
export {}

declare global {
  type Recordable<T = any> = Record<string, T>
  const __APP_INFO__: {
    pkg: {
      name: string
      version: string
      dependencies: Recordable<string>
      devDependencies: Recordable<string>
    }
    lastBuildTime: string
  }
  interface Window {
    $message: any;
    $dialog: any;
  }
}
