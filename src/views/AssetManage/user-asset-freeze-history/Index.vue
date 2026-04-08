<template>
    <!--
        用户资产冻结历史页：
        - 搜索：用户UID / 币种 / 冻结订单号 / 冻结时间
        - 类型列：冻结=红色 / 解冻=绿色（通过 statusText preset 实现）
        - 无操作按钮，无导出（老项目导出已注释）
    -->
    <TableSearchWrap
        ref="tableRef"
        :search-conf="searchConf"
        :table-columns="columns"
        :api-fetch="apiFetch"
    />
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import TableSearchWrap from '@/components/TableSearchWrap/Index.vue';
import type { ColumnType, SearchOption, TableSearchWrapExpose } from '@/interface/TableType';
import assetApi from '@/api/userApi/asset/index';
import type { UserAssetFrozenLogItem } from '@/api/userApi/asset/index';
import { buildTableFetchResult } from '@/utils/table';
import { useOnActivated } from '@/use/useOnActivated';

const { t } = useI18n();

// ─── 搜索配置 ──────────────────────────────────────────────────────────────────
const searchConf = computed<SearchOption[]>(() => [
    { label: t('用户UID'), modelKey: 'userId', type: 'input', placeholder: t('请输入用户UID') },
    { label: t('币种'), modelKey: 'coinId', type: 'input', placeholder: t('请输入') },
    { label: t('冻结订单号'), modelKey: 'orderNo', type: 'input', placeholder: t('请输入订单号') },
    {
        label: t('冻结时间'),
        modelKey: ['startTime', 'endTime'],
        type: 'date',
    },
]);

// ─── 表格列配置 ────────────────────────────────────────────────────────────────
const columns = computed<ColumnType[]>(() => [
    { title: t('ID'), dataIndex: 'id', width: 80,
    },
    { title: t('用户UID'), dataIndex: 'userId', width: 200,
    },
    { title: t('币种'), dataIndex: 'symbol', width: 120 },
    { title: t('冻结类型'), dataIndex: 'frozenType', width: 180 },
    { title: t('冻结数量'), dataIndex: 'amount', width: 120 },
    { title: t('冻结原因'), dataIndex: 'reason', width: 100,
    },
    { title: t('冻结订单号'), dataIndex: 'orderNo', width: 220,
    },
    { title: t('冻结人'), dataIndex: 'sysUser', width: 120 },
    { title: t('冻结时间'), dataIndex: 'createTime', width: 160 },
    {
        title: t('类型'),
        dataIndex: 'typeName',
        width: 100,
        // type=1 冻结显示红色，type=2 解冻显示绿色，与老项目一致
        cellPreset: { type: 'statusText', preset: 'assetFrozenType' },
    },
]);

// ─── 数据获取 ──────────────────────────────────────────────────────────────────
const apiFetch = async (params?: Record<string, unknown>) => {
    const res = await assetApi.getUserAssetFrozenLogList((params ?? {}) as unknown as Parameters<typeof assetApi.getUserAssetFrozenLogList>[0]);
    return buildTableFetchResult({ response: res, params: params ?? {} });
};

// ─── 左侧菜单点击（onActivated）刷新表格数据 ────────────────────────────────────
const tableRef = ref<TableSearchWrapExpose | null>(null);
useOnActivated(() => {
    tableRef.value?.refresh();
});
</script>
