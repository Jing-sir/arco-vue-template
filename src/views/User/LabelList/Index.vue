<script setup lang="ts">
import tagApi from '@/api/userApi/tag'
import TableSearchWrap from '@/components/TableSearchWrap/Index.vue'
import type {
    ColumnType,
    SearchOption,
    TableExportConfig,
    TableFetchResult,
    TableToolbarButtonConfig,
    TableSearchWrapExpose,
} from '@/interface/TableType'
import { buildTableFetchResult } from '@/utils/table'
import { Message } from '@arco-design/web-vue'
import useConfirmAction from '@/use/useConfirmAction'
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
const { confirmAndRun } = useConfirmAction()

const tableWrapRef = ref<TableSearchWrapExpose | null>(null)
const labelFormModalRef = ref<LabelFormModalExpose | null>(null)
const importModalVisible = ref(false)

const searchConf = computed<SearchOption[]>(() => [
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

const toolbarButtons = computed<TableToolbarButtonConfig[]>(() => [
    {
        buttonKey: 'add',
        text: t('新增标签'),
        type: 'primary',
        onClick: () => {
            openCreateModal()
        },
    },
    {
        buttonKey: 'import-tags',
        text: t('导入标签'),
        type: 'primary',
        onClick: () => {
            importModalVisible.value = true
        },
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
        fixed: 'right',
        width: 260,
        sorter: false,
        cellPreset: {
            type: 'actionButtons',
            buttons: [
                {
                    buttonKey: 'edit',
                    text: t('编辑'),
                    onClick: (record) => openEditModal(record as LabelListRow),
                },
                {
                    buttonKey: 'view',
                    text: t('查看'),
                    onClick: (record) => openViewModal(record as LabelListRow),
                },
                {
                    buttonKey: 'del',
                    status: 'danger',
                    text: t('删除'),
                    onClick: (record) => handleDelete(record as LabelListRow),
                },
            ],
        },
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

    return buildTableFetchResult<Record<string, unknown>>({
        response,
        params,
    })
}

const exportConfig = computed<TableExportConfig>(() => ({
    exportApi: (params: Record<string, unknown>) =>
        tagApi.exportTagList(params as Parameters<typeof tagApi.exportTagList>[0]),
    fileName: `${t('标签列表')}.xlsx`,
    buildParams: (params: Record<string, unknown>) => ({
        id: String(params.id || ''),
        name: String(params.name || ''),
        operatorName: String(params.operatorName || ''),
    }),
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
    confirmAndRun({
        content: `${t('是否确认执行该操作？')}（${t('删除')}：${record.name || '--'}）`,
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
            :export-config="exportConfig"
            :toolbar-buttons="toolbarButtons"
            :enable-column-sort="false"
            :scroll="{ x: 1200, y: 700 }"
            row-key="id"
        >
            <template #name="{ record }">
                <a-tag :color="record.color">{{ record.name }}</a-tag>
            </template>
        </TableSearchWrap>

        <LabelFormModal ref="labelFormModalRef" @success="handleRefresh" />
        <ImportTagsModal v-model:visible="importModalVisible" @success="handleRefresh" />
    </div>
</template>
