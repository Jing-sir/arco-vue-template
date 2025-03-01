<script setup lang="ts">
import { SearchOption } from '@/interface/TableType';
import SearchWrap from './SearchWrap/Index.vue';
import { useRequest } from 'vue-request';
import { PropType } from 'vue';

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
        type: Function as PropType<(params: any) => Promise<any>>,
        required: true,
    },
    tableColumns: {
        type: Array as PropType<{
            title: string;
            dataIndex: string;
            width: number;
            fixed?: string;
            key: string;
        }[]>,
        required: true,
    }
});

const { data: dataSource, loading, runAsync: fetchTableData } = useRequest(async (obj: { [key: string]: string }) => {
    if (!props.apiFetch) return [];
    const { list, pageNo, pageSize, totalSize } = await props?.apiFetch({ ...obj, pageNo: paginationConfig.current, pageSize: paginationConfig.pageSize });
    updatePagination(pageNo, pageSize, totalSize);
    return list;
}, { manual: true });

const onSearch = (obj: { [key: string]: string }): void => {
    paginationConfig.current = 1;
    fetchTableData(obj);
};

const { paginationConfig, onSizeChange, updatePagination, onPageSizeChange } = useTableConf(fetchTableData);

fetchTableData();
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
