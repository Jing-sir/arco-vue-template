import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { TableScrollConfig } from '@/interface/TableType'

/**
 * 表格区域最小纵向滚动高度。
 * 即使屏幕再高，也保证列表区域至少维持一个稳定、可阅读的高度。
 */
const TABLE_MIN_SCROLL_Y = 600

/**
 * 表格底部预留间距。
 * 用于避免分页贴住视口底部，保持视觉留白和可点击空间。
 */
const TABLE_BOTTOM_GAP = 50

interface UseTableAutoScrollOptions {
    tableContainerRef: Ref<HTMLElement | null>
    baseScrollConfig: ComputedRef<TableScrollConfig>
    skeletonRows: ComputedRef<number>
    columnCount: ComputedRef<number>
    watchDeps: ComputedRef<unknown[]>
}

/**
 * 自动滚动高度与骨架布局计算。
 * 目的：
 * 1. 让 scroll.y 随真实视口高度变化
 * 2. 在 loading 且无数据时，骨架高度与表格高度保持一致
 */
export default function useTableAutoScroll({
    tableContainerRef,
    baseScrollConfig,
    skeletonRows,
    columnCount,
    watchDeps,
}: UseTableAutoScrollOptions) {
    /**
     * 当前自动计算后的纵向滚动高度。
     * 当页面高度、表头/分页高度、数据量变化时都会重算。
     */
    const autoScrollY = ref<number>(TABLE_MIN_SCROLL_Y)

    /**
     * 只有当外部显式声明了 scroll.y，才启用自动高度计算。
     * 这里把传入 y 视为“需要纵向滚动”的信号，并作为最小高度基准。
     */
    const shouldAutoScrollY = computed(() => typeof baseScrollConfig.value.y !== 'undefined')

    /**
     * 读取自动滚动的最低高度：
     * - 不低于组件默认 600
     * - 如果外部传入更大的 y，则以外部值为准
     */
    const getMinScrollY = (): number => {
        const scrollY = baseScrollConfig.value.y

        if (typeof scrollY === 'number' && Number.isFinite(scrollY)) {
            return Math.max(scrollY, TABLE_MIN_SCROLL_Y)
        }

        return TABLE_MIN_SCROLL_Y
    }

    /**
     * 根据真实 DOM 位置动态计算可用表格高度。
     * 计算逻辑：
     * 1. 视口高度 - 表格容器 top - 底部留白
     * 2. 再减去表头高度和分页高度
     * 3. 最终值与最小高度取最大值
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
     * 最终传给 a-table 的 scroll 配置：
     * 启用自动高度时，用动态 y 覆盖静态 y。
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
     * 骨架高度与行列数统一由当前滚动高度推导，
     * 避免 loading 态和真实表格高度跳变。
     */
    const skeletonMinHeight = computed(() => {
        if (shouldAutoScrollY.value) {
            return `${autoScrollY.value}px`
        }

        return `${TABLE_MIN_SCROLL_Y}px`
    })

    const skeletonRowCount = computed(() => {
        const estimatedRows = Math.ceil(
            (Number.parseInt(skeletonMinHeight.value, 10) || TABLE_MIN_SCROLL_Y) / 68,
        )
        return Math.max(skeletonRows.value, estimatedRows)
    })

    const skeletonColumnCount = computed(() => Math.min(Math.max(columnCount.value, 4), 6))

    /**
     * 每行骨架宽度做轻微错位，减少“机械重复感”。
     */
    const getSkeletonCellWidth = (rowIndex: number, columnIndex: number): string => {
        const widthMatrix = [
            ['90%', '62%', '80%', '68%', '86%', '54%'],
            ['72%', '58%', '88%', '60%', '76%', '50%'],
            ['84%', '64%', '74%', '70%', '92%', '56%'],
        ]

        return widthMatrix[rowIndex % widthMatrix.length][columnIndex] ?? '70%'
    }

    let tableResizeObserver: ResizeObserver | null = null

    onMounted(() => {
        nextTick(() => {
            syncAutoScrollY()
        })

        if (typeof ResizeObserver !== 'undefined' && tableContainerRef.value) {
            tableResizeObserver = new ResizeObserver(() => {
                syncAutoScrollY()
            })
            tableResizeObserver.observe(tableContainerRef.value)
        }

        window.addEventListener('resize', syncAutoScrollY)
    })

    onBeforeUnmount(() => {
        window.removeEventListener('resize', syncAutoScrollY)
        tableResizeObserver?.disconnect()
        tableResizeObserver = null
    })

    /**
     * 搜索区开合、工具栏显隐、分页变化、数据量变化都会影响可用高度，
     * 所以统一在 nextTick 后重算一次 scroll.y。
     */
    watch(watchDeps, () => {
        nextTick(() => {
            syncAutoScrollY()
        })
    })

    /**
     * 当外部 scroll.y 基线发生变化时，立即同步一次高度。
     */
    watch(
        () => baseScrollConfig.value.y,
        () => {
            nextTick(() => {
                syncAutoScrollY()
            })
        },
    )

    return {
        mergedScrollConfig,
        skeletonMinHeight,
        skeletonRowCount,
        skeletonColumnCount,
        getSkeletonCellWidth,
    }
}
