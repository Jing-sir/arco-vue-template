import { ref } from 'vue';
import { defineStore } from 'pinia';
import api from '@/api/sys';

export default defineStore('user', () => {
    const pwdIv = ref(''); // 密钥
    const account = ref<string>();
    const userInfo = ref<PromiseReturnType<typeof api.loginInfo>>(Object.create(null));

    const fetchCurrUserInfo = (): void => { // 获取sidebar 列表路由
        api.loginInfo().then((r) => {
            userInfo.value = r;
            // setI18nLanguage(r.language);
        });
    };

    // 获取密钥
    const getPwdIv = async () => {
        pwdIv.value = await api.pwdIv();
    };

    return {
        pwdIv,
        getPwdIv,
        account,
        userInfo,
        fetchCurrUserInfo
    };
});
