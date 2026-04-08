<template>
    <!--
        用户资产冻结表：
        - 搜索：用户UID / 币种 / 冻结订单号 / 冻结时间
        - 操作：解冻（opState === 1 时显示）
        - 无导出按钮（老项目中导出逻辑被注释掉）
    -->
    <TableSearchWrap
        ref="tableRef"
        :search-conf="searchConf"
        :table-columns="columns"
        :api-fetch="apiFetch"
    />

    <!-- 解冻弹窗 -->
    <UserAssetThawModal
        v-if="modalVisible"
        :visible="modalVisible"
        :active-data="activeData"
        @close="modalVisible = false"
        @success="handleRefresh"
    />
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import TableSearchWrap from '@/components/TableSearchWrap/Index.vue';
import type { ColumnType, SearchOption, TableSearchWrapExpose } from '@/interface/TableType';
import assetApi from '@/api/userApi/asset/index';
import type { UserAssetFrozenItem } from '@/api/userApi/asset/index';
import { buildTableFetchResult } from '@/utils/table';
import { useOnActivated } from '@/use/useOnActivated';
import UserAssetThawModal from './modal/UserAssetThawModal.vue';

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
    { title: t('业务类型'), dataIndex: 'frozenType', width: 180 },
    { title: t('冻结数量'), dataIndex: 'frozenAmount', width: 150 },
    { title: t('可解冻数量'), dataIndex: 'thawAmount', width: 150 },
    { title: t('动账原因'), dataIndex: 'reason', width: 100,
    },
    { title: t('订单号'), dataIndex: 'orderNo', width: 180,
    },
    { title: t('操作人'), dataIndex: 'sysUser', width: 120 },
    { title: t('冻结时间'), dataIndex: 'createTime', width: 160 },
    {
        title: t('操作'),
        dataIndex: 'action',
        fixed: 'right',
        width: 100,
        cellPreset: {
            type: 'actionButtons',
            buttons: [
                {
                    buttonKey: 'userAssetFreeze:unfreeze',
                    text: t('解冻'),
                    type: 'text',
                    size: 'small',
                    show: (record) => Number(record.opState) === 1,
                    onClick: (record) =>
                        handleOpenThawModal(record as unknown as UserAssetFrozenItem),
                },
            ],
        },
    },
]);

// ─── 数据获取 ──────────────────────────────────────────────────────────────────
const apiFetch = async (params?: Record<string, unknown>) => {
    const res = await assetApi.getUserAssetFrozenList((params ?? {}) as unknown as Parameters<typeof assetApi.getUserAssetFrozenList>[0]);
    return buildTableFetchResult({ response: res, params: params ?? {} });
};

// ─── 弹窗逻辑 ──────────────────────────────────────────────────────────────────
const modalVisible = ref(false);
const activeData = ref<UserAssetFrozenItem>({} as UserAssetFrozenItem);

const handleOpenThawModal = (record: UserAssetFrozenItem) => {
    activeData.value = record;
    modalVisible.value = true;
};

const tableRef = ref<TableSearchWrapExpose | null>(null);
const handleRefresh = () => {
    tableRef.value?.refresh();
};

// ─── 左侧菜单点击（onActivated）刷新表格数据 ────────────────────────────────────
useOnActivated(() => {
    tableRef.value?.refresh();
});

</script>
