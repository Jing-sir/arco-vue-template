<script setup lang="ts">
import type { FormInstance } from '@arco-design/web-vue'
import GoogleCode from '@/components/GoogleCode.vue'
import { Message } from '@arco-design/web-vue'
import { encryptAESGCM } from '@/utils/aesGcm'
import { useRequest } from 'vue-request'
import logoUrl from '@/assets/logo.png'
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

const formState = reactive<LoginFormState>({
    account: '',
    password: '',
} satisfies LoginFormState)

const LOGIN_PAGE_BODY_CLASS = 'login-page-active'

const store = user()
const router = useRouter()

const rules = {
    account: [{ required: true, message: t('请输入账号'), trigger: 'blur' }],
    password: [{ required: true, message: t('请输入密码'), trigger: 'blur' }],
}

const { loading, runAsync } = useRequest(
    async (facode = '') => {
        const { account, password: plainPassword } = formState
        const password = await encryptAESGCM(plainPassword, md5(`${account}sys-api`), store.pwdIv)
        return api.sysUserLogin({ account, password, facode })
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

onMounted(() => {
    document.body.classList.add(LOGIN_PAGE_BODY_CLASS)
})

onBeforeUnmount(() => {
    document.body.classList.remove(LOGIN_PAGE_BODY_CLASS)
})
</script>

<template>
    <div class="min-h-screen bg-slate-100 text-slate-900">
        <div class="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-10">
            <a-spin :loading="loading" class="w-[420px]">
                <div
                    class="overflow-hidden rounded-xl bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
                >
                    <section class="bg-white px-6 py-8 text-slate-900">
                        <GoogleCode
                            ref="codeRef"
                            :loading="googleLoading"
                            @setCode="getCode"
                            @cancel="onCancelGoogleCode"
                        />

                        <div>
                            <h2
                                class="text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl"
                            >
                                {{ t('欢迎回来') }}
                            </h2>
                            <p class="mt-3 max-w-md text-sm leading-6 text-slate-500">
                                {{ t('请使用您的管理账号进行登录') }}
                            </p>
                        </div>

                        <div class="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
                            <div class="mb-6 flex items-center justify-between gap-4">
                                <div>
                                    <p class="text-lg font-semibold text-slate-950">
                                        {{ t('账号登录') }}
                                    </p>
                                </div>
                                <div
                                    class="login-accent-soft flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200"
                                >
                                    <img
                                        :src="logoUrl"
                                        :alt="t('管理后台')"
                                        class="h-7 w-7 object-contain"
                                    />
                                </div>
                            </div>

                            <a-form
                                ref="formRef"
                                class="login-form"
                                layout="vertical"
                                :rules="rules"
                                :model="formState"
                            >
                                <a-form-item :label="t('账号')" field="account">
                                    <a-input
                                        v-model="formState.account"
                                        size="large"
                                        allow-clear
                                        :placeholder="t('请输入账号')"
                                    />
                                </a-form-item>
                                <a-form-item :label="t('密码')" field="password">
                                    <a-input-password
                                        v-model="formState.password"
                                        size="large"
                                        :placeholder="t('请输入密码')"
                                    />
                                </a-form-item>
                                <a-button
                                    long
                                    size="large"
                                    type="primary"
                                    class="mt-2 h-12 rounded-2xl border-0 text-base font-semibold"
                                    :loading="loading"
                                    @click.stop="onOk"
                                >
                                    {{ t('登录') }}
                                </a-button>
                            </a-form>

                            <div
                                class="mt-5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs leading-6 text-slate-500"
                            >
                                {{ t('使用管理员账号登录，若已开启 2FA 将自动进入二次验证') }}
                            </div>
                        </div>
                    </section>
                </div>
            </a-spin>
        </div>
    </div>
</template>
