<script setup lang="ts">
import type { FieldRule, FormInstance } from '@arco-design/web-vue';
import { Message } from '@arco-design/web-vue';
import { IconSearch } from '@arco-design/web-vue/es/icon';
import NProgress from 'nprogress';
import type { TreeNodeKey } from '@arco-design/web-vue/es/tree/interface';
import type { TreeDataType } from '@/interface/SystemManageType';
import { buildTree } from '@/utils/common';
import api from '@/api/fetchTest/index';

interface PermissionSummaryItem {
    key: string;
    title: string;
    moduleKey: string;
    moduleTitle: string;
    path: string[];
}

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const sidebarStore = sideBar();
const tagsViewStore = tagsView();

const formRef = ref<FormInstance>();
const isSpinning = ref(false);
const isLoading = ref(false);
const allRoleList = ref<TreeDataType[]>([]);
const currentModuleKey = ref('');
const searchKeyword = ref('');
const onlySelected = ref(false);
const manualExpandedKeys = ref<string[]>([]);
const modulePanelRef = ref<HTMLElement | null>(null);
const modulePanelHeight = ref(0);
const isWideLayout = ref(window.innerWidth >= 1280);
let resizeObserver: ResizeObserver | null = null;

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

const checkedKeySet = computed(() => new Set(currState.checkedKeys.map((key) => String(key))));

const rootRoleList = computed(() =>
    buildTree<TreeDataType>(allRoleList.value, 'children', 'menuId', 'parentId') || [],
);

const moduleList = computed(() =>
    rootRoleList.value.map((item) => ({
        key: String(item.menuId),
        title: item.menuName,
    })),
);

const currentModule = computed(() =>
    rootRoleList.value.find((item) => String(item.menuId) === currentModuleKey.value) ?? null,
);

// 将权限树拍平成可检索、可回跳的索引，供右侧已选清单和模块统计复用。
const flattenPermissionTree = (
    nodes: TreeDataType[],
    moduleKey: string,
    moduleTitle: string,
    parentPath: string[] = [],
): PermissionSummaryItem[] =>
    nodes.flatMap((node) => {
        const key = String(node.menuId);
        const path = [...parentPath, node.menuName];
        const current: PermissionSummaryItem = {
            key,
            title: node.menuName,
            moduleKey,
            moduleTitle,
            path,
        };

        return [
            current,
            ...flattenPermissionTree(node.children ?? [], moduleKey, moduleTitle, path),
        ];
    });

const permissionSummary = computed(() =>
    rootRoleList.value.flatMap((module) =>
        flattenPermissionTree([module], String(module.menuId), module.menuName),
    ),
);

const selectedPermissionList = computed(() =>
    permissionSummary.value.filter((item) => checkedKeySet.value.has(item.key)),
);

const selectedCountByModule = computed(() =>
    selectedPermissionList.value.reduce<Record<string, number>>((acc, item) => {
        acc[item.moduleKey] = (acc[item.moduleKey] ?? 0) + 1;
        return acc;
    }, {}),
);

const groupedSelectedPermissions = computed(() =>
    moduleList.value
        .map((module) => ({
            ...module,
            permissions: selectedPermissionList.value.filter(
                (item) => item.moduleKey === module.key,
            ),
        }))
        .filter((group) => group.permissions.length > 0),
);

const getExpandableKeys = (nodes: TreeDataType[]): string[] =>
    nodes.flatMap((node) => {
        const key = String(node.menuId);
        const children = node.children ?? [];

        return children.length ? [key, ...getExpandableKeys(children)] : [];
    });

const filterTreeNodes = (nodes: TreeDataType[]): TreeDataType[] => {
    const keyword = searchKeyword.value.trim().toLowerCase();

    const walk = (node: TreeDataType): TreeDataType | null => {
        // 搜索和“仅看已选”都通过同一套递归过滤，确保树结构和父子路径保持完整。
        const children = (node.children ?? [])
            .map((child) => walk(child))
            .filter((child): child is TreeDataType => child !== null);
        const key = String(node.menuId);
        const matchKeyword = !keyword || node.menuName.toLowerCase().includes(keyword);
        const matchSelected =
            !onlySelected.value || checkedKeySet.value.has(key) || children.length > 0;

        if (!matchSelected) return null;
        if (!matchKeyword && !children.length) return null;

        return {
            ...node,
            children,
        };
    };

    return nodes
        .map((node) => walk(node))
        .filter((node): node is TreeDataType => node !== null);
};

const currentModuleTree = computed(() => (currentModule.value ? [currentModule.value] : []));

const visibleTreeData = computed(() => filterTreeNodes(currentModuleTree.value));

const displayedExpandedKeys = computed(() => {
    if (searchKeyword.value.trim() || onlySelected.value) {
        return getExpandableKeys(visibleTreeData.value);
    }

    return manualExpandedKeys.value;
});

const selectedPermissionCount = computed(() => selectedPermissionList.value.length);
const selectedPanelStyle = computed(() =>
    isWideLayout.value && modulePanelHeight.value > 0
        ? { maxHeight: `${modulePanelHeight.value}px` }
        : undefined,
);

const handleBack = (): void => {
    router.back();
    if (route.name) {
        tagsViewStore.deleteVisitedViewByName(String(route.name), true);
    }
};

// 右侧“已选权限清单”高度跟随左侧模块导航，避免两列视觉高度失衡。
const syncLayoutState = (): void => {
    isWideLayout.value = window.innerWidth >= 1280;
    modulePanelHeight.value = modulePanelRef.value?.offsetHeight ?? 0;
};

const handleExpand = (expandedKeys: TreeNodeKey[]): void => {
    manualExpandedKeys.value = expandedKeys.map((key) => String(key));
};

const expandAll = (): void => {
    manualExpandedKeys.value = getExpandableKeys(currentModuleTree.value);
};

const collapseAll = (): void => {
    manualExpandedKeys.value = currentModule.value ? [String(currentModule.value.menuId)] : [];
};

const focusModule = (moduleKey: string): void => {
    currentModuleKey.value = moduleKey;
};

const removePermission = (permissionKey: string, moduleKey: string): void => {
    currState.checkedKeys = currState.checkedKeys.filter((key) => String(key) !== permissionKey);
    currentModuleKey.value = moduleKey;
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
        currState.checkedKeys = data.map((item) => String(item.menuId));
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

    // 接口仍然要求扁平 menuIdList，这里统一从当前勾选项转换一次。
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
        .then(() => {
            Message.success(t('操作成功'));
            handleBack();
            sidebarStore.fetchSidebarRoutes();
        })
        .finally(() => {
            isLoading.value = false;
            isSpinning.value = false;
        });
};

watch(
    moduleList,
    (modules) => {
        if (!modules.length) {
            currentModuleKey.value = '';
            manualExpandedKeys.value = [];
            return;
        }

        if (!modules.some((item) => item.key === currentModuleKey.value)) {
            currentModuleKey.value = modules[0].key;
        }
    },
    { immediate: true },
);

watch(
    currentModule,
    (module) => {
        if (!module) {
            manualExpandedKeys.value = [];
            return;
        }

        manualExpandedKeys.value = [String(module.menuId)];
    },
);

onMounted(async () => {
    syncLayoutState();
    resizeObserver = new ResizeObserver(() => {
        syncLayoutState();
    });

    if (modulePanelRef.value) {
        resizeObserver.observe(modulePanelRef.value);
    }

    window.addEventListener('resize', syncLayoutState);

    currState.roleId = roleId.value;
    await fetchRoleList();
    if (roleId.value) {
        fetchRoleListDetail();
    }
});

onBeforeUnmount(() => {
    resizeObserver?.disconnect();
    window.removeEventListener('resize', syncLayoutState);
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
                class="space-y-5"
            >
                <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <a-form-item
                        :label="t('角色名称')"
                        field="roleName"
                        class="mb-0 xl:min-w-[360px] xl:flex-1"
                    >
                        <a-input
                            v-model="currState.roleName"
                            size="small"
                            class="w-full max-w-[420px]"
                            maxlength="10"
                            autocomplete="off"
                            :placeholder="t('请输入')"
                            :disabled="see"
                        />
                    </a-form-item>

                    <div class="grid gap-3 sm:grid-cols-3 xl:w-auto xl:min-w-[520px]">
                        <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p class="text-xs text-slate-500">{{ t('模块导航') }}</p>
                            <p class="mt-1 text-xl font-semibold text-slate-800">
                                {{ moduleList.length }}
                            </p>
                        </div>
                        <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p class="text-xs text-slate-500">{{ t('已选权限') }}</p>
                            <p class="mt-1 text-xl font-semibold text-slate-800">
                                {{ selectedPermissionCount }}
                            </p>
                        </div>
                        <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p class="text-xs text-slate-500">{{ t('当前模块') }}</p>
                            <p class="mt-1 truncate text-sm font-semibold text-slate-800">
                                {{ currentModule?.menuName || '--' }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_320px] xl:items-start">
                    <section
                        ref="modulePanelRef"
                        class="rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                        <div class="mb-3">
                            <p class="text-sm font-semibold text-slate-800">{{ t('模块导航') }}</p>
                            <p class="mt-1 text-xs text-slate-500">
                                {{ t('切换模块查看对应权限树') }}
                            </p>
                        </div>

                        <div class="space-y-2">
                            <button
                                v-for="module in moduleList"
                                :key="module.key"
                                type="button"
                                class="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition"
                                :class="
                                    currentModuleKey === module.key
                                        ? 'border-[var(--color-primary-6)] bg-blue-50 text-slate-900'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                "
                                @click="focusModule(module.key)"
                            >
                                <span class="truncate text-sm font-medium">{{ module.title }}</span>
                                <span
                                    class="ml-3 rounded-full px-2 py-0.5 text-xs"
                                    :class="
                                        currentModuleKey === module.key
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'bg-slate-100 text-slate-500'
                                    "
                                >
                                    {{ selectedCountByModule[module.key] ?? 0 }}
                                </span>
                            </button>
                        </div>
                    </section>

                    <section class="flex min-h-[560px] flex-col rounded-xl border border-slate-200 bg-white">
                        <div class="border-b border-slate-100 px-4 py-3">
                            <div class="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p class="text-sm font-semibold text-slate-800">
                                        {{ t('权限配置') }}
                                    </p>
                                    <p class="mt-1 text-xs text-slate-500">
                                        {{ t('当前模块：{name}', { name: currentModule?.menuName || '--' }) }}
                                    </p>
                                </div>

                                <div class="flex flex-wrap items-center gap-2">
                                    <a-input
                                        v-model="searchKeyword"
                                        allow-clear
                                        size="small"
                                        class="w-[240px]"
                                        :placeholder="t('快速定位权限')"
                                    >
                                        <template #prefix>
                                            <IconSearch />
                                        </template>
                                    </a-input>
                                    <a-checkbox v-model="onlySelected">
                                        {{ t('仅看已选') }}
                                    </a-checkbox>
                                    <a-button size="small" @click="expandAll">
                                        {{ t('展开全部') }}
                                    </a-button>
                                    <a-button size="small" @click="collapseAll">
                                        {{ t('收起全部') }}
                                    </a-button>
                                </div>
                            </div>
                        </div>

                        <div class="min-h-0 flex-1 overflow-auto p-4">
                            <a-tree
                                v-if="visibleTreeData.length"
                                v-model:checked-keys="currState.checkedKeys"
                                :expanded-keys="displayedExpandedKeys"
                                :data="visibleTreeData"
                                :disabled="see"
                                :field-names="{ children: 'children', title: 'menuName', key: 'menuId' }"
                                size="small"
                                checkable
                                @expand="handleExpand"
                            />
                            <a-empty
                                v-else
                                :description="onlySelected ? t('未选择任何权限') : t('暂无数据')"
                            />
                        </div>
                    </section>

                    <aside
                        class="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3"
                        :style="selectedPanelStyle"
                    >
                        <div class="mb-3">
                            <p class="text-sm font-semibold text-slate-800">
                                {{ t('已选权限清单') }}
                            </p>
                            <p class="mt-1 text-xs text-slate-500">
                                {{ t('从已选清单点击可快速定位模块') }}
                            </p>
                        </div>

                        <div
                            v-if="groupedSelectedPermissions.length"
                            class="min-h-0 flex-1 space-y-4 overflow-auto pr-1"
                        >
                            <div
                                v-for="group in groupedSelectedPermissions"
                                :key="group.key"
                                class="rounded-lg border border-slate-200 bg-white p-3"
                            >
                                <div class="mb-2 flex items-center justify-between">
                                    <button
                                        type="button"
                                        class="truncate text-left text-sm font-semibold text-slate-700"
                                        @click="focusModule(group.key)"
                                    >
                                        {{ group.title }}
                                    </button>
                                    <span class="text-xs text-slate-400">
                                        {{ t('共 {count} 项', { count: group.permissions.length }) }}
                                    </span>
                                </div>

                                <div class="space-y-2">
                                    <div
                                        v-for="permission in group.permissions"
                                        :key="permission.key"
                                        class="flex items-start justify-between gap-2 rounded-md bg-slate-50 px-2 py-1.5"
                                    >
                                        <button
                                            type="button"
                                            class="min-w-0 flex-1 text-left"
                                            @click="focusModule(permission.moduleKey)"
                                        >
                                            <p class="truncate text-sm text-slate-700">
                                                {{ permission.title }}
                                            </p>
                                            <p class="truncate text-xs text-slate-400">
                                                {{ permission.path.join(' / ') }}
                                            </p>
                                        </button>
                                        <a-button
                                            v-if="!see"
                                            type="text"
                                            size="mini"
                                            class="!px-0 text-slate-400 hover:!text-rose-500"
                                            @click="removePermission(permission.key, permission.moduleKey)"
                                        >
                                            ×
                                        </a-button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="flex min-h-0 flex-1 items-center justify-center">
                            <a-empty :description="t('未选择任何权限')" />
                        </div>
                    </aside>
                </div>

                <div
                    class="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 backdrop-blur"
                >
                    <div class="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                        <span>{{ t('已选 {count} 项', { count: selectedPermissionCount }) }}</span>
                        <span class="text-slate-300">|</span>
                        <span>
                            {{ t('当前模块：{name}', { name: currentModule?.menuName || '--' }) }}
                        </span>
                    </div>

                    <div class="flex items-center gap-3">
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
                </div>
            </a-form>
        </a-spin>
    </div>
</template>
