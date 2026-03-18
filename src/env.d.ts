declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'nprogress'; // 进度条

interface ImportMetaEnv {
  readonly VITE_APP_BASE_URL: string;
  readonly VITE_APP_PASS: string;
  readonly VITE_PUBLIC_PATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
