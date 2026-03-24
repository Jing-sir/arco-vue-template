<script setup lang="ts">
import enUS from '@arco-design/web-vue/es/locale/lang/en-us';
import zhCN from '@arco-design/web-vue/es/locale/lang/zh-cn';
import { getI18nLanguage } from '@/setup/i18n-setup';
import { computed, onBeforeMount } from 'vue';
import i18n from './setup/i18n-setup';
import 'dayjs/locale/zh-cn';
import dayjs from 'dayjs';
import 'dayjs/locale/en';

const userStore = user();
const themeStore = theme();

const renderKey = computed(() => `app-key-${i18n.global.locale}-${Math.random()}`);

const currLang = computed(() => i18n.global.locale.value === 'zh-CN' ? zhCN : enUS); // antd-vue国际化语言key

onBeforeMount(() => {
    // 应用启动时先同步语言环境，再初始化主题色。
    // 主题色优先取浏览器缓存，没有缓存时回退默认值，并写回 CSS 变量。
    dayjs.locale(getI18nLanguage() === 'zh-CN' ? 'zh-cn' : 'en');
    themeStore.initThemeColor();
});

userStore.getPwdIv();
</script>

<template>
    <div id="app" class="min-h-full min-w-[var(--app-min-width)] bg-[var(--app-bg)]">
        <a-config-provider size="large" :locale="currLang">
            <router-view :key="renderKey" />
        </a-config-provider>
    </div>
</template>
