<template>
    <!-- 代理商资产列表页：支持按代理商ID/币种搜索，操作包括冻结/解冻/划转，以及导出和快照 -->
    <TableSearchWrap
        ref="tableRef"
        :search-conf="searchConf"
        :table-columns="columns"
        :api-fetch="apiFetch"
        :export-config="exportConfig"
        :toolbar-buttons="toolbarButtons"
    />

    <!-- 冻结/解冻/划转操作弹窗 -->
    <AgentAssetActionModal
        v-if="modalVisible"
        :visible="modalVisible"
        :type="modalType"
        :active-data="activeData"
        @close="modalVisible = false"
        @success="handleRefresh"
    />
</template>

<script lang="ts" setup>
import type {
    ColumnType,
    SearchOption,
    TableExportConfig,
    TableToolbarButtonConfig,
    TableSearchWrapExpose,
} from '@/interface/TableType'
import AgentAssetActionModal from './modal/AgentAssetActionModal.vue'
import TableSearchWrap from '@/components/TableSearchWrap/Index.vue'
import type { AgentAssetItem } from '@/api/userApi/asset'
import { useOnActivated } from '@/use/useOnActivated'
import { buildTableFetchResult } from '@/utils/table'
import assetApi from '@/api/userApi/asset/index'

const { t } = useI18n()

// ─── 搜索配置 ──────────────────────────────────────────────────────────────────
const searchConf = computed<SearchOption[]>(() => [
    {
        label: t('代理商ID'),
        modelKey: 'agentId',
        type: 'input',
        placeholder: t('请输入'),
    },
    {
        label: t('资产类型'),
        modelKey: 'coinId',
        type: 'input',
        placeholder: t('请输入'),
    },
])

// ─── 表格列配置 ────────────────────────────────────────────────────────────────
const columns = computed<ColumnType[]>(() => [
    { title: t('ID'), dataIndex: 'id', width: 180,
    },
    { title: t('资产类型'), dataIndex: 'symbol', width: 120 },
    { title: t('资产人ID'), dataIndex: 'agentId', width: 160,
    },
    { title: t('可用数量'), dataIndex: 'balance', width: 140 },
    { title: t('冻结数量'), dataIndex: 'frozenBalance', width: 140 },
    {
        title: t('操作'),
        dataIndex: 'action',
        fixed: 'right',
        width: 220,
        cellPreset: {
            type: 'actionButtons',
            buttons: [
                {
                    buttonKey: 'agentAssetList:freeze',
                    text: t('冻结'),
                    type: 'text',
                    status: 'danger',
                    size: 'small',
                    show: (record) => Number(record.balance) > 0,
                    onClick: (record) =>
                        handleOpenModal(record as unknown as AgentAssetItem, 'Frozen'),
                },
                {
                    buttonKey: 'agentAssetList:unFreezze',
                    text: t('解冻'),
                    type: 'text',
                    size: 'small',
                    show: (record) => Number(record.frozenBalance) > 0,
                    onClick: (record) =>
                        handleOpenModal(record as unknown as AgentAssetItem, 'Thaw'),
                },
                {
                    buttonKey: 'agentAssetList:transfer',
                    text: t('划转'),
                    type: 'text',
                    status: 'danger',
                    size: 'small',
                    onClick: (record) =>
                        handleOpenModal(record as unknown as AgentAssetItem, 'Transfer'),
                },
            ],
        },
    },
])

// ─── 数据获取 ──────────────────────────────────────────────────────────────────
/**
 * apiFetch 适配 TableSearchWrap 的接口签名：
 * 接收 params（包含搜索字段 + pageNo/pageSize），返回标准分页结构。
 */
const apiFetch = async (params?: Record<string, unknown>) => {
    const res = await assetApi.getAgentAssetList(
        (params ?? {}) as Parameters<typeof assetApi.getAgentAssetList>[0],
    )
    return buildTableFetchResult({ response: res, params: params ?? {} })
}

// ─── 工具栏按钮（快照） ───────────────────────────────────────────────────────────
const snapshotLoading = ref(false)
const toolbarButtons = computed<TableToolbarButtonConfig[]>(() => [
    {
        buttonKey: 'agentAssetList:snapshot',
        text: t('快照代理商资产'),
        type: 'primary' as const,
        loading: snapshotLoading.value,
        onClick: async () => {
            if (snapshotLoading.value) return
            snapshotLoading.value = true
            try {
                await assetApi.snapshotAgentAsset()
            } finally {
                snapshotLoading.value = false
            }
        },
    },
])

// ─── 导出配置 ──────────────────────────────────────────────────────────────────
/**
 * exportApi 直接返回 Blob，TableSearchWrap 内部的 ExportButton 组件
 * 统一负责触发下载，页面侧无需手动调用 downloadExcel。
 */
const exportConfig = computed<TableExportConfig>(() => ({
    exportApi: async (params: Record<string, unknown>) =>
        assetApi.exportAgentAssetList(
            params as Parameters<typeof assetApi.exportAgentAssetList>[0],
        ),
    fileName: `${t('代理商资产')}.xlsx`,
    buttonKey: 'agentAssetList:export',
}))

// ─── 弹窗逻辑 ──────────────────────────────────────────────────────────────────
const modalVisible = ref(false)
const modalType = ref<'Frozen' | 'Thaw' | 'Transfer'>('Frozen')
const activeData = ref<AgentAssetItem>({} as AgentAssetItem)

/** 打开冻结/解冻/划转弹窗 */
const handleOpenModal = (record: AgentAssetItem, type: typeof modalType.value) => {
    activeData.value = record
    modalType.value = type
    modalVisible.value = true
}

// ─── 刷新逻辑 ──────────────────────────────────────────────────────────────────
/** 弹窗操作成功后触发表格刷新 */
const tableRef = ref<TableSearchWrapExpose | null>(null)
const handleRefresh = () => {
    tableRef.value?.refresh()
}

// ─── 左侧菜单点击（onActivated）刷新表格数据 ────────────────────────────────────
// tabbar 切换（#no-refresh）时 useOnActivated 内部会跳过，保留搜索缓存；
// 点击左侧 menu（无 hash）时正常触发，请求最新数据。
useOnActivated(() => {
    tableRef.value?.refresh()
})

</script>
