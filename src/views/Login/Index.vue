<script setup lang="ts">
import { Message } from '@arco-design/web-vue';
import { encryptAESGCM } from '@/utils/aesGcm';
import { useRequest } from 'vue-request';
import cookies from 'cookies-js';
import api from '@/api/sys';
import md5 from 'md5';

const codeRef = ref();
const formRef = ref();
const formState = ref({
    account: 'xiangnan',
    password: 'xiangnan',
});

const store = user();
const router = useRouter();

const rules = {
    account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

const { data, loading, runAsync } = useRequest(async (facode = '') => {
    const { account } = formState.value;
    const password = await encryptAESGCM(formState.value.password, md5(`${account}sys-api`), store.pwdIv);
    const r = await api.sysUserLogin({ account, password, facode });
    return r;
}, {
    manual: true,
});

// 登录
const onOk = async () => {
    await formRef.value.validate();
    await runAsync();
    cookies.set('manageToken', data.value?.token);
    Message.success('登录成功！');
    router.push('/');
    // codeRef.value.onShowDilog(true);
};

// 获取2fa
const getCode = async (val: string) => {
    await runAsync(val);
    router.push('/');
    cookies.set('manageToken', data.value?.token);
    Message.success('登录成功！');
};

</script>

<!-- 登录界面 -->
<template>
    <div class="flex justify-center items-center h-screen w-screen bg-neutral-800">
        <a-spin :loading="loading">
            <GoogleCode ref="codeRef" @setCode="getCode" />
            <div class="w-96 rounded-lg bg-neutral-50 p-10">
                <a-form ref="formRef" layout="vertical" :rules="rules" :model="formState">
                    <a-form-item label="账号" field="account">
                        <a-input v-model="formState.account" placeholder="请输入账号" />
                    </a-form-item>
                    <a-form-item label="密码" field="password">
                        <a-input-password v-model="formState.password" placeholder="请输入密码" />
                    </a-form-item>
                    <a-button type="primary" :loading="loading" @click.stop="onOk">登录</a-button>
                </a-form>
            </div>
        </a-spin>
    </div>
</template>

<style scoped lang="scss">

</style>
