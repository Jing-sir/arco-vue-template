<script setup lang="ts">
import TableSearchWrap from '@/components/TableSearchWrap/Index.vue';
import StatusText from '@/components/TableSearchWrap/components/StatusText.vue';
import type {
    ColumnType,
    SearchOption,
    TableSearchSorterConfig,
    TableSearchWrapExpose,
} from '@/interface/TableType';
import api from '@/api/fetchTest/index';

const { t } = useI18n();

const tableWrapRef = ref<TableSearchWrapExpose | null>(null);

const searchConf = ref<SearchOption[]>([
    {
        label: '操作人',
        modelKey: 'opAccount',
        placeholder: '请输入',
        type: 'input',
        value: '',
    },
    {
        label: '请求功能',
        modelKey: 'reqFunc',
        placeholder: '请输入',
        type: 'input',
        value: '',
    },
    {
        label: '操作时间',
        modelKey: ['startTime', 'endTime'],
        sortField: 'opTime',
        sortType: 'date',
        type: 'date',
        value: [],
    },
]);

const searchSorter: TableSearchSorterConfig = {
    enabled: true,
};

const tableColumns = computed<ColumnType[]>(() => [
    {
        title: 'ID',
        dataIndex: 'id',
        width: 180,
        fixed: 'left',
        sorter: {
            type: 'number',
        },
    },
    { title: t('操作人'), dataIndex: 'opAccount', width: 120, sorter: false },
    {
        title: t('操作时间'),
        dataIndex: 'opTime',
        width: 180,
        sorter: {
            type: 'date',
        },
    },
    { title: 'IP', dataIndex: 'ip', width: 140, sorter: false },
    { title: t('请求功能'), dataIndex: 'reqFunc', width: 180, sorter: false },
    { title: t('请求URL'), dataIndex: 'reqUrl', width: 220, sorter: false },
    { title: t('请求报文'), dataIndex: 'reqData', slotName: 'reqData', width: 100, sorter: false },
    { title: t('响应报文'), dataIndex: 'respData', slotName: 'respData', width: 100, sorter: false },
    { title: t('请求方式'), dataIndex: 'reqMethod', width: 120, sorter: false },
    {
        title: t('执行耗时(毫秒)'),
        dataIndex: 'elapsedTime',
        width: 150,
        sorter: {
            type: 'number',
        },
    },
    {
        title: t('是否发生错误的表示'),
        dataIndex: 'occurErr',
        slotName: 'occurErr',
        width: 160,
        sorter: {
            type: 'enum',
            enumOrder: [true, 1, false, 0],
        },
    },
    { title: t('发生错误的信息'), dataIndex: 'errMsg', slotName: 'errMsg', width: 200, sorter: false },
    {
        title: t('响应状态'),
        dataIndex: 'success',
        slotName: 'success',
        width: 120,
        fixed: 'right',
        sorter: {
            type: 'enum',
            enumOrder: [true, 1, false, 0],
        },
    },
]);

const fetchOperationLogList = (params: Record<string, unknown> = {}) =>
    api.fetchOperationLogList(params as Parameters<typeof api.fetchOperationLogList>[0]);

const getJsonText = (value: string): string => {
    if (!value) return '--';

    try {
        return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
        return value;
    }
};

useOnActivated(() => {
    tableWrapRef.value?.refresh();
});
</script>

<template>
    <TableSearchWrap
        ref="tableWrapRef"
        :api-fetch="fetchOperationLogList"
        :table-columns="tableColumns"
        :search-conf="searchConf"
        :search-sorter="searchSorter"
        row-key="id"
    >
        <template #reqData="{ record }">
            <a-popover position="top" trigger="click">
                <template #content>
                    <pre class="max-h-[400px] min-h-[300px] overflow-auto whitespace-pre-wrap break-all">
{{ getJsonText(record.reqData) }}</pre
                    >
                </template>
                <a-button type="text" size="small" class="!px-0">{{ t('详细') }}</a-button>
            </a-popover>
        </template>

        <template #respData="{ record }">
            <a-popover position="top" trigger="click">
                <template #content>
                    <pre class="max-h-[400px] min-h-[300px] overflow-auto whitespace-pre-wrap break-all">
{{ getJsonText(record.respData) }}</pre>
                </template>
                <a-button type="text" size="small" class="!px-0">{{ t('详细') }}</a-button>
            </a-popover>
        </template>

        <template #errMsg="{ record }">
            <a-popover v-if="record.errMsg" position="top" trigger="click">
                <template #content>
                    <div class="h-[400px] w-[400px] overflow-y-auto break-all px-5">
                        {{ record.errMsg }}
                    </div>
                </template>
                <a-button type="text" size="small" class="!px-0">{{ t('详细') }}</a-button>
            </a-popover>
            <span v-else>--</span>
        </template>

        <template #occurErr="{ record }">
            <StatusText :value="record.occurErr" preset="boolean" />
        </template>

        <template #success="{ record }">
            <StatusText :value="record.success" preset="success" />
        </template>
    </TableSearchWrap>
</template>
