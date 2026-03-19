<script setup lang="ts">
import type { FormInstance } from '@arco-design/web-vue';
import { reactive, ref } from 'vue';

const { t } = useI18n();

const emits = defineEmits<{
    setCode: [code: string];
}>();

const formRef = ref<FormInstance | null>(null);
const visible = ref<boolean>(false);
const formState = reactive({
    code: '',
});

// 确认方法
const onOk = (): void => {
    emits('setCode', formState.code);
    visible.value = false;
};

// 取消方法
const onCancel = (): void => {
    formRef.value?.resetFields();
    visible.value = false;
};

const onShowDilog = (val = false): void => {
    visible.value = val;
};

defineExpose({ onShowDilog });
</script>

<template>
    <a-modal :title="t('2FA 验证')" v-model:visible="visible" @ok="onOk" @cancel="onCancel" :width="380" :footer="false">
        <a-form ref="formRef" layout="vertical" :model="formState">
            <a-form-item :label="t('请输入2FA')" field="code" :rules="[
                { required:true,message:t('验证码必填') },
                { minLength:6, message:t('验证码不完整') },
                { match: /^\d+$/, message: t('必须为数字') },
            ]">
                <a-verification-code
                    :separator="(index: number) => index === 2 ? '-' : undefined"
                    v-model="formState.code" @finish="onOk"
                />
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<style scoped lang="scss">

</style>
