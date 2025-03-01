<script setup lang="ts">
import { encryptAESGCM } from '@/utils/aesGcm';
import { useRequest } from 'vue-request';
import api from '@/api/sys';
import md5 from 'md5';

const formRef = ref();
const visible = ref(true);
const formState = ref({
    pass: '',
});

const { pwdIv, userInfo } = storeToRefs(user());

const { data, loading, runAsync } = useRequest(async () => {
    const { pass } = formState.value;
    const password = await encryptAESGCM(pass, md5(`${userInfo.value.userId}sys-api`), pwdIv.value);
    const r = await api.checkCipher({ password, userId: userInfo.value.userId });
    return r;
}, { manual: true });

const onOk = async () => {
    const r = await formRef.value.validate();
    if (!r) await runAsync();
};

const onShowDialog = (val = false): void => {
    visible.value = val;
};

defineExpose({ onShowDialog });
</script>

<template>
    <a-modal v-model:visible="visible" title="绑定2FA" :width="380">
        <a-form ref="formRef" :model="formState" layout="vertical">
            <a-form-item label="登录密码" field="pass" :rules="[{ message: '请输入登录密码', required: true }]">
                <a-input-password v-model="formState.pass" placeholder="请输入登录密码" />
            </a-form-item>
        </a-form>
        <template #footer>
            <a-button type="primary" :loading="loading" long @click.stop="onOk">验证</a-button>
        </template>
    </a-modal>
</template>

<style scoped lang="scss">

</style>
