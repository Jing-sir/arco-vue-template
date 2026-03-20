<script setup lang="ts">
import type { FieldRule, FormInstance } from '@arco-design/web-vue';
import { Message } from '@arco-design/web-vue';
import NProgress from 'nprogress';
import type { TreeDataType } from '@/interface/SystemManageType';
import { buildTree } from '@/utils/common';
import api from '@/api/fetchTest/index';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const sidebarStore = sideBar();
const tagsViewStore = tagsView();

const formRef = ref<FormInstance>();
const isSpinning = ref(false);
const isLoading = ref(false);
const allRoleList = ref<TreeDataType[]>([]);

const roleId = computed(() => String(route.params.id || ''));
const see = computed(() => Boolean(route.params.see));

const currState = reactive({
    roleName: '',
    roleId: '',
    remark: '',
    checkedKeys: [] as string[],
});

const rules: Record<string, FieldRule[]> = {
    roleName: [{ required: true, message: t('请输入角色名称'), trigger: 'blur' }],
};

const rootRoleList = computed(() =>
    buildTree<TreeDataType>(allRoleList.value, 'children', 'menuId', 'parentId') || [],
);

const handleBack = (): void => {
    router.back();
    if (route.name) {
        tagsViewStore.deleteVisitedViewByName(String(route.name), true);
    }
};

const fetchRoleList = async (): Promise<void> => {
    NProgress.start();
    isSpinning.value = true;

    try {
        allRoleList.value = await api.sysRoleMenuList();
    } finally {
        NProgress.done();
        isSpinning.value = false;
    }
};

const fetchRoleListDetail = (): void => {
    api.sysInfoCheckMenuList({ roleId: currState.roleId }).then((data) => {
        currState.checkedKeys = data.map((item) => item.menuId);
    });

    api.sysRoleInfo({ roleId: currState.roleId }).then((data) => {
        currState.roleId = data.roleId;
        currState.roleName = data.roleName;
        currState.remark = data.remark ?? '';
    });
};

const handleSaveData = async (): Promise<void> => {
    const errors = await formRef.value?.validate();
    if (errors) return;
    if (!currState.checkedKeys.length) {
        Message.warning(t('请勾选权限'));
        return;
    }

    isLoading.value = true;
    isSpinning.value = true;

    const menuIdList = currState.checkedKeys.map((value) => ({
        checkUserPassword: 2,
        menuId: Number(value),
    }));

    api.sysRoleAddUpdate({
        checkOpPassword: false,
        menuIdList,
        remark: currState.remark,
        state: 1,
        roleName: currState.roleName,
        roleId: currState.roleId || undefined,
    })
        .then(async () => {
            Message.success(t('操作成功'));
            handleBack();
            sidebarStore.fetchSidebarRoutes();
        })
        .finally(() => {
            isLoading.value = false;
            isSpinning.value = false;
        });
};

onMounted(async () => {
    currState.roleId = roleId.value;
    await fetchRoleList();
    if (roleId.value) {
        fetchRoleListDetail();
    }
});
</script>

<template>
    <div class="table-container">
        <a-spin :loading="isSpinning" class="w-full">
            <a-form
                ref="formRef"
                :model="currState"
                :rules="rules"
                layout="vertical"
                class="max-w-2xl space-y-2"
            >
                <a-form-item :label="t('角色名称')" field="roleName">
                    <a-input
                        v-model="currState.roleName"
                        size="small"
                        class="w-[320px]"
                        maxlength="10"
                        autocomplete="off"
                        :placeholder="t('请输入')"
                        :disabled="see"
                    />
                </a-form-item>

                <a-form-item :label="t('权限配置')">
                    <a-tree
                        v-if="rootRoleList.length"
                        v-model:checked-keys="currState.checkedKeys"
                        :data="rootRoleList"
                        :disabled="see"
                        :field-names="{ children: 'children', title: 'menuName', key: 'menuId' }"
                        size="small"
                        checkable
                        default-expand-all
                    />
                </a-form-item>

                <a-form-item>
                    <div class="flex items-center gap-3 pt-6">
                        <a-button size="small" :disabled="isLoading" @click.stop="handleBack">
                            {{ see ? t('返回') : t('取消') }}
                        </a-button>
                        <a-button
                            v-if="!see"
                            type="primary"
                            size="small"
                            :loading="isLoading"
                            @click.stop="handleSaveData"
                        >
                            {{ t('确认') }}
                        </a-button>
                    </div>
                </a-form-item>
            </a-form>
        </a-spin>
    </div>
</template>
