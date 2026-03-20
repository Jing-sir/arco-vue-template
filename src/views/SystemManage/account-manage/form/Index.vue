<script setup lang="ts">
import type { FieldRule, FormInstance } from '@arco-design/web-vue';
import { Message } from '@arco-design/web-vue';
import NProgress from 'nprogress';
import type { SystemRoleItem } from '@/interface/SystemManageType';
import api from '@/api/fetchTest/index';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const tagsViewStore = tagsView();

const formRef = ref<FormInstance>();
const isLoading = ref(false);
const roleList = ref<SystemRoleItem[]>([]);

const currState = reactive({
    account: '',
    fullName: '',
    roleId: undefined as string | undefined,
    state: 1,
    userId: '',
});

const rules: Record<string, FieldRule[]> = {
    account: [{ required: true, message: t('请输入'), trigger: 'blur' }],
    fullName: [{ required: true, message: t('请输入'), trigger: 'blur' }],
    roleId: [{ required: true, message: t('请选择'), trigger: 'change' }],
};

const handleBack = (): void => {
    router.back();
    if (route.name) {
        tagsViewStore.deleteVisitedViewByName(String(route.name), true);
    }
};

const handleSaveData = async (): Promise<void> => {
    const errors = await formRef.value?.validate();
    if (errors) return;

    NProgress.start();
    isLoading.value = true;

    const { userId: id, ...params } = currState;
    api.sysUserAddOrUpdate({ ...params, id })
        .then(() => {
            Message.success(t('操作成功'));
            handleBack();
        })
        .finally(() => {
            NProgress.done();
            isLoading.value = false;
        });
};

const fetchRoleList = (): void => {
    api.sysRoleList().then((data) => {
        roleList.value = data;
    });
};

const fetchRowDetail = (): void => {
    if (!currState.userId) return;

    NProgress.start();
    api.sysUserInfo({ userId: currState.userId })
        .then((data) => {
            currState.account = data.account;
            currState.fullName = data.fullName;
            currState.roleId = data.roleId;
            currState.state = data.state;
        })
        .finally(() => {
            NProgress.done();
        });
};

onMounted(() => {
    fetchRoleList();
    currState.userId = route.params.id ? String(route.params.id) : '';
    fetchRowDetail();
});
</script>

<template>
    <div class="table-container">
        <a-form
            ref="formRef"
            :model="currState"
            :rules="rules"
            layout="vertical"
            class="max-w-xl space-y-2"
        >
            <a-form-item :label="t('账号登录名')" field="account">
                <a-input
                    v-model="currState.account"
                    size="small"
                    class="w-[250px]"
                    autocomplete="off"
                    :disabled="Boolean(currState.userId)"
                    :placeholder="t('请输入')"
                />
            </a-form-item>

            <a-form-item :label="t('姓名')" field="fullName">
                <a-input
                    v-model="currState.fullName"
                    size="small"
                    class="w-[250px]"
                    autocomplete="off"
                    :placeholder="t('请输入')"
                />
            </a-form-item>

            <a-form-item :label="t('分配角色')" field="roleId">
                <a-select
                    v-model="currState.roleId"
                    size="small"
                    class="w-[250px]"
                    :placeholder="t('请选择')"
                >
                    <a-option v-for="item in roleList" :key="item.roleId" :value="item.roleId">
                        {{ item.roleName }}
                    </a-option>
                </a-select>
            </a-form-item>

            <a-form-item :label="t('账号状态')" field="state">
                <a-radio-group v-model="currState.state" type="button" size="small">
                    <a-radio :value="1">{{ t('启用') }}</a-radio>
                    <a-radio :value="2">{{ t('禁用') }}</a-radio>
                </a-radio-group>
            </a-form-item>

            <a-form-item>
                <div class="flex items-center gap-3 pt-6">
                    <a-button size="small" @click.stop="handleBack">
                        {{ t('取消') }}
                    </a-button>
                    <a-button
                        type="primary"
                        size="small"
                        :loading="isLoading"
                        @click.stop="handleSaveData"
                    >
                        {{ t('提交') }}
                    </a-button>
                </div>
            </a-form-item>
        </a-form>
    </div>
</template>
