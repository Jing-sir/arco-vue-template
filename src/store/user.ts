import { defineStore } from 'pinia';
import api from '@/api/sys';
import { ref } from 'vue';

export default defineStore('user', () => {
    const pwdIv = ref(''); // 密钥
    const account = ref<string>();
    const userInfo = ref<PromiseReturnType<typeof api.loginInfo>>(Object.create(null));

    const getUserInfo = async () => { // 获取sidebar 列表路由
        userInfo.value = await api.loginInfo();
    };

    // 获取密钥
    const getPwdIv = async () => {
        pwdIv.value = await api.pwdIv();
    };

    return {
        pwdIv,
        account,
        userInfo,
        getPwdIv,
        getUserInfo
    };
});
