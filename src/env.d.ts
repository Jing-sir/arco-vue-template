declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'nprogress'; // 进度条

declare module 'workbox-precaching' {
  export function cleanupOutdatedCaches(): void;
  export function createHandlerBoundToURL(url: string): (options?: unknown) => Promise<Response>;
  export function precacheAndRoute(entries: unknown[]): void;
}

declare module 'workbox-core' {
  export function clientsClaim(): void;
}

declare module 'workbox-routing' {
  export class NavigationRoute {
    constructor(handler: (options?: unknown) => Promise<Response>, options?: { allowlist?: RegExp[] });
  }

  export function registerRoute(route: NavigationRoute): void;
}

declare module 'virtual:message' {
  export const message: unknown;
}

interface ServiceWorkerGlobalScope extends WorkerGlobalScope {
  __WB_MANIFEST: unknown[];
  skipWaiting(): Promise<void>;
}

interface ImportMetaEnv {
  readonly VITE_APP_BASE_URL: string;
  readonly VITE_APP_PASS: string;
  readonly VITE_PUBLIC_PATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
