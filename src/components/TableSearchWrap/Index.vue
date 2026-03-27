<script setup lang="ts">
import SearchWrap from './SearchWrap/Index.vue';
import ExportButton from './components/ExportButton.vue';
import { usePagination } from 'vue-request';
import { get } from 'lodash-es';
import type {
    ColumnType,
    SearchOption,
    SearchParams,
    TableExportConfig,
    TableFetchResult,
    TableRowKey,
    TableSearchFormExpose,
    TableSearchSorterConfig,
    TableSearchWrapExpose,
} from '@/interface/TableType';
import { PagingDefaultConf } from '@/utils/constant';
import { onCopyCode } from '@/utils/common';
import useTableSorter from '@/use/useTableSorter';
import { useSlots } from 'vue';

/**
 * 表格区域最小纵向滚动高度。
 * 即使屏幕再高，也保证列表区域至少维持一个稳定、可阅读的高度。
 */
const TABLE_MIN_SCROLL_Y = 600;

/**
 * 表格底部预留间距。
 * 这里按你的要求，给视口底部固定留 20px 空白。
 */
const TABLE_BOTTOM_GAP = 50;

/**
 * 表格滚动配置。
 * x 主要用于横向滚动，y 用于启用并约束纵向滚动。
 */
interface TableScrollConfig {
    x?: number | string | true;
    y?: number | string;
}

/**
 * 通用表格包装组件 Props。
 * 这里继续保持你当前页面层的调用方式，避免迁移分页实现时影响业务页面。
 */
interface TableSearchWrapProps {
    searchConf?: SearchOption[];
    isMore?: boolean;
    apiFetch: (params?: Record<string, unknown>) => Promise<TableFetchResult>;
    tableColumns: ColumnType[];
    exportConfig?: TableExportConfig | null;
    defaultParams?: SearchParams;
    immediate?: boolean;
    rowKey?: TableRowKey;
    emptyText?: string;
    scroll?: TableScrollConfig;
    tableProps?: Record<string, unknown>;
    showRefresh?: boolean;
    showSkeleton?: boolean;
    skeletonRows?: number;
    searchSorter?: TableSearchSorterConfig;
    enableColumnSort?: boolean;
}

const props = withDefaults(defineProps<TableSearchWrapProps>(), {
    searchConf: () => [],
    isMore: true,
    exportConfig: null,
    defaultParams: () => ({}),
    immediate: true,
    rowKey: 'id',
    emptyText: '暂无数据',
    scroll: () => ({ x: 1000 }),
    tableProps: () => ({}),
    showRefresh: false,
    showSkeleton: true,
    skeletonRows: 8,
    enableColumnSort: true,
});

const { t } = useI18n();
const slots = useSlots();

const AUTO_ELLIPSIS_SLOT_PREFIX = '__auto_ellipsis__';

/**
 * 把单元格原始值统一转换为可展示文本。
 * - null/undefined/空字符串统一展示为 --
 * - 数组按逗号拼接
 * - 对象兜底转 JSON，避免直接显示 [object Object]
 */
const formatCellText = (value: unknown): string => {
    if (value === null || typeof value === 'undefined' || value === '') {
        return '--';
    }

    if (Array.isArray(value)) {
        const text = value
            .map((item) => formatCellText(item))
            .filter((item) => item !== '--')
            .join(', ');
        return text || '--';
    }

    if (typeof value === 'object') {
        try {
            return JSON.stringify(value);
        } catch {
            return '--';
        }
    }

    return String(value);
};

const isAutoEllipsisSlot = (slotName?: string): boolean =>
    Boolean(slotName?.startsWith(AUTO_ELLIPSIS_SLOT_PREFIX));

const hasExternalSlot = (slotName?: string): boolean =>
    Boolean(slotName && slots[slotName]);

/**
 * 根据列宽估算“可能发生省略”的最小文本长度阈值。
 * 说明：
 * - 字符宽度按约 10px 估算，作为轻量级启发式判断
 * - 最小阈值保底 8，避免过短文本误判
 */
const getPreviewThresholdByColumn = (column: ColumnType): number => {
    if (typeof column.width === 'number' && column.width > 0) {
        return Math.max(8, Math.floor(column.width / 10));
    }

    return 18;
};

/**
 * 省略文本点击预览：
 * - 包含换行的内容默认支持
 * - 其余按“列宽估算阈值”判断，尽量只命中实际会被省略的长文本
 */
const canPreviewCellText = (text: string, column: ColumnType): boolean => {
    if (text === '--') return false;
    if (/[\r\n]/.test(text)) return true;
    return text.length > getPreviewThresholdByColumn(column);
};

const getCellDisplayText = (
    record: Record<string, unknown>,
    column: ColumnType,
): string => {
    if (!column.dataIndex) {
        return '--';
    }

    return formatCellText(get(record, column.dataIndex));
};

const handleCopyPopoverText = (text: string): void => {
    if (!text || text === '--') return;
    onCopyCode(text);
};

/**
 * 为“非 slot 文本列”自动注入内部 slotName：
 * - 统一启用省略号
 * - 保留页面自定义 slot 的优先级，不覆盖业务自定义渲染
 */
const withAutoEllipsisColumns = (
    columns: ColumnType[],
    parentPath = '',
): ColumnType[] =>
    columns.map((column, index) => {
        const nextPath = `${parentPath}${index}_`;

        if (column.children?.length) {
            return {
                ...column,
                children: withAutoEllipsisColumns(column.children, nextPath),
            };
        }

        if (!column.dataIndex || column.slotName || column.autoEllipsis === false) {
            return column;
        }

        const identity = String(column.key ?? column.dataIndex ?? nextPath);
        const internalSlotName =
            `${AUTO_ELLIPSIS_SLOT_PREFIX}${identity.replace(/[^A-Za-z0-9_]/g, '_')}_${nextPath}`;

        return {
            ...column,
            slotName: internalSlotName,
            ellipsis: column.ellipsis ?? true,
        };
    });

/**
 * 搜索表单实例。
 * reset 时优先通过表单实例重置 UI，再回到第一页重新请求。
 */
const searchWrapRef = ref<TableSearchFormExpose | null>(null);

/**
 * 表格容器 DOM。
 * 用于按真实视口位置动态计算 scroll.y。
 */
const tableContainerRef = ref<HTMLElement | null>(null);

/**
 * 当前自动计算后的纵向滚动高度。
 * 当页面高度、顶部结构高度、数据量或分页区高度变化时都会重新计算。
 */
const autoScrollY = ref<number>(TABLE_MIN_SCROLL_Y);

/**
 * 监听表格容器尺寸变化的观察器。
 */
let tableResizeObserver: ResizeObserver | null = null;

/**
 * 当前实际生效的查询参数。
 * 这里作为“业务筛选条件缓存”，让翻页、刷新、分页切换都能沿用同一组搜索条件。
 */
const currentSearchParams = ref<SearchParams>({ ...props.defaultParams });

/**
 * 合并表格 locale 配置。
 * 优先尊重外部 tableProps.locale，其次兜底 emptyText 的 i18n 文案。
 */
const getTableLocale = (): Record<string, unknown> => {
    const locale =
        props.tableProps.locale && typeof props.tableProps.locale === 'object'
            ? (props.tableProps.locale as Record<string, unknown>)
            : {};

    return {
        ...locale,
        emptyText: locale.emptyText ?? t(props.emptyText),
    };
};

/**
 * 这里改为使用 vue-request 的 usePagination。
 *
 * 设计目标：
 * 1. 让分页状态交给库统一维护
 * 2. 仍然兼容你现有 pageNo / pageSize / totalSize 这套后端字段
 * 3. 外部页面依旧通过 search / reset / refresh 等命令式方法控制
 */
const {
    data: tableResult,
    loading,
    runAsync: runTableRequest,
    refreshAsync,
    current,
    pageSize,
    total,
    changeCurrent,
    changePageSize,
} = usePagination<TableFetchResult, [SearchParams & { pageNo: number; pageSize: number }]>(
    async (params) => {
        return props.apiFetch({
            ...props.defaultParams,
            ...params,
        });
    },
    {
        manual: true,
        defaultParams: [
            {
                ...props.defaultParams,
                pageNo: PagingDefaultConf.current,
                pageSize: PagingDefaultConf.pageSize,
            },
        ],
        pagination: {
            currentKey: 'pageNo',
            pageSizeKey: 'pageSize',
            totalKey: 'totalSize',
            totalPageKey: 'totalPages',
        },
    },
);

/**
 * 当前列表数据。
 * usePagination 返回的是完整响应对象，这里抽出 list 给表格渲染。
 */
const rawDataSource = computed<Record<string, unknown>[]>(() => tableResult.value?.list ?? []);

/**
 * 表格排序能力统一交给 useTableSorter 管理：
 * 1. 搜索字段排序
 * 2. 当前列点击排序
 * 3. 文本/数字/时间/枚举的统一比较规则
 */
const {
    normalizedColumns,
    onSorterChange,
    sortedDataSource,
    sortRecords,
} = useTableSorter({
    columns: computed(() => props.tableColumns),
    rawDataSource,
    searchConf: computed(() => props.searchConf),
    currentSearchParams,
    searchSorter: computed(() => props.searchSorter),
    enableColumnSort: props.enableColumnSort,
});

/**
 * 表格最终渲染数据。
 * 这里始终以排序后的数据源为准，让分页、刷新和筛选结果保持同一套展示逻辑。
 */
const dataSource = computed<Record<string, unknown>[]>(() => sortedDataSource.value);

/**
 * 表格列增强：
 * 1. 对普通文本列自动开启省略号与点击预览
 * 2. 不影响页面侧已经声明 slot 的列
 */
const renderableColumns = computed<ColumnType[]>(() =>
    withAutoEllipsisColumns(normalizedColumns.value),
);

/**
 * 需要透传具名插槽的列。
 * 只有定义了 slotName 的列，才会在 a-table 中动态挂接插槽。
 */
const slotColumns = computed(() => renderableColumns.value.filter((column) => column.slotName));

/**
 * 当前总条数。
 * 优先用 vue-request 已经折叠好的 total，保持与分页插件内部状态一致。
 */
const totalCount = computed(() => Number(total.value ?? 0));

/**
 * 是否展示首屏骨架屏。
 *
 * 展示条件：
 * 1. 组件开启骨架屏能力
 * 2. 当前处于 loading
 * 3. 当前还没有任何列表数据可渲染
 *
 * 这样可以保证：
 * - 首屏/首次搜索时展示骨架屏
 * - 已有表格数据时刷新，不会把真实内容闪成骨架
 */
const showTableSkeleton = computed(
    () => props.showSkeleton && loading.value && dataSource.value.length === 0,
);

/**
 * 当前页码和每页数量的展示值。
 * 优先使用服务端响应里的 pageNo / pageSize，避免后端校正页码时前端显示旧值。
 */
const currentPageNo = computed(() => Number(tableResult.value?.pageNo ?? current.value ?? 1));
const currentPageSize = computed(() =>
    Number(tableResult.value?.pageSize ?? pageSize.value ?? PagingDefaultConf.pageSize),
);

/**
 * 搜索时重置为第一页，并替换当前缓存条件。
 * 这里保留现有语义，页面侧无需感知内部已经切换到 usePagination。
 */
const searchTable = async (
    params: SearchParams = currentSearchParams.value,
): Promise<unknown[]> => {
    currentSearchParams.value = {
        ...props.defaultParams,
        ...params,
    };

    const result = await runTableRequest({
        ...currentSearchParams.value,
        pageNo: 1,
        pageSize: currentPageSize.value,
    });

    return sortRecords(result.list);
};

/**
 * 刷新时继续沿用当前筛选条件与当前分页状态。
 * 如果还没有发起过请求，则补一次默认分页参数请求。
 */
const refreshTable = async (): Promise<unknown[]> => {
    if (!tableResult.value) {
        return searchTable(currentSearchParams.value);
    }

    const result = await refreshAsync();
    return sortRecords(result.list);
};

/**
 * 重置时优先同步重置搜索表单 UI；
 * 如果没有搜索表单实例，则直接用默认条件重新请求第一页。
 */
const resetTable = (): void => {
    if (searchWrapRef.value) {
        searchWrapRef.value.reset();
        return;
    }

    currentSearchParams.value = { ...props.defaultParams };
    runTableRequest({
        ...currentSearchParams.value,
        pageNo: 1,
        pageSize: PagingDefaultConf.pageSize,
    }).then();
};

/**
 * 对外只暴露参数拷贝，避免外部直接改内部缓存状态。
 */
const getSearchParams = (): SearchParams => ({ ...currentSearchParams.value });

/**
 * 导出参数统一带上当前搜索条件和分页信息，
 * 这样列表导出默认和“当前筛选结果”保持一致。
 */
const exportParams = computed<Record<string, unknown>>(() => ({
    ...getSearchParams(),
    pageNo: currentPageNo.value,
    pageSize: currentPageSize.value,
}));

/**
 * 是否需要展示工具栏。
 */
const showToolbar = computed(
    () =>
        Boolean(props.exportConfig) ||
        props.showRefresh ||
        Boolean(slots.roleBtnWrap) ||
        Boolean(slots.totalWrap) ||
        Boolean(slots.actionsWrap),
);

/**
 * 基础滚动配置。
 * 优先使用外部 tableProps.scroll，其次才是组件 props.scroll。
 */
const baseScrollConfig = computed<TableScrollConfig>(() => {
    const scrollConfig = props.tableProps.scroll ?? props.scroll;
    return scrollConfig && typeof scrollConfig === 'object' ? { ...scrollConfig } : {};
});

/**
 * 只有当外部显式声明了 scroll.y，才启用自动高度计算。
 * 这里把传入的 y 当成“需要纵向滚动”的信号，同时把它视为最小高度基准。
 */
const shouldAutoScrollY = computed(() => typeof baseScrollConfig.value.y !== 'undefined');

/**
 * 获取自动滚动高度的最小值。
 * 规则：
 * 1. 永远不少于 600
 * 2. 如果页面显式传了更大的 y，则以更大的值为最低值
 */
const getMinScrollY = (): number => {
    const scrollY = baseScrollConfig.value.y;

    if (typeof scrollY === 'number' && Number.isFinite(scrollY)) {
        return Math.max(scrollY, TABLE_MIN_SCROLL_Y);
    }

    return TABLE_MIN_SCROLL_Y;
};

/**
 * 根据真实 DOM 位置自动计算可用表格高度。
 *
 * 计算方式：
 * 1. 取表格容器距离视口顶部的位置
 * 2. 用视口总高度减去当前位置
 * 3. 再减去分页区高度和底部预留 20px
 * 4. 最终结果保证不低于最小高度
 */
const syncAutoScrollY = (): void => {
    if (!shouldAutoScrollY.value || !tableContainerRef.value) return;

    const tableRect = tableContainerRef.value.getBoundingClientRect();
    const tableHeader = tableContainerRef.value.querySelector('.arco-table-header') as HTMLElement | null;
    const tablePagination = tableContainerRef.value.querySelector('.arco-pagination') as HTMLElement | null;

    const availableViewportHeight = window.innerHeight - tableRect.top - TABLE_BOTTOM_GAP;
    const occupiedHeight =
        (tableHeader?.offsetHeight ?? 46) + (tablePagination?.offsetHeight ?? 64);

    autoScrollY.value = Math.max(
        Math.floor(availableViewportHeight - occupiedHeight),
        getMinScrollY(),
    );
};

/**
 * 最终传给 a-table 的滚动配置。
 * 当启用自动纵向滚动时，用动态计算后的 y 覆盖外部传入的静态值。
 */
const mergedScrollConfig = computed<TableScrollConfig>(() => {
    if (!shouldAutoScrollY.value) {
        return baseScrollConfig.value;
    }

    return {
        ...baseScrollConfig.value,
        y: autoScrollY.value,
    };
});

/**
 * 骨架屏高度。
 * 如果当前已经算出了动态表格高度，就沿用同一高度；
 * 否则使用最小滚动高度作为兜底，避免骨架区域过矮。
 */
const skeletonMinHeight = computed(() => {
    if (shouldAutoScrollY.value) {
        return `${autoScrollY.value}px`;
    }

    return `${TABLE_MIN_SCROLL_Y}px`;
});

/**
 * 骨架屏行数。
 * 这里根据当前可用高度动态估算行数，并和外部传入的最小骨架行数取最大值，
 * 这样骨架既不会太少，也能尽量铺满当前表格区域。
 */
const skeletonRowCount = computed(() => {
    const estimatedRows = Math.ceil((Number.parseInt(skeletonMinHeight.value, 10) || TABLE_MIN_SCROLL_Y) / 68);
    return Math.max(props.skeletonRows, estimatedRows);
});

/**
 * 骨架屏列数。
 * 为了兼顾复杂表格和可读性：
 * 1. 至少展示 4 个占位块
 * 2. 最多展示 6 个占位块
 * 3. 优先参考当前列配置数量
 */
const skeletonColumnCount = computed(() =>
    Math.min(Math.max(normalizedColumns.value.length || 0, 4), 6),
);

/**
 * 骨架屏每一行单元格宽度。
 * 这里做轻微错位变化，让每一行看起来更像真实数据，而不是完全机械重复。
 */
const getSkeletonCellWidth = (rowIndex: number, columnIndex: number): string => {
    const widthMatrix = [
        ['90%', '62%', '80%', '68%', '86%', '54%'],
        ['72%', '58%', '88%', '60%', '76%', '50%'],
        ['84%', '64%', '74%', '70%', '92%', '56%'],
    ];

    return widthMatrix[rowIndex % widthMatrix.length][columnIndex] ?? '70%';
};

/**
 * Arco Table 分页配置。
 * 仍然保持和你当前页面 slot 里读取 `pagination.current / pageSize` 的方式兼容。
 */
const paginationConfig = computed(() => ({
    ...PagingDefaultConf,
    current: currentPageNo.value,
    pageSize: currentPageSize.value,
    total: totalCount.value,
}));

/**
 * 合并最终表格 props。
 */
const mergedTableProps = computed(() => ({
    ...props.tableProps,
    rowKey: props.rowKey,
    scroll: mergedScrollConfig.value,
    locale: getTableLocale(),
    pagination: props.tableProps.pagination ?? paginationConfig.value,
}));

/**
 * 表格 loading 状态。
 * 当骨架屏已经接管列表内容区时，这里不再给 a-table 开启内置 loading，
 * 避免表头区域再叠一个 spinner。
 */
const tableLoading = computed(() => loading.value && !showTableSkeleton.value);

/**
 * 切换页码时，交给 vue-request 的分页状态管理。
 * 这样 search params 会继续保留在第一个参数对象中。
 */
const onPageChange = (pageNo: number): void => {
    changeCurrent(pageNo);
};

/**
 * 切换每页条数时，保留当前 usePagination 行为。
 * 这里不额外重置第一页，尽量保持现有交互语义不变。
 */
const onPageSizeChange = (nextPageSize: number): void => {
    changePageSize(nextPageSize);
};

if (props.immediate) {
    runTableRequest({
        ...props.defaultParams,
        pageNo: PagingDefaultConf.current,
        pageSize: PagingDefaultConf.pageSize,
    }).then();
}

onMounted(() => {
    nextTick(() => {
        syncAutoScrollY();
    });

    if (tableContainerRef.value) {
        tableResizeObserver = new ResizeObserver(() => {
            syncAutoScrollY();
        });
        tableResizeObserver.observe(tableContainerRef.value);
    }

    window.addEventListener('resize', syncAutoScrollY);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', syncAutoScrollY);
    tableResizeObserver?.disconnect();
    tableResizeObserver = null;
});

/**
 * 这些状态变化都会影响表格实际可用高度：
 * - 搜索区展开/收起
 * - 工具栏显隐
 * - 数据量变化
 * - 分页变化
 * - loading 切换
 *
 * 所以统一在 nextTick 后重算一遍 scroll.y。
 */
watch(
    () => [
        props.searchConf.length,
        showToolbar.value,
        loading.value,
        totalCount.value,
        currentPageNo.value,
        currentPageSize.value,
        dataSource.value.length,
    ],
    () => {
        nextTick(() => {
            syncAutoScrollY();
        });
    },
);

/**
 * 对外暴露的命令式方法保持不变。
 * 这样页面层不需要因为内部切换到 usePagination 而重写调用逻辑。
 */
defineExpose<TableSearchWrapExpose>({
    refresh: refreshTable,
    search: searchTable,
    reset: resetTable,
    getSearchParams,
});
</script>
<template>
    <div class="table-container flex h-auto min-h-0 flex-col gap-[14px]">
        <!-- 搜索区域：如果页面传了 searchConf 或自定义 searchWrap，就显示 -->
        <div
            v-if="props.searchConf.length || slots.searchWrap"
            class="rounded-[10px] bg-transparent pb-[14px]"
        >
            <slot name="searchWrap">
                <SearchWrap
                    v-if="props.searchConf.length"
                    ref="searchWrapRef"
                    :search-conf="props.searchConf"
                    :is-more="props.isMore"
                    @searchCallback="searchTable"
                >
                    <template #footerActions>
                        <ExportButton
                            v-if="props.exportConfig"
                            :config="props.exportConfig"
                            :params="exportParams"
                        />
                        <slot name="roleBtnWrap" />
                    </template>
                </SearchWrap>
            </slot>
        </div>

        <!-- 工具栏：按钮区、统计区、操作区统一放在这里 -->
        <div v-if="showToolbar" class="flex flex-wrap items-center justify-between gap-3 pb-[10px]">
            <div class="flex flex-wrap items-center gap-3">
                <slot name="roleBtnWrap" />
                <ExportButton
                    v-if="props.exportConfig"
                    :config="props.exportConfig"
                    :params="exportParams"
                />
                <slot
                    name="totalWrap"
                    :total="totalCount"
                    :data-source="dataSource"
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

        <!-- 表格主体区域：scroll.y 会在这里按真实 DOM 高度自动计算 -->
        <div
            ref="tableContainerRef"
            class="overflow-hidden rounded-[10px] bg-[var(--app-surface-strong)] [&_.arco-table-container]:rounded-[4px] [&_.arco-table-th]:bg-[var(--app-table-header-bg)] [&_.arco-table-th]:font-semibold [&_.arco-table-th]:text-[var(--app-table-header-text)] [&_.arco-table-tr-empty_.arco-table-td]:p-0 [&_.arco-table-tr_.arco-table-td]:[border-bottom-color:var(--app-divider)] [&_.arco-table-tr:hover_.arco-table-td]:bg-[var(--app-table-row-hover)]"
        >
            <slot
                name="table"
                :data-source="dataSource"
                :loading="loading"
                :pagination="paginationConfig"
                :refresh="refreshTable"
                :reset="resetTable"
                :search-params="getSearchParams()"
            >
                <a-table
                    v-bind="mergedTableProps"
                    class="w-full"
                    :columns="renderableColumns"
                    :data="dataSource"
                    :loading="tableLoading"
                    @page-size-change="onPageSizeChange"
                    @page-change="onPageChange"
                    @sorter-change="onSorterChange"
                >
                    <!-- 空状态区域：首屏加载时显示内容骨架，否则显示正常 empty 文案 -->
                    <template #empty>
                        <div
                            v-if="showTableSkeleton"
                            class="flex w-full flex-col px-4 py-4"
                            :style="{ minHeight: skeletonMinHeight }"
                        >
                            <!-- 只模拟列表内容，不额外绘制表头骨架 -->
                            <div class="flex flex-1 flex-col divide-y divide-[var(--app-divider)]">
                                <div
                                    v-for="rowIndex in skeletonRowCount"
                                    :key="`skeleton-row-${rowIndex}`"
                                    class="grid items-center gap-4 py-4"
                                    :style="{ gridTemplateColumns: `repeat(${skeletonColumnCount}, minmax(0, 1fr))` }"
                                >
                                    <div
                                        v-for="columnIndex in skeletonColumnCount"
                                        :key="`skeleton-cell-${rowIndex}-${columnIndex}`"
                                        class="h-3 animate-pulse rounded-full bg-[var(--app-skeleton-bg)]"
                                        :style="{ width: getSkeletonCellWidth(rowIndex, columnIndex - 1) }"
                                    />
                                </div>
                            </div>
                        </div>
                        <div
                            v-else
                            class="py-8 text-center text-sm text-[var(--app-text-muted)]"
                        >
                            {{ t(props.emptyText) }}
                        </div>
                    </template>

                    <template
                        v-for="column in slotColumns"
                        :key="column.key"
                        #[column.slotName]="slotProps"
                    >
                        <slot
                            v-if="hasExternalSlot(column.slotName)"
                            :name="column.slotName"
                            v-bind="{
                                ...slotProps,
                                pagination: paginationConfig,
                                loading,
                                dataSource,
                                searchParams: getSearchParams(),
                            }"
                        />
                        <template v-else-if="isAutoEllipsisSlot(column.slotName)">
                            <a-popover
                                v-if="canPreviewCellText(getCellDisplayText(slotProps.record, column), column)"
                                trigger="click"
                                position="tl"
                            >
                                <span
                                    class="block max-w-full cursor-pointer truncate"
                                    :style="{ color: 'color-mix(in srgb, var(--color-primary-6) 72%, white 28%)' }"
                                >
                                    {{ getCellDisplayText(slotProps.record, column) }}
                                </span>
                                <template #content>
                                    <div class="max-w-[560px] space-y-2">
                                        <a-typography-paragraph
                                            class="m-0 whitespace-pre-wrap break-all text-[var(--app-text)]"
                                        >
                                            {{ getCellDisplayText(slotProps.record, column) }}
                                        </a-typography-paragraph>
                                        <div class="flex justify-end">
                                            <a-button
                                                type="text"
                                                size="mini"
                                                @click.stop="handleCopyPopoverText(getCellDisplayText(slotProps.record, column))"
                                            >
                                                {{ t('复制') }}
                                            </a-button>
                                        </div>
                                    </div>
                                </template>
                            </a-popover>
                            <span
                                v-else
                                class="block max-w-full truncate"
                                :style="{
                                    color: getCellDisplayText(slotProps.record, column) === '--'
                                        ? 'var(--app-text-muted)'
                                        : 'var(--app-text)',
                                }"
                            >
                                {{ getCellDisplayText(slotProps.record, column) }}
                            </span>
                        </template>
                    </template>
                </a-table>
            </slot>
        </div>
    </div>
</template>
