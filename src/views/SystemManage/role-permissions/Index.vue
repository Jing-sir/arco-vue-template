<script setup lang="ts">
import TableSearchWrap from '@/components/TableSearchWrap/Index.vue';
import type {
    ColumnType,
    TableFetchResult,
    TableSearchWrapExpose,
} from '@/interface/TableType';
import { IconPlus } from '@arco-design/web-vue/es/icon';
import type { SystemRoleItem } from '@/interface/SystemManageType';
import api from '@/api/fetchTest/index';

const { t } = useI18n();
const router = useRouter();
const { isShowBtn: buttonPermissions } = useButtonRole();

const tableWrapRef = ref<TableSearchWrapExpose | null>(null);

const tableColumns = computed<ColumnType[]>(() => [
    { title: t('序号'), slotName: 'index', width: 80 },
    { title: t('角色名称'), dataIndex: 'roleName' },
    {
        title: t('操作'),
        dataIndex: 'action',
        slotName: 'action',
        fixed: 'right',
        width: 180,
    },
]);

const fetchRoleList = async (): Promise<TableFetchResult<SystemRoleItem>> => {
    const list = await api.sysRoleList();

    return {
        list,
        pageNo: 1,
        pageSize: list.length || 20,
        totalSize: list.length,
    };
};

useOnActivated(() => {
    tableWrapRef.value?.refresh();
});
</script>

<template>
    <TableSearchWrap
        ref="tableWrapRef"
        :api-fetch="fetchRoleList"
        :table-columns="tableColumns"
        :table-props="{ pagination: false }"
        row-key="roleId"
    >
        <template #roleBtnWrap>
            <a-button
                v-if="buttonPermissions('add')"
                type="primary"
                size="small"
                @click.stop="router.push('/systemManage/addRolePermissions')"
            >
                <template #icon>
                    <icon-plus />
                </template>
                {{ t('新增角色') }}
            </a-button>
        </template>

        <template #index="{ rowIndex }">
            {{ rowIndex + 1 }}
        </template>

        <template #action="{ record }">
            <div class="flex items-center gap-3">
                <a-button
                    type="text"
                    size="small"
                    class="!px-0"
                    @click.stop="router.push(`/systemManage/viewRolePermissions/${record.roleId}`)"
                >
                    {{ t('查看权限') }}
                </a-button>
                <a-button
                    type="text"
                    size="small"
                    class="!px-0"
                    @click.stop="router.push(`/systemManage/editRolePermissions/${record.roleId}`)"
                >
                    {{ t('编辑') }}
                </a-button>
            </div>
        </template>
    </TableSearchWrap>
</template>
