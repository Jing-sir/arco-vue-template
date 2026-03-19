<script setup lang="ts">
import type { ColumnType, SearchOption, SearchParams } from '@/interface/TableType';
import SearchWrap from './SearchWrap/Index.vue';
import { useRequest } from 'vue-request';
import type { PropType } from 'vue';

const props = defineProps({
    searchConf: { // 搜索项配置
        type: Array as PropType<SearchOption[]>,
        required: true,
        default: () => [],
    },
    isMore: {
        type: Boolean,
        default: true,
    },
    apiFetch: {
        type: Function as PropType<
            (params?: Record<string, unknown>) => Promise<{
                list: unknown[];
                pageNo: number;
                pageSize: number;
                totalSize: number;
            }>
        >,
        required: true,
    },
    tableColumns: {
        type: Array as PropType<ColumnType[]>,
        required: true,
    },
});

const currentSearchParams = ref<SearchParams>({});

const { data: dataSource, loading, runAsync: fetchTableData } = useRequest(async (obj: SearchParams = {}) => {
    if (!props.apiFetch) return [];
    currentSearchParams.value = obj;

    const { list, pageNo, pageSize, totalSize } = await props.apiFetch({
        ...currentSearchParams.value,
        pageNo: paginationConfig.current,
        pageSize: paginationConfig.pageSize,
    });

    updatePagination(pageNo, pageSize, totalSize);
    return list;
}, { manual: true });

const onSearch = (obj: SearchParams): void => {
    paginationConfig.current = 1;
    fetchTableData(obj);
};

const reloadTable = (params: SearchParams = currentSearchParams.value): Promise<unknown[]> =>
    fetchTableData(params);

const { paginationConfig, onSizeChange, updatePagination, onPageSizeChange } =
    useTableConf<SearchParams>(reloadTable);

fetchTableData({});
</script>
<template>
    <div class="w-full">
        <slot name="searchWrap">
            <SearchWrap :search-conf="props.searchConf" @searchCallback="onSearch" />
        </slot>
        <slot name="roleBtnWrap" />
        <slot name="totalWrap" />
        <slot name="table">
            <a-table
                class="w-full"
                :pagination="paginationConfig"
                :columns="props.tableColumns"
                :data="dataSource"
                :loading="loading"
                :scroll="{ x: 1000 }"
                @page-size-change="onPageSizeChange"
                @page-change="onSizeChange"
            >
                <template #optional>
                    <slot name="optional"></slot>
                </template>
            </a-table>
        </slot>
    </div>
</template>

<style scoped lang="scss"></style>
