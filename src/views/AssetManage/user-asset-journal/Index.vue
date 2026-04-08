<template>
    <!--
        用户资产流水页：
        - 搜索：用户UID / 历史代理商 / 动账订单号 / 动账类型（接口获取） / 状态 / 动账时间
        - 支持导出
        - 状态列使用 statusText preset
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
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import TableSearchWrap from '@/components/TableSearchWrap/Index.vue';
import type { ColumnType, SearchOption, TableExportConfig, TableSearchWrapExpose } from '@/interface/TableType';
import assetApi from '@/api/userApi/asset/index';
import type { AssetLogTypeItem } from '@/api/userApi/asset';
import { buildTableFetchResult } from '@/utils/table';
import { useOnActivated } from '@/use/useOnActivated';

const { t } = useI18n();

// ─── 动账类型下拉选项（activated 时异步拉取） ────────────────────────────────────
const typeOptions = ref<{ label: string; value: number | string }[]>([]);
const loadTypeOptions = async (): Promise<void> => {
    try {
        const list = await assetApi.getAssetLogTypeList();
        const safeList = Array.isArray(list) ? list : [];
        typeOptions.value = safeList.map((item: AssetLogTypeItem) => ({
            label: item.name,
            value: item.code,
        }));
    } catch {
        // 下拉加载失败时仅清空选项，不中断页面渲染流程，避免 keep-alive 激活时白屏。
        typeOptions.value = [];
    }
};

// ─── 搜索配置 ──────────────────────────────────────────────────────────────────
const searchConf = computed<SearchOption[]>(() => [
    { label: t('用户UID'), modelKey: 'accountId', type: 'input', placeholder: t('请输入') },
    { label: t('历史代理商'), modelKey: 'historyAgentName', type: 'input', placeholder: t('请输入') },
    { label: t('动账订单号'), modelKey: 'sourceOrderNo', type: 'input', placeholder: t('请输入') },
    {
        label: t('动账类型'),
        modelKey: 'sourceType',
        type: 'select',
        options: typeOptions.value,
    },
    {
        label: t('状态'),
        modelKey: 'state',
        type: 'select',
        options: [
            { label: t('已上账'), value: 1 },
            { label: t('失败'), value: 2 },
            { label: t('待上账'), value: 3 },
            { label: t('链异常'), value: 4 },
        ],
    },
    {
        label: t('动账时间'),
        modelKey: ['startTime', 'endTime'],
        type: 'date',
    },
]);

// ─── 表格列配置 ────────────────────────────────────────────────────────────────
const columns = computed<ColumnType[]>(() => [
    { title: t('流水ID'), dataIndex: 'id', width: 100,
    },
    { title: t('用户UID'), dataIndex: 'accountId', width: 200,
    },
    { title: t('历史代理商'), dataIndex: 'historyAgentName', width: 140 },
    { title: t('动账币种'), dataIndex: 'symbol', width: 100 },
    { title: t('动账金额'), dataIndex: 'amount', width: 100 },
    { title: t('动账订单号'), dataIndex: 'sourceOrderNo', width: 270,
    },
    { title: t('动账类型'), dataIndex: 'sourceType', width: 190 },
    {
        title: t('状态'),
        dataIndex: 'state',
        width: 100,
        cellPreset: { type: 'statusText', preset: 'userAssetLogState' },
    },
    { title: t('动账说明'), dataIndex: 'reason', width: 180,
    },
    { title: t('可用期初金额'), dataIndex: 'beforeBalance', width: 150 },
    { title: t('可用期末金额'), dataIndex: 'afterBalance', width: 150 },
    { title: t('AML资产期初'), dataIndex: 'beforeAmlBalance', width: 150 },
    { title: t('AML资产期末'), dataIndex: 'afterAmlBalance', width: 150 },
    { title: t('动账前冻结金额'), dataIndex: 'beforeFrozenBalanceTotal', width: 150 },
    { title: t('动账后冻结金额'), dataIndex: 'afterFrozenBalanceTotal', width: 150 },
    { title: t('充币冻结期初金额'), dataIndex: 'beforeDepositCoinFrozenBalance', width: 160 },
    { title: t('充币冻结期末金额'), dataIndex: 'afterDepositCoinFrozenBalance', width: 160 },
    { title: t('提币业务冻结期初金额'), dataIndex: 'beforeFrozenBalance', width: 180 },
    { title: t('提币业务冻结期末金额'), dataIndex: 'afterFrozenBalance', width: 180 },
    { title: t('风控冻结期初金额'), dataIndex: 'beforeRiskFrozenBalance', width: 160 },
    { title: t('风控冻结期末金额'), dataIndex: 'afterRiskFrozenBalance', width: 160 },
    { title: t('手工冻结期初金额'), dataIndex: 'beforeManualFrozenBalance', width: 160 },
    { title: t('手工冻结期末金额'), dataIndex: 'afterManualFrozenBalance', width: 160 },
    { title: t('闪兑业务冻结期初金额'), dataIndex: 'beforeSwapFrozenBalance', width: 180 },
    { title: t('闪兑业务冻结期末金额'), dataIndex: 'afterSwapFrozenBalance', width: 180 },
    { title: t('质押借贷业务冻结期初金额'), dataIndex: 'beforeBorrowFrozenBalance', width: 200 },
    { title: t('质押借贷业务冻结期末金额'), dataIndex: 'afterBorrowFrozenBalance', width: 200 },
    { title: t('汇款业务冻结期初金额'), dataIndex: 'beforeRemitFrozenBalance', width: 180 },
    { title: t('汇款业务冻结期末金额'), dataIndex: 'afterRemitFrozenBalance', width: 180 },
    { title: t('可消费卡期初金额'), dataIndex: 'beforeCardBalance', width: 160 },
    { title: t('可消费卡期末金额'), dataIndex: 'afterCardBalance', width: 160 },
    { title: t('卡消费业务冻结期初金额'), dataIndex: 'beforeCardFrozenBalance', width: 200 },
    { title: t('卡消费业务冻结期末金额'), dataIndex: 'afterCardFrozenBalance', width: 200 },
    { title: t('动账时间'), dataIndex: 'createTime', width: 180 },
    { title: t('动账版本'), dataIndex: 'version', width: 100 },
    { title: t('动账hash'), dataIndex: 'hash', width: 280,
    },
    { title: t('备注'), dataIndex: 'remarks', width: 180, fixed: 'right' },
]);

// ─── 数据获取 ──────────────────────────────────────────────────────────────────
const apiFetch = async (params?: Record<string, unknown>) => {
    const res = await assetApi.getUserAssetLogList((params ?? {}) as Parameters<typeof assetApi.getUserAssetLogList>[0]);
    return buildTableFetchResult({ response: res, params: params ?? {} });
};

// ─── 导出 ──────────────────────────────────────────────────────────────────────
const exportConfig = computed<TableExportConfig>(() => ({
    exportApi: async (params: Record<string, unknown>) =>
        assetApi.exportUserAssetLogList(params as Parameters<typeof assetApi.exportUserAssetLogList>[0]),
    fileName: `${t('用户资产流水')}.xlsx`,
    buttonKey: 'userAssetsJournal:export',
}));

// ─── tableRef 供 useOnActivated 调用 refresh ───────────────────────────────────
const tableRef = ref<TableSearchWrapExpose | null>(null);

// ─── 左侧菜单点击（onActivated）刷新数据 + 重新拉取动账类型下拉 ───────────────────
// tabbar 切换（#no-refresh）时 useOnActivated 内部跳过，保留搜索缓存。
useOnActivated(() => {
    tableRef.value?.refresh();
    void loadTypeOptions();
});
</script>
