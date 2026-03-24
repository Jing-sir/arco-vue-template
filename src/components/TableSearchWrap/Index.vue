<script setup lang="ts">
import SearchWrap from './SearchWrap/Index.vue'
import { useRequest } from 'vue-request'
import type {
    ColumnType,
    SearchOption,
    SearchParams,
    TableFetchResult,
    TableRowKey,
    TableSearchFormExpose,
    TableSearchWrapExpose,
} from '@/interface/TableType'
import { useSlots } from 'vue'

interface TableScrollConfig {
    x?: number | string | true
    y?: number | string
}

interface TableSearchWrapProps {
    searchConf?: SearchOption[]
    isMore?: boolean
    apiFetch: (params?: Record<string, unknown>) => Promise<TableFetchResult>
    tableColumns: ColumnType[]
    defaultParams?: SearchParams
    immediate?: boolean
    rowKey?: TableRowKey
    emptyText?: string
    scroll?: TableScrollConfig
    tableProps?: Record<string, unknown>
    showRefresh?: boolean
}

const props = withDefaults(defineProps<TableSearchWrapProps>(), {
    searchConf: () => [],
    isMore: true,
    defaultParams: () => ({}),
    immediate: true,
    rowKey: 'id',
    emptyText: '暂无数据',
    scroll: () => ({ x: 1000, y: 600 }),
    tableProps: () => ({}),
    showRefresh: false,
})

const { t } = useI18n()
const slots = useSlots()
const searchWrapRef = ref<TableSearchFormExpose | null>(null)
// 缓存当前生效的筛选参数，便于刷新和分页继续复用同一组查询条件。
const currentSearchParams = ref<SearchParams>({ ...props.defaultParams })

// 统一整理列配置，确保每一列都有稳定 key，子列结构也保持一致。
const normalizeColumns = (columns: ColumnType[]): ColumnType[] =>
    columns.map((column) => ({
        ...column,
        key: column.key ?? column.dataIndex ?? String(column.title),
        children: column.children ? normalizeColumns(column.children) : undefined,
    }))

const normalizedColumns = computed(() => normalizeColumns(props.tableColumns))
// 只有声明了 slotName 的列才需要动态转发具名插槽。
const slotColumns = computed(() => normalizedColumns.value.filter((column) => column.slotName))

const getTableLocale = (): Record<string, unknown> => {
    const locale =
        props.tableProps.locale && typeof props.tableProps.locale === 'object'
            ? (props.tableProps.locale as Record<string, unknown>)
            : {}

    return {
        ...locale,
        emptyText: locale.emptyText ?? t(props.emptyText),
    }
}

const {
    data: dataSource,
    loading,
    runAsync: fetchTableData,
} = useRequest(
    async (params: SearchParams = currentSearchParams.value): Promise<unknown[]> => {
        // 将外部传入参数与默认参数合并，允许页面按需覆盖默认筛选项。
        currentSearchParams.value = {
            ...props.defaultParams,
            ...params,
        }

        const { list, pageNo, pageSize, totalSize } = await props.apiFetch({
            ...currentSearchParams.value,
            pageNo: paginationConfig.current,
            pageSize: paginationConfig.pageSize,
        })

        updatePagination(pageNo, pageSize, totalSize)
        return list
    },
    { manual: true },
)

// 发起新的搜索时，页码应始终回到第一页。
const searchTable = (params: SearchParams = currentSearchParams.value): Promise<unknown[]> => {
    paginationConfig.current = 1
    return fetchTableData(params)
}

const refreshTable = (): Promise<unknown[]> => fetchTableData(currentSearchParams.value)

const resetTable = (): void => {
    // 搜索表单存在时优先交给表单重置，保证界面状态和查询状态同步回到初始值。
    if (searchWrapRef.value) {
        searchWrapRef.value.reset()
        return
    }

    currentSearchParams.value = { ...props.defaultParams }
    paginationConfig.current = 1
    fetchTableData(currentSearchParams.value)
}

const getSearchParams = (): SearchParams => ({ ...currentSearchParams.value })

const { paginationConfig, onSizeChange, updatePagination, onPageSizeChange } =
    useTableConf<SearchParams>(refreshTable)

const showToolbar = computed(
    () =>
        props.showRefresh ||
        Boolean(slots.roleBtnWrap) ||
        Boolean(slots.totalWrap) ||
        Boolean(slots.actionsWrap),
)

const totalCount = computed(() => Number(paginationConfig.total ?? 0))

const mergedTableProps = computed(() => ({
    ...props.tableProps,
    rowKey: props.rowKey,
    scroll: props.tableProps.scroll ?? props.scroll,
    locale: getTableLocale(),
    pagination: props.tableProps.pagination ?? paginationConfig,
}))

if (props.immediate) {
    fetchTableData(currentSearchParams.value)
}

// 对外暴露刷新、搜索、重置等命令式方法，方便父页面主动控制表格。
defineExpose<TableSearchWrapExpose>({
    refresh: refreshTable,
    search: searchTable,
    reset: resetTable,
    getSearchParams,
})
</script>
<template>
    <div class="table-container table-shell">
        <div v-if="props.searchConf.length || slots.searchWrap" class="table-shell__filters">
            <slot name="searchWrap">
                <SearchWrap
                    v-if="props.searchConf.length"
                    ref="searchWrapRef"
                    :search-conf="props.searchConf"
                    :is-more="props.isMore"
                    @searchCallback="searchTable"
                />
            </slot>
        </div>

        <div v-if="showToolbar" class="table-shell__toolbar">
            <div class="table-shell__toolbar-group">
                <slot name="roleBtnWrap" />
                <slot
                    name="totalWrap"
                    :total="totalCount"
                    :data-source="dataSource || []"
                    :loading="loading"
                />
            </div>
            <div class="table-shell__toolbar-group table-shell__toolbar-group--actions">
                <slot
                    name="actionsWrap"
                    :refresh="refreshTable"
                    :reset="resetTable"
                    :loading="loading"
                    :search-params="getSearchParams()"
                />
                <a-button v-if="props.showRefresh" @click="refreshTable">
                    {{ t('刷新') }}
                </a-button>
            </div>
        </div>

        <div class="table-shell__table">
            <slot
                name="table"
                :data-source="dataSource || []"
                :loading="loading"
                :pagination="paginationConfig"
                :refresh="refreshTable"
                :reset="resetTable"
                :search-params="getSearchParams()"
            >
                <a-table
                    v-bind="mergedTableProps"
                    class="w-full"
                    :scroll="scroll"
                    :columns="normalizedColumns"
                    :data="dataSource || []"
                    :loading="loading"
                    @page-size-change="onPageSizeChange"
                    @page-change="onSizeChange"
                >
                    <template
                        v-for="column in slotColumns"
                        :key="column.key"
                        #[column.slotName]="slotProps"
                    >
                        <slot
                            :name="column.slotName"
                            v-bind="{
                                ...slotProps,
                                pagination: paginationConfig,
                                loading,
                                dataSource: dataSource || [],
                                searchParams: getSearchParams(),
                            }"
                        />
                    </template>
                </a-table>
            </slot>
        </div>
    </div>
</template>

<style scoped lang="scss">
.table-shell {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.table-shell__filters {
    border-radius: 10px;
    background: transparent;
    border-bottom: 1px solid var(--app-divider);
    padding: 0 0 14px;
}

.table-shell__toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.table-shell__toolbar-group {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}

.table-shell__toolbar-group--actions {
    justify-content: flex-end;
}

.table-shell__table {
    overflow: hidden;
    border-radius: 10px;
    background: var(--app-surface-strong);
}

:deep(.table-shell__table .arco-table-container) {
    border-radius: 4px;
}

:deep(.table-shell__table .arco-table-th) {
    background: #f5f7fa;
    color: #4b5563;
    font-weight: 600;
}

:deep(.table-shell__table .arco-table-tr .arco-table-td) {
    border-bottom-color: var(--app-divider);
}

:deep(.table-shell__table .arco-table-tr:hover .arco-table-td) {
    background: #f8fafc;
}
</style>
