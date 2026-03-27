<script setup lang="ts">
import tagApi from '@/api/userApi/tag'
import TableSearchWrap from '@/components/TableSearchWrap/Index.vue'
import PermissionButton from '@/components/TableSearchWrap/components/PermissionButton.vue'
import type {
    ColumnType,
    SearchOption,
    TableExportConfig,
    TableFetchResult,
    TableSearchWrapExpose,
} from '@/interface/TableType'
import { Message, Modal } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import LabelFormModal from './modal/LabelFormModal.vue'
import ImportTagsModal from './modal/ImportTagsModal.vue'

interface LabelListRow extends Record<string, unknown> {
    id: string
    name: string
    color: string
    sort: number
    createTime: string
    updateTime: string
    operatorName: string
}

interface LabelFormModalExpose {
    open: (mode: 'add' | 'edit' | 'view', source?: { id?: string }) => void
    close: () => void
}

const { t } = useI18n()

const tableWrapRef = ref<TableSearchWrapExpose | null>(null)
const labelFormModalRef = ref<LabelFormModalExpose | null>(null)
const importModalVisible = ref(false)

const searchConf = ref<SearchOption[]>([
    {
        label: t('标签名称'),
        modelKey: 'name',
        placeholder: t('请输入'),
        type: 'input',
        value: '',
    },
    {
        label: t('修改人名称'),
        modelKey: 'operatorName',
        placeholder: t('请输入'),
        type: 'input',
        value: '',
    },
])

const tableColumns = computed<ColumnType[]>(() => [
    { title: t('标签名称'), dataIndex: 'name', slotName: 'name', width: 220, sorter: false },
    { title: t('排序'), dataIndex: 'sort', width: 100, sorter: false },
    { title: t('创建日期'), dataIndex: 'createTime', width: 180, sorter: false },
    { title: t('修改日期'), dataIndex: 'updateTime', width: 180, sorter: false },
    { title: t('修改人'), dataIndex: 'operatorName', width: 180, sorter: false },
    {
        title: t('操作'),
        dataIndex: 'action',
        slotName: 'action',
        fixed: 'right',
        width: 260,
        sorter: false,
    },
])

/**
 * 标签分页接口参数统一补齐，避免字段缺省导致后端查询分支不一致。
 */
const normalizeTagPageParams = (params: Record<string, unknown> = {}) => ({
    pageNo: Number(params.pageNo || 1),
    pageSize: Number(params.pageSize || 20),
    id: String(params.id || ''),
    name: String(params.name || ''),
    operatorName: String(params.operatorName || ''),
})

const fetchLabelList = async (
    params: Record<string, unknown> = {},
): Promise<TableFetchResult<Record<string, unknown>>> => {
    const response = await tagApi.getTagPageList(normalizeTagPageParams(params))

    return {
        list: response.list as unknown as Record<string, unknown>[],
        pageNo: Number(response.pageNo ?? params.pageNo ?? 1),
        pageSize: Number(response.pageSize ?? params.pageSize ?? 20),
        totalSize: Number(response.totalSize ?? 0),
    }
}

/**
 * 标签导出继续复用 TableSearchWrap 内建能力：
 * - 参数默认沿用当前搜索条件
 * - 去掉分页字段，保持与老项目导出口径一致
 */
const labelListExportConfig = computed<TableExportConfig>(() => ({
    buttonKey: 'export',
    buttonText: t('导出'),
    fileName: `${t('标签列表')}.xlsx`,
    buildParams: (params: Record<string, unknown>) => ({
        id: String(params.id || ''),
        name: String(params.name || ''),
        operatorName: String(params.operatorName || ''),
    }),
    exportApi: (params: Record<string, unknown>) =>
        tagApi.exportTagList(params as Parameters<typeof tagApi.exportTagList>[0]),
}))

const handleRefresh = async (): Promise<void> => {
    await tableWrapRef.value?.refresh()
}

const openCreateModal = (): void => {
    labelFormModalRef.value?.open('add')
}

const openEditModal = (record: LabelListRow): void => {
    labelFormModalRef.value?.open('edit', { id: String(record.id) })
}

const openViewModal = (record: LabelListRow): void => {
    labelFormModalRef.value?.open('view', { id: String(record.id) })
}

const handleDelete = (record: LabelListRow): void => {
    Modal.confirm({
        title: t('确认'),
        content: `${t('是否确认执行该操作？')}（${t('删除')}：${record.name || '--'}）`,
        okText: t('确认'),
        cancelText: t('取消'),
        onOk: async () => {
            await tagApi.deleteTag({ id: String(record.id) })
            Message.success(t('操作成功'))
            await handleRefresh()
        },
    })
}
</script>

<template>
    <div>
        <TableSearchWrap
            ref="tableWrapRef"
            :api-fetch="fetchLabelList"
            :table-columns="tableColumns"
            :search-conf="searchConf"
            :export-config="labelListExportConfig"
            :enable-column-sort="false"
            :scroll="{ x: 1200, y: 700 }"
            row-key="id"
        >
            <template #roleBtnWrap>
                <PermissionButton button-key="add" type="primary" @click="openCreateModal">
                    <template #icon>
                        <icon-plus />
                    </template>
                    {{ t('新增标签') }}
                </PermissionButton>
                <PermissionButton button-key="import-tags" type="primary" @click="importModalVisible = true">
                    {{ t('导入标签') }}
                </PermissionButton>
            </template>

            <template #name="{ record }">
                <a-tag :color="record.color">{{ record.name }}</a-tag>
            </template>

            <template #action="{ record }">
                <div class="flex flex-wrap items-center gap-3">
                    <PermissionButton button-key="edit" @click="openEditModal(record as LabelListRow)">
                        {{ t('编辑') }}
                    </PermissionButton>
                    <PermissionButton button-key="view" @click="openViewModal(record as LabelListRow)">
                        {{ t('查看') }}
                    </PermissionButton>
                    <PermissionButton
                        button-key="del"
                        status="danger"
                        @click="handleDelete(record as LabelListRow)"
                    >
                        {{ t('删除') }}
                    </PermissionButton>
                </div>
            </template>
        </TableSearchWrap>

        <LabelFormModal ref="labelFormModalRef" @success="handleRefresh" />
        <ImportTagsModal v-model:visible="importModalVisible" @success="handleRefresh" />
    </div>
</template>
