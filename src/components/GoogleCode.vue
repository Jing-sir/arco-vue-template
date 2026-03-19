<script setup lang="ts">
import type { FormInstance } from '@arco-design/web-vue';
import { reactive, ref } from 'vue';

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
    <a-modal title="2fa" v-model:visible="visible" @ok="onOk" @cancel="onCancel" :width="380" :footer="false">
        <a-form ref="formRef" layout="vertical" :model="formState">
            <a-form-item label="请输入2fa" field="code" :rules="[
                { required:true,message:'Verification code is required' },
                { minLength:6, message:'Verification code is incomplete' },
                { match: /^\d+$/, message: 'Must be numeric' },
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
