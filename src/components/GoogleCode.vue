<script setup lang="ts">
import CodeInput from '@/components/CodeInput.vue'
import type { FormInstance } from '@arco-design/web-vue'
import { Message } from '@arco-design/web-vue'
import { nextTick, reactive, ref } from 'vue'

const { t } = useI18n()

const props = withDefaults(
    defineProps<{
        loading?: boolean
    }>(),
    {
        loading: false,
    },
)

const emits = defineEmits<{
    setCode: [code: string]
    cancel: []
}>()

const formRef = ref<FormInstance | null>(null)
const codeInputRef = ref<InstanceType<typeof CodeInput> | null>(null)
const visible = ref<boolean>(false)
const formState = reactive({
    code: '',
})

const closeDialog = (): void => {
    formState.code = ''
    formRef.value?.resetFields()
    visible.value = false
}

// 验证通过后由父组件继续走 2FA 校验，校验成功再决定何时关闭弹窗。
const onOk = async (): Promise<void> => {
    if (props.loading) return

    const errors = await formRef.value?.validate()
    if (errors) return

    emits('setCode', formState.code)
}

const onCancel = (): void => {
    closeDialog()
    emits('cancel')
}

/**
 * 登录场景下很多用户会从密码管理器或短信/邮件里复制 2FA。
 * 这里提供显式“粘贴验证码”按钮，兼容不熟悉快捷键的用户。
 */
const onPasteCode = async (): Promise<void> => {
    if (props.loading) return

    if (!navigator.clipboard?.readText) {
        Message.warning(t('当前浏览器不支持剪贴板读取，请使用快捷键粘贴'))
        return
    }

    try {
        const clipboardText = await navigator.clipboard.readText()
        const normalizedCode = clipboardText.replace(/\D/g, '').slice(0, 6)

        if (!normalizedCode) {
            Message.warning(t('剪贴板中没有可用验证码'))
            return
        }

        formState.code = normalizedCode
        await nextTick()
        codeInputRef.value?.focus()
    } catch {
        Message.error(t('读取剪贴板失败，请手动粘贴'))
    }
}

const onShowDialog = async (val = false): Promise<void> => {
    if (!val) {
        closeDialog()
        return
    }

    formState.code = ''
    formRef.value?.resetFields()
    visible.value = val
    await nextTick()
    // 弹窗打开后自动聚焦第一个输入框，方便直接 Command/Ctrl + V。
    codeInputRef.value?.focus()
}

defineExpose({ closeDialog, onShowDialog })
</script>

<template>
    <a-modal
        :title="t('2FA 验证')"
        v-model:visible="visible"
        @cancel="onCancel"
        :width="380"
    >
        <a-form ref="formRef" layout="vertical" :model="formState">
            <a-form-item
                :label="t('请输入2FA')"
                field="code"
                :rules="[
                    { required: true, message: t('验证码必填') },
                    { minLength: 6, message: t('验证码不完整') },
                    { match: /^\d+$/, message: t('必须为数字') },
                ]"
            >
                <CodeInput
                    ref="codeInputRef"
                    v-model="formState.code"
                    :disabled="props.loading"
                    @complete="onOk"
                />
            </a-form-item>
        </a-form>
        <template #footer>
            <div class="flex w-full items-center gap-2">
                <a-button class="flex-1" :disabled="props.loading" @click.stop="onPasteCode">
                    {{ t('粘贴验证码') }}
                </a-button>
                <a-button
                    type="primary"
                    class="flex-1"
                    :loading="props.loading"
                    :disabled="formState.code.length < 6"
                    @click.stop="onOk"
                >
                    {{ t('验证') }}
                </a-button>
            </div>
        </template>
    </a-modal>
</template>
