import App from './App.vue';
import { createApp } from 'vue';
import pinia from './store/Index';
import i18n from './setup/i18n-setup';
import router from './setup/router-setup';
import ArcoVue from '@arco-design/web-vue';
import dateFormat from '@/filters/dateFormat';
import DefaultEmpty from '@/directives/whenEmpty';
import dataThousands from '@/filters/dataThousands';
import numberOperation from '@/filters/numberOperation';

import 'nprogress/nprogress.css';
import '@/assets/stylesheet/main.css';
import 'tailwindcss/tailwind.css';
import '@arco-design/web-vue/dist/arco.css';

createApp(App)
    .use(pinia)
    .use(i18n)
    .use(ArcoVue)
    .use(router)
    .use(dateFormat)
    .use(DefaultEmpty)
    .use(dataThousands)
    .use(numberOperation)
    .mount('#app');
