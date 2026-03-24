<script setup lang="ts">
import enUS from '@arco-design/web-vue/es/locale/lang/en-us';
import zhCN from '@arco-design/web-vue/es/locale/lang/zh-cn';
import { getI18nLanguage } from '@/setup/i18n-setup';
import { computed, onBeforeMount } from 'vue';
import i18n from './setup/i18n-setup';
import 'dayjs/locale/zh-cn';
import dayjs from 'dayjs';
import 'dayjs/locale/en';

const store = user();

const renderKey = computed(() => `app-key-${i18n.global.locale}-${Math.random()}`);

const currLang = computed(() => i18n.global.locale.value === 'zh-CN' ? zhCN : enUS); // antd-vue国际化语言key

onBeforeMount(() => {
    dayjs.locale(getI18nLanguage() === 'zh-CN' ? 'zh-cn' : 'en');
});

store.getPwdIv();
</script>

<template>
    <div id="app" class="min-h-full min-w-[var(--app-min-width)] bg-[var(--app-bg)]">
        <a-config-provider size="large" :locale="currLang">
            <router-view :key="renderKey" />
        </a-config-provider>
    </div>
</template>
