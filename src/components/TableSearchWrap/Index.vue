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

/**
 * 表格区域最小纵向滚动高度
 * 防止在小数据量或大屏下表格区域过矮，影响视觉体验
 */
const TABLE_MIN_SCROLL_Y = 600

/**
 * 视口底部预留间距
 * 用于计算表格自适应高度时，给页面底部保留一定空间
 */
const TABLE_BOTTOM_GAP = 46

/**
 * 表格滚动配置
 */
interface TableScrollConfig {
    x?: number | string | true
    y?: number | string
}

/**
 * 表格包装组件 Props
 */
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

/**
 * 搜索表单实例
 * 用于在外部触发 reset 时，同步重置搜索表单 UI
 */
const searchWrapRef = ref<TableSearchFormExpose | null>(null)

/**
 * 表格容器 DOM 引用
 * 用于动态计算表格滚动高度
 */
const tableContainerRef = ref<HTMLElement | null>(null)

/**
 * 当前自动计算后的表格纵向滚动高度
 */
const autoScrollY = ref<number>(TABLE_MIN_SCROLL_Y)

/**
 * ResizeObserver 实例
 * 监听表格容器尺寸变化后重新计算 scrollY
 */
let tableResizeObserver: ResizeObserver | null = null

/**
 * 当前实际生效的查询参数
 * 作用：
 * 1. 搜索后缓存条件
 * 2. 刷新时沿用当前条件
 * 3. 翻页时继续使用同一组筛选参数
 */
const currentSearchParams = ref<SearchParams>({ ...props.defaultParams })

/**
 * 统一规范化列配置
 *
 * 处理内容：
 * 1. 如果列未显式设置 key，则自动兜底生成
 * 2. 递归处理 children，保证子列结构一致
 */
const normalizeColumns = (columns: ColumnType[]): ColumnType[] =>
    columns.map((column) => ({
        ...column,
        key: column.key ?? column.dataIndex ?? String(column.title),
        children: column.children ? normalizeColumns(column.children) : undefined,
    }))

/**
 * 规范化后的表格列
 */
const normalizedColumns = computed(() => normalizeColumns(props.tableColumns))

/**
 * 需要进行具名插槽透传的列
 * 只有定义了 slotName 的列，才需要在 a-table 中动态挂插槽
 */
const slotColumns = computed(() => normalizedColumns.value.filter((column) => column.slotName))

/**
 * 合并表格 locale 配置
 *
 * 主要用于统一处理 emptyText：
 * - 优先使用外部 tableProps.locale.emptyText
 * - 否则使用当前组件传入的 emptyText，并走 i18n
 */
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

/**
 * 表格数据请求
 *
 * 每次请求时会：
 * 1. 合并 defaultParams 和当前传入参数
 * 2. 自动带上 pageNo / pageSize
 * 3. 请求成功后同步更新分页信息
 */
const {
    data: dataSource,
    loading,
    runAsync: fetchTableData,
} = useRequest(
    async (params: SearchParams = currentSearchParams.value): Promise<unknown[]> => {
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
    {
        manual: true,
    },
)

/**
 * 发起搜索
 *
 * 搜索时默认回到第一页，避免沿用旧页码造成结果异常
 */
const searchTable = (params: SearchParams = currentSearchParams.value): Promise<unknown[]> => {
    paginationConfig.current = 1
    return fetchTableData(params)
}

/**
 * 刷新表格
 * 使用当前缓存的搜索条件重新拉取数据
 */
const refreshTable = (): Promise<unknown[]> => fetchTableData(currentSearchParams.value)

/**
 * 重置表格
 *
 * 逻辑：
 * 1. 如果存在搜索表单组件，则优先调用其 reset，保持 UI 与数据同步
 * 2. 否则直接重置内部查询参数并请求第一页数据
 */
const resetTable = (): void => {
    if (searchWrapRef.value) {
        searchWrapRef.value.reset()
        return
    }

    currentSearchParams.value = { ...props.defaultParams }
    paginationConfig.current = 1
    fetchTableData(currentSearchParams.value)
}

/**
 * 获取当前查询参数
 * 对外暴露时返回拷贝，避免被外部直接修改内部状态
 */
const getSearchParams = (): SearchParams => ({ ...currentSearchParams.value })

/**
 * 表格分页配置与分页事件
 * 来自你项目里的 useTableConf
 */
const { paginationConfig, onSizeChange, updatePagination, onPageSizeChange } =
    useTableConf<SearchParams>(refreshTable)

/**
 * 是否展示工具栏
 *
 * 工具栏展示条件：
 * 1. 开启刷新按钮
 * 2. 存在 roleBtnWrap 插槽
 * 3. 存在 totalWrap 插槽
 * 4. 存在 actionsWrap 插槽
 */
const showToolbar = computed(
    () =>
        props.showRefresh ||
        Boolean(slots.roleBtnWrap) ||
        Boolean(slots.totalWrap) ||
        Boolean(slots.actionsWrap),
)

/**
 * 当前数据总条数
 */
const totalCount = computed(() => Number(paginationConfig.total ?? 0))

/**
 * 基础滚动配置
 *
 * 优先级：
 * tableProps.scroll > props.scroll
 */
const baseScrollConfig = computed<TableScrollConfig>(() => {
    const scrollConfig = props.tableProps.scroll ?? props.scroll
    return scrollConfig && typeof scrollConfig === 'object' ? { ...scrollConfig } : {}
})

/**
 * 是否启用自动纵向高度计算
 * 只有当 scroll.y 存在时才进行自动计算
 */
const shouldAutoScrollY = computed(() => typeof baseScrollConfig.value.y !== 'undefined')

/**
 * 获取最小纵向滚动高度
 *
 * 如果外部传入的是数字，则取外部值与 TABLE_MIN_SCROLL_Y 中的较大值
 * 否则回退到默认最小高度
 */
const getMinScrollY = (): number => {
    const scrollY = baseScrollConfig.value.y

    if (typeof scrollY === 'number' && Number.isFinite(scrollY)) {
        return Math.max(scrollY, TABLE_MIN_SCROLL_Y)
    }

    return TABLE_MIN_SCROLL_Y
}

/**
 * 同步自动滚动高度
 *
 * 计算公式：
 * 当前视口剩余可用高度
 * - 表头高度
 * - 分页器高度
 * - 页面底部预留间距
 */
const syncAutoScrollY = (): void => {
    if (!shouldAutoScrollY.value || !tableContainerRef.value) return

    const tableRect = tableContainerRef.value.getBoundingClientRect()
    const tableHeader = tableContainerRef.value.querySelector(
        '.arco-table-header',
    ) as HTMLElement | null
    const tablePagination = tableContainerRef.value.querySelector(
        '.arco-pagination',
    ) as HTMLElement | null

    const availableViewportHeight = window.innerHeight - tableRect.top - TABLE_BOTTOM_GAP
    const occupiedHeight = (tableHeader?.offsetHeight ?? 46) + (tablePagination?.offsetHeight ?? 64)

    autoScrollY.value = Math.max(
        Math.floor(availableViewportHeight - occupiedHeight),
        getMinScrollY(),
    )
}

/**
 * 合并后的滚动配置
 *
 * 如果未启用自动高度，则直接使用基础配置
 * 如果启用，则动态替换 y
 */
const mergedScrollConfig = computed<TableScrollConfig>(() => {
    if (!shouldAutoScrollY.value) {
        return baseScrollConfig.value
    }

    return {
        ...baseScrollConfig.value,
        y: autoScrollY.value,
    }
})

/**
 * 合并后的 a-table props
 *
 * 统一注入：
 * 1. rowKey
 * 2. scroll
 * 3. locale
 * 4. pagination
 */
const mergedTableProps = computed(() => ({
    ...props.tableProps,
    rowKey: props.rowKey,
    scroll: mergedScrollConfig.value,
    locale: getTableLocale(),
    pagination: props.tableProps.pagination ?? paginationConfig,
}))

/**
 * 如果配置为立即加载，则组件初始化后自动请求一次数据
 */
if (props.immediate) {
    fetchTableData(currentSearchParams.value)
}

/**
 * 挂载后：
 * 1. 初始化一次自适应高度
 * 2. 监听容器尺寸变化
 * 3. 监听窗口 resize
 */
onMounted(() => {
    nextTick(() => {
        syncAutoScrollY()
    })

    if (tableContainerRef.value) {
        tableResizeObserver = new ResizeObserver(() => {
            syncAutoScrollY()
        })

        tableResizeObserver.observe(tableContainerRef.value)
    }

    window.addEventListener('resize', syncAutoScrollY)
})

/**
 * 卸载前清理事件与观察器
 */
onBeforeUnmount(() => {
    window.removeEventListener('resize', syncAutoScrollY)
    tableResizeObserver?.disconnect()
    tableResizeObserver = null
})

/**
 * 监听影响表格高度的关键状态
 *
 * 当以下任一变化时，下一帧重新计算表格滚动高度：
 * 1. 搜索区配置数量
 * 2. 工具栏显示状态
 * 3. loading
 * 4. totalCount
 * 5. 当前分页
 * 6. 数据长度
 */
watch(
    () => [
        props.searchConf.length,
        showToolbar.value,
        loading.value,
        totalCount.value,
        paginationConfig.pageSize,
        paginationConfig.current,
        dataSource.value?.length ?? 0,
    ],
    () => {
        nextTick(() => {
            syncAutoScrollY()
        })
    },
)

/**
 * 对外暴露的方法
 * 方便父组件通过 ref 主动调用
 */
defineExpose<TableSearchWrapExpose>({
    refresh: refreshTable,
    search: searchTable,
    reset: resetTable,
    getSearchParams,
})
</script>

<template>
    <div class="flex h-auto min-h-[auto] flex-col gap-[14px] bg-white p-2 rounded-lg">
        <!-- 搜索区 -->
        <div
            v-if="props.searchConf.length || slots.searchWrap"
            class="border-b border-[var(--app-divider)] bg-transparent pb-[14px]"
        >
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

        <!-- 工具栏 -->
        <div v-if="showToolbar" class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-3">
                <slot name="roleBtnWrap" />
                <slot
                    name="totalWrap"
                    :total="totalCount"
                    :data-source="dataSource || []"
                    :loading="loading"
                />
            </div>

            <div class="flex flex-wrap items-center justify-end gap-3">
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

        <!-- 表格区 -->
        <div
            ref="tableContainerRef"
            class="overflow-hidden rounded-[10px] bg-[var(--app-surface-strong)]"
        >
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
/**
 * 这里只保留 Arco Table 内部节点的覆盖样式
 * 组件外层布局、间距、背景、圆角都已经迁移到 Tailwind
 */

:deep(.arco-table-container) {
    border-radius: 4px;
}

:deep(.arco-table-th) {
    background: #f5f7fa;
    color: #4b5563;
    font-weight: 600;
}

:deep(.arco-table-tr .arco-table-td) {
    border-bottom-color: var(--app-divider);
}

:deep(.arco-table-tr:hover .arco-table-td) {
    background: #f8fafc;
}
</style>
