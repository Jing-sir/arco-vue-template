<template>
    <!--
        代理商资产划转记录页：
        - 搜索：代理商ID / 资产类型 / 操作时间
        - 支持导出
        - 备注列使用省略号展示，点击弹出完整内容（TableSearchWrap 默认长文本行为）
    -->
    <TableSearchWrap
        ref="tableRef"
        :search-conf="searchConf"
        :table-columns="columns"
        :api-fetch="apiFetch"
        :export-config="exportConfig"
    />
</template>

<script lang="ts" setup>
import type {
    ColumnType,
    SearchOption,
    TableExportConfig,
    TableSearchWrapExpose,
} from '@/interface/TableType'
import TableSearchWrap from '@/components/TableSearchWrap/Index.vue'
import { buildTableFetchResult } from '@/utils/table'
import { useOnActivated } from '@/use/useOnActivated'
import assetApi from '@/api/userApi/asset/index'

const { t } = useI18n()

// ─── 搜索配置 ──────────────────────────────────────────────────────────────────
const searchConf = computed<SearchOption[]>(() => [
    { label: t('代理商ID'), modelKey: 'agentId', type: 'input', placeholder: t('请输入') },
    { label: t('资产类型'), modelKey: 'coinId', type: 'input', placeholder: t('请输入') },
    {
        label: t('操作时间'),
        modelKey: ['startTime', 'endTime'],
        type: 'date',
    },
])

// ─── 表格列配置 ────────────────────────────────────────────────────────────────
const columns = computed<ColumnType[]>(() => [
    { title: t('ID'), dataIndex: 'id', width: 180, ellipsis: true },
    { title: t('划转订单号'), dataIndex: 'orderNo', width: 180, ellipsis: true },
    { title: t('资产类型'), dataIndex: 'symbol', width: 120 },
    { title: t('卡号'), dataIndex: 'cardNo', width: 180, ellipsis: true },
    { title: t('发起数量'), dataIndex: 'amount', width: 150 },
    { title: t('扣除手续费'), dataIndex: 'fee', width: 150 },
    { title: t('资产人转出Id'), dataIndex: 'agentAssetId', width: 180, ellipsis: true },
    { title: t('备注'), dataIndex: 'remarks', width: 200, ellipsis: true },
    { title: t('操作时间'), dataIndex: 'createTime', width: 160 },
])

// ─── 数据获取 ──────────────────────────────────────────────────────────────────
const apiFetch = async (params?: Record<string, unknown>) => {
    const res = await assetApi.getAgentTransferList(
        (params ?? {}) as Parameters<typeof assetApi.getAgentTransferList>[0],
    )
    return buildTableFetchResult({ response: res, params: params ?? {} })
}

// ─── 导出配置 ──────────────────────────────────────────────────────────────────
const exportConfig = computed<TableExportConfig>(() => ({
    exportApi: async (params: Record<string, unknown>) =>
        assetApi.exportAgentTransferList(
            params as Parameters<typeof assetApi.exportAgentTransferList>[0],
        ),
    fileName: `${t('划转记录')}.xlsx`,
    buttonKey: 'transfer:export',
}))

// ─── 左侧菜单点击（onActivated）刷新表格数据 ────────────────────────────────────
const tableRef = ref<TableSearchWrapExpose | null>(null)

useOnActivated(() => {
    tableRef.value?.refresh()
})
</script>
