import Components from 'unplugin-vue-components/vite';
import vueI18n from '@intlify/vite-plugin-vue-i18n';
import AutoImport from 'unplugin-auto-import/vite';
import { ArcoResolver } from 'unplugin-vue-components/resolvers';
import { VitePWA } from 'vite-plugin-pwa';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';
import path from 'path';

const env = dotenv.config().parsed;
// https://vitejs.dev/config/

export default defineConfig({
    base: env.VITE_PUBLIC_PATH,
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    css: {
        postcss: {
            plugins: [require('tailwindcss'), require('autoprefixer')]
        },
        preprocessorOptions: {
            less: {
                modifyVars: { 'color-primary-6': 'var(--color-primary-6)' },
            },
            javascriptEnabled: true,
        },
    },
    plugins: [
        vue(),
        vueI18n({
            compositionOnly: false
        }),
        AutoImport({
            // 自动导入 Vue 相关的 API，比如 `ref`, `reactive`, `toRef` 等
            imports: ['vue', 'vue-router', 'vue-i18n', 'pinia'],

            // 自动导入你项目中的文件，比如 `utils` 文件夹
            dirs: [
                './src/store',
                './src/utils',
                './src/use' // 你可以添加多个路径
            ],
            // 生成 `auto-imports.d.ts` 全局声明文件
            dts: 'src/auto-imports.d.ts',
        }),
        Components({
            // 自动导入 Vue 组件
            dirs: ['./src/components'],
            // 生成 `components.d.ts` 全局声明文件
            dts: 'src/components.d.ts',
            // 可以根据需要启用或禁用深度导入
            deep: true,
            resolvers: [
                ArcoResolver({
                    importStyle: 'less',
                }),
            ],
        }),
    ],
    define: {
        'process.env': process.env,
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false,
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    },
    server: {
        port: 60001,
        proxy: {
            '/api': {
                target: 'http://18.166.68.147:10002/',
                changeOrigin: true,
                // rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
});
