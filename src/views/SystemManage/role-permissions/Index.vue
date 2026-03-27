<script setup lang="ts">
import type { ColumnType, TableSearchWrapExpose } from '@/interface/TableType'
import PermissionButton from '@/components/TableSearchWrap/components/PermissionButton.vue'
import TableSearchWrap from '@/components/TableSearchWrap/Index.vue'
import type { SystemRoleItem } from '@/interface/SystemManageType'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import api from '@/api/fetchTest/index'

const { t } = useI18n()
const router = useRouter()

const tableWrapRef = ref<TableSearchWrapExpose | null>(null)

const tableColumns = computed<ColumnType[]>(() => [
    { title: t('序号'), slotName: 'index', width: 80 },
    { title: t('角色名称'), dataIndex: 'roleName' },
    {
        title: t('操作'),
        dataIndex: 'action',
        fixed: 'right',
        width: 180,
        sorter: false,
        cellPreset: {
            type: 'actionButtons',
            buttons: [
                {
                    text: '查看权限',
                    onClick: async (record) => {
                        await router.push(
                            `/systemManage/viewRolePermissions/${String(record.roleId || '')}/1`,
                        )
                    },
                },
                {
                    text: '编辑',
                    onClick: async (record) => {
                        await router.push(
                            `/systemManage/editRolePermissions/${String(record.roleId || '')}`,
                        )
                    },
                },
            ],
        },
    },
])

/**
 * 角色列表接口返回全量数组。
 * TableSearchWrap 内部会统一做分页壳适配，这里保持页面层只负责调用接口。
 */
const fetchRoleList = async (): Promise<SystemRoleItem[]> => api.sysRoleList()

useOnActivated(() => {
    tableWrapRef.value?.refresh()
})
</script>

<template>
    <TableSearchWrap
        ref="tableWrapRef"
        :api-fetch="fetchRoleList"
        :table-columns="tableColumns"
        :enable-column-sort="false"
        :table-props="{ pagination: false }"
        row-key="roleId"
    >
        <template #roleBtnWrap>
            <PermissionButton
                button-key="add"
                type="primary"
                @click.stop="router.push('/systemManage/addRolePermissions')"
            >
                <template #icon>
                    <icon-plus />
                </template>
                {{ t('新增角色') }}
            </PermissionButton>
        </template>

        <template #index="{ rowIndex }">
            {{ rowIndex + 1 }}
        </template>
    </TableSearchWrap>
</template>
