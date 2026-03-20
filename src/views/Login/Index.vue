<script setup lang="ts">
import GoogleCode from '@/components/GoogleCode.vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import { encryptAESGCM } from '@/utils/aesGcm'
import { useRequest } from 'vue-request'
import cookies from 'cookies-js'
import api from '@/api/sys'
import md5 from 'md5'

const { t } = useI18n()

interface LoginFormState {
    account: string
    password: string
}

const codeRef = ref<InstanceType<typeof GoogleCode> | null>(null)
const formRef = ref<FormInstance | null>(null)
const formState = ref({
    account: 'xiangnan',
    password: 'xiangnan',
} satisfies LoginFormState)

const store = user()
const router = useRouter()

const rules = {
    account: [{ required: true, message: t('请输入账号'), trigger: 'blur' }],
    password: [{ required: true, message: t('请输入密码'), trigger: 'blur' }],
}

const { loading, runAsync } = useRequest(
    async (facode = '') => {
        const { account } = formState.value
        // 登录密码需要和账号、后端下发的 iv 一起加密后再提交。
        const password = await encryptAESGCM(
            formState.value.password,
            md5(`${account}sys-api`),
            store.pwdIv,
        )
        const r = await api.sysUserLogin({ account, password, facode })
        return r
    },
    {
        manual: true,
    },
)

const { loading: googleLoading, runAsync: validateGoogle } = useRequest(
    (googleCode: string) => api.validateGoogle({ googleCode }),
    {
        manual: true,
    },
)

const setManageToken = (token = ''): void => {
    cookies.set('manageToken', token)
}

const finishLogin = async (): Promise<void> => {
    Message.success(t('登录成功'))
    await router.push('/')
}

const onOk = async (): Promise<void> => {
    const errors = await formRef.value?.validate()
    if (errors) return

    const loginData = await runAsync()
    if (loginData.googleState === 1) {
        // 二次验证接口依赖当前登录态里的 token，所以弹窗打开前要先暂存一次凭证。
        setManageToken(loginData.token)
        await codeRef.value?.onShowDialog(true)
        return
    }

    setManageToken(loginData.token)
    await finishLogin()
}

const getCode = async (val: string): Promise<void> => {
    await validateGoogle(val)
    codeRef.value?.closeDialog()
    await finishLogin()
}

const onCancelGoogleCode = (): void => {
    setManageToken('')
}
</script>

<!-- 登录界面 -->
<template>
    <div class="flex justify-center items-center h-screen w-screen bg-neutral-800">
        <a-spin :loading="loading">
            <GoogleCode
                ref="codeRef"
                :loading="googleLoading"
                @setCode="getCode"
                @cancel="onCancelGoogleCode"
            />
            <div class="w-96 rounded-lg bg-neutral-50 p-10">
                <a-form ref="formRef" layout="vertical" :rules="rules" :model="formState">
                    <a-form-item :label="t('账号')" field="account">
                        <a-input v-model="formState.account" :placeholder="t('请输入账号')" />
                    </a-form-item>
                    <a-form-item :label="t('密码')" field="password">
                        <a-input-password
                            v-model="formState.password"
                            :placeholder="t('请输入密码')"
                        />
                    </a-form-item>
                    <a-button type="primary" :loading="loading" @click.stop="onOk">{{
                        t('登录')
                    }}</a-button>
                </a-form>
            </div>
        </a-spin>
    </div>
</template>

<style scoped lang="scss"></style>
