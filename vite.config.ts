import Components from 'unplugin-vue-components/vite';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import AutoImport from 'unplugin-auto-import/vite';
import { ArcoResolver } from 'unplugin-vue-components/resolvers';
import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';
import { defineConfig, loadEnv } from 'vite';
import path from 'path';

// https://vitejs.dev/config/

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        base: env.VITE_PUBLIC_PATH || '/',
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
            },
        },
        css: {
            postcss: {
                plugins: [tailwindcss(), autoprefixer()],
            },
            preprocessorOptions: {
                less: {
                    modifyVars: { 'color-primary-6': 'var(--color-primary-6)' },
                    javascriptEnabled: true,
                },
            },
        },
        plugins: [
            vue(),
            AutoImport({
                imports: ['vue', 'vue-router', 'vue-i18n', 'pinia'],
                dirs: ['./src/store', './src/utils', './src/use'],
                dts: 'src/auto-imports.d.ts',
            }),
            Components({
                dirs: ['./src/components'],
                dts: 'src/components.d.ts',
                deep: true,
                resolvers: [
                    ArcoResolver({
                        importStyle: 'less',
                    }),
                ],
            }),
        ],
        define: {
            __VUE_OPTIONS_API__: true,
            __VUE_PROD_DEVTOOLS__: false,
            __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
        },
        server: {
            port: 60001,
            proxy: {
                '/api': {
                    target: 'http://43.199.161.111:10002/',
                    changeOrigin: true,
                },
            },
        },
    }
});
