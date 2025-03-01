<script setup lang="ts">
const emits = defineEmits(['setCode']);

const formRef = ref();
const visible = ref(false);
const formState = ref({
    code: '',
});

// 确认方法
const onOk = (): void => {
    emits('setCode', formRef.value.code);
    visible.value = false;
};

// 取消方法
const onCancel = (): void => {
    formRef.value.resetFields();
};

const onShowDilog = (val = false): void => {
    visible.value = val;
};

defineExpose({ onShowDilog });
</script>

<template>
    <a-modal title="2fa" v-model:visible="visible" @ok="onOk" @cancel="onCancel" :width="380" :footer="null">
        <a-form ref="formRef" layout="vertical" :model="formState">
            <a-form-item label="请输入2fa" field="code" :rules="[
                { required:true,message:'Verification code is required' },
                { minLength:6, message:'Verification code is incomplete' },
                { match: /^\d+$/, message: 'Must be numeric' },
            ]">
                <a-verification-code
                    :separator="(index) => index === 2 ? '-' : null"
                    v-model="formState.code" @finish="onOk"
                />
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<style scoped lang="scss">

</style>
