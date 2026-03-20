<script setup lang="ts">
import type { FieldRule, FormInstance } from '@arco-design/web-vue';
import { Message } from '@arco-design/web-vue';
import api from '@/api/fetchTest/index';

const { t } = useI18n();
const userStore = user();

const props = withDefaults(
    defineProps<{
        visible: boolean;
        type: 'loginPwd' | '2FA';
        userId: string;
        width?: number;
    }>(),
    {
        width: 450,
    },
);

const emit = defineEmits<{
    'update:visible': [value: boolean];
    onSuccess: [];
}>();

const formRef = ref<FormInstance>();
const isSubmitLoading = ref(false);
const formState = reactive({
    facode: '',
    password: '',
});

const title = computed(() =>
    props.type === 'loginPwd' ? t('重置登录密码') : t('重置2FA'),
);

const visibleProxy = computed({
    get: () => props.visible,
    set: (value: boolean) => emit('update:visible', value),
});

const formRules: Record<string, FieldRule[]> = {
    facode: [
        { required: true, message: t('请输入6位数字验证码') },
        { match: /^\d{6}$/, message: t('请输入6位数字验证码') },
    ],
    password: [{ required: true, message: t('请输入'), trigger: 'blur' }],
};

const resetForm = (): void => {
    formState.facode = '';
    formState.password = '';
    formRef.value?.resetFields();
};

const handCancel = (): void => {
    userStore.getUserInfo();
    resetForm();
    visibleProxy.value = false;
};

const handleAddOrUpdate = async (): Promise<void> => {
    if (isSubmitLoading.value) return;

    isSubmitLoading.value = true;

    const requestName = props.type === 'loginPwd' ? 'sysUserResetPassword' : 'setSysUserResetSecret';
    const requestParams =
        props.type === 'loginPwd'
            ? { ...formState, userId: props.userId, type: 1 as const }
            : { ...formState, userId: props.userId };

    // 这里沿用现有接口命名分支，避免在弹窗层拆成两套重复请求逻辑。
    await api[requestName](requestParams as never)
        .then(() => {
            Message.success(t('操作成功'));
        })
        .finally(() => {
            isSubmitLoading.value = false;
        });
};

const handleSubmit = async (): Promise<void> => {
    const errors = await formRef.value?.validate();
    if (errors) return;

    await handleAddOrUpdate();
    handCancel();
    emit('onSuccess');
};
</script>

<template>
    <a-modal
        v-model:visible="visibleProxy"
        :title="title"
        :ok-loading="isSubmitLoading"
        :mask-closable="false"
        :cancel-button-props="{ disabled: isSubmitLoading }"
        :width="props.width"
        @cancel="handCancel"
        @ok="handleSubmit"
    >
        <a-form
            ref="formRef"
            :model="formState"
            :rules="formRules"
            :label-col-props="{ span: 5 }"
            layout="horizontal"
        >
            <a-form-item :label="t('登录密码')" field="password">
                <a-input-password
                    v-model="formState.password"
                    size="small"
                    :placeholder="t('请输入')"
                />
            </a-form-item>
            <a-form-item :label="t('2FA验证')" field="facode">
                <a-input-password
                    v-model="formState.facode"
                    size="small"
                    :placeholder="t('请输入')"
                />
            </a-form-item>
        </a-form>
    </a-modal>
</template>
