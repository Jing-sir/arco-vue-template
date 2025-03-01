<script setup lang="ts">
import { getI18nLanguage } from '@/setup/i18n-setup';
import enUS from '@arco-design/web-vue/es/locale/lang/en-us';
import zhCN from '@arco-design/web-vue/es/locale/lang/zh-cn';
import { computed, onBeforeMount } from 'vue';
import i18n from './setup/i18n-setup';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';
import dayjs from 'dayjs';

const store = theme();

const renderKey = computed(() => `app-key-${i18n.global.locale}-${Math.random()}`);

const currLang = computed(() => i18n.global.locale.value === 'zh-CN' ? zhCN : enUS); // antd-vue国际化语言key

onBeforeMount(() => {
    dayjs.locale(getI18nLanguage() === 'zh-CN' ? 'zh-cn' : 'en');
});

</script>

<template>
    <div id="app">
        <a-config-provider :locale="currLang" :theme="{ primaryColor: store.defaultColor }">
            <router-view :key="renderKey" />
        </a-config-provider>
    </div>
</template>

<style lang="scss">
#app {
    width: 100%;
    min-height: 100%;
    min-width: 1200px;
    background: #f5f6f8;

    /* min-width: 1310px; */
}
</style>
