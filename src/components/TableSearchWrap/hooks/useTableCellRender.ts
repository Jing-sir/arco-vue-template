import { get } from 'lodash-es'
import { computed } from 'vue'
import type { ComputedRef, Slots } from 'vue'
import type { ColumnType } from '@/interface/TableType'
import { onCopyCode } from '@/utils/common'

const AUTO_ELLIPSIS_SLOT_PREFIX = '__auto_ellipsis__'
const CELL_PRESET_SLOT_PREFIX = '__cell_preset__'

interface UseTableCellRenderOptions {
    columns: ComputedRef<ColumnType[]>
    slots: Slots
}

/**
 * 把普通列渲染增强能力收敛到一个 composable：
 * 1. 自动省略 + 点击预览
 * 2. cellPreset 内置 slot 注入
 * 3. 与页面具名 slot 的优先级协调
 */
export default function useTableCellRender({ columns, slots }: UseTableCellRenderOptions) {
    /**
     * 把单元格原始值统一转换为可展示文本。
     * - null/undefined/空字符串统一展示为 --
     * - 数组按逗号拼接
     * - 对象兜底转 JSON，避免直接显示 [object Object]
     */
    const formatCellText = (value: unknown): string => {
        if (value === null || typeof value === 'undefined' || value === '') {
            return '--'
        }

        if (Array.isArray(value)) {
            const text = value
                .map((item) => formatCellText(item))
                .filter((item) => item !== '--')
                .join(', ')
            return text || '--'
        }

        if (typeof value === 'object') {
            try {
                return JSON.stringify(value)
            } catch {
                return '--'
            }
        }

        return String(value)
    }

    const isAutoEllipsisSlot = (slotName?: string): boolean =>
        Boolean(slotName?.startsWith(AUTO_ELLIPSIS_SLOT_PREFIX))

    const isCellPresetSlot = (slotName?: string): boolean =>
        Boolean(slotName?.startsWith(CELL_PRESET_SLOT_PREFIX))

    const hasExternalSlot = (slotName?: string): boolean => Boolean(slotName && slots[slotName])

    /**
     * 时间类字段不展示"复制"按钮，也不触发省略弹层，
     * 避免把日期文本当成长文案处理，保持列表阅读节奏一致。
     */
    const isTimeLikeColumn = (column: ColumnType): boolean => {
        const sorter = column.sorter
        if (sorter && typeof sorter === 'object' && sorter.type === 'date') {
            return true
        }

        const dataIndex = String(column.dataIndex ?? '')
        if (/(time|date|timestamp)/i.test(dataIndex)) {
            return true
        }

        const title = String(column.title ?? '')
        return /(时间|日期|time|date)/i.test(title)
    }

    /**
     * 判断单元格是否应渲染为"可点击弹出全文 + 复制"的交互态。
     *
     * 旧逻辑用列宽/10 估算字符阈值，但该启发式无法覆盖中英文混排、
     * 字体宽度差异等情况，导致视觉上已省略的文本却无法点击查看全文。
     *
     * 新逻辑：只要满足以下全部条件，就启用弹层交互：
     *   1. 文本非空（不是 --）
     *   2. 非时间/日期类列（时间列只做普通文本展示）
     *
     * 对于确实没被截断的短文本，点击弹层仍能正常展示完整内容和复制按钮，
     * 交互一致且不会误导用户。主色高亮样式作为"可交互"的视觉提示，
     * 比依赖字数估算更可靠。
     */
    const canPreviewCellText = (text: string, column: ColumnType): boolean => {
        if (text === '--') return false
        if (isTimeLikeColumn(column)) return false
        return true
    }

    const getCellDisplayText = (record: Record<string, unknown>, column: ColumnType): string => {
        if (!column.dataIndex) {
            return '--'
        }

        return formatCellText(get(record, column.dataIndex))
    }

    const handleCopyPopoverText = (text: string): void => {
        if (!text || text === '--') return
        onCopyCode(text)
    }

    /**
     * 为声明了 cellPreset 且未声明 slotName 的列注入内部 slotName：
     * - 统一由 TableSearchWrap 内部渲染 LabelTagList / StatusText / actionButtons
     * - 页面仍可通过显式 slotName 覆盖默认渲染
     * - 同时清除 ellipsis，防止 Arco 对表头文案做截断省略
     */
    const withCellPresetColumns = (columnList: ColumnType[], parentPath = ''): ColumnType[] =>
        columnList.map((column, index) => {
            const nextPath = `${parentPath}${index}_`

            if (column.children?.length) {
                return {
                    ...column,
                    children: withCellPresetColumns(column.children, nextPath),
                }
            }

            if (!column.cellPreset || column.slotName) {
                return column
            }

            const identity = String(column.key ?? column.dataIndex ?? nextPath)
            const internalSlotName = `${CELL_PRESET_SLOT_PREFIX}${identity.replace(/[^A-Za-z0-9_]/g, '_')}_${nextPath}`

            return {
                ...column,
                slotName: internalSlotName,
                // cellPreset 列的渲染由内部 slot 完全接管，
                // 清除 ellipsis 防止 Arco 同时截断表头。
                ellipsis: false,
            }
        })

    /**
     * 为"非 slot 文本列"自动注入内部 slotName：
     * - 单元格省略截断由我们的 slot 接管（truncate + 点击弹出全文）
     * - 传给 Arco 的 ellipsis 设为 false，防止 Arco 同时对表头做截断省略
     * - 保留页面自定义 slot 的优先级，不覆盖业务自定义渲染
     */
    const withAutoEllipsisColumns = (columnList: ColumnType[], parentPath = ''): ColumnType[] =>
        columnList.map((column, index) => {
            const nextPath = `${parentPath}${index}_`

            if (column.children?.length) {
                return {
                    ...column,
                    children: withAutoEllipsisColumns(column.children, nextPath),
                }
            }

            if (
                !column.dataIndex ||
                column.slotName ||
                column.cellPreset ||
                column.autoEllipsis === false
            ) {
                return column
            }

            const identity = String(column.key ?? column.dataIndex ?? nextPath)
            const internalSlotName = `${AUTO_ELLIPSIS_SLOT_PREFIX}${identity.replace(/[^A-Za-z0-9_]/g, '_')}_${nextPath}`

            return {
                ...column,
                slotName: internalSlotName,
                // 单元格截断由 slot 内部的 truncate class 控制，
                // ellipsis: false 防止 Arco 对表头文案也做省略截断。
                ellipsis: false,
            }
        })

    /**
     * 列增强顺序固定为：
     * 1. 先注入 cellPreset 内部 slot
     * 2. 再给其余文本列注入自动省略 slot
     *
     * 这样可避免两套内部 slot 互相覆盖。
     */
    const renderableColumns = computed<ColumnType[]>(() =>
        withAutoEllipsisColumns(withCellPresetColumns(columns.value)),
    )

    /**
     * 只透传声明了 slotName 的列给 <a-table> 动态插槽，
     * 让模板层只关注“需要特殊渲染”的列，减少无效 slot 计算。
     */
    const slotColumns = computed(() => renderableColumns.value.filter((column) => column.slotName))

    return {
        renderableColumns,
        slotColumns,
        hasExternalSlot,
        isAutoEllipsisSlot,
        isCellPresetSlot,
        isTimeLikeColumn,
        canPreviewCellText,
        getCellDisplayText,
        handleCopyPopoverText,
    }
}
