<script setup lang="ts">
type StatusPreset =
    | 'account'
    | 'success'
    | 'boolean'
    | 'reviewState'
    | 'reviewResult'
    | 'authState'
    | 'kolState'

interface StatusTextProps {
    value: string | number | boolean | null | undefined
    preset: StatusPreset
    fallback?: string
}

type StatusMeta = {
    label: string
    className: string
}

const props = withDefaults(defineProps<StatusTextProps>(), {
    fallback: '--',
})

const { t } = useI18n()

/**
 * 账号状态映射：
 * 1 -> 启用
 * 2 -> 禁用
 * 3 -> 冻结
 */
const ACCOUNT_STATUS_MAP: Record<string, StatusMeta> = {
    '1': { label: '启用', className: 'text-emerald-500' },
    '2': { label: '禁用', className: 'text-rose-500' },
    '3': { label: '冻结', className: 'text-amber-500' },
}

/**
 * 通用成功/失败映射。
 */
const SUCCESS_STATUS_MAP: Record<string, StatusMeta> = {
    true: { label: '成功', className: 'text-emerald-500' },
    false: { label: '失败', className: 'text-rose-500' },
    '1': { label: '成功', className: 'text-emerald-500' },
    '0': { label: '失败', className: 'text-rose-500' },
}

/**
 * 通用是/否映射。
 * 常用于布尔值开关、错误标记等字段。
 */
const BOOLEAN_STATUS_MAP: Record<string, StatusMeta> = {
    true: { label: '是', className: 'text-rose-500' },
    false: { label: '否', className: 'text-slate-400' },
    '1': { label: '是', className: 'text-rose-500' },
    '0': { label: '否', className: 'text-slate-400' },
}

/**
 * 审核状态映射。
 */
const REVIEW_STATE_MAP: Record<string, StatusMeta> = {
    '1': { label: '已审核', className: 'text-emerald-500' },
    '2': { label: '待审核', className: 'text-amber-500' },
}

/**
 * 审核结果映射。
 */
const REVIEW_RESULT_MAP: Record<string, StatusMeta> = {
    '1': { label: '通过', className: 'text-emerald-500' },
    '2': { label: '拒绝', className: 'text-rose-500' },
}

/**
 * 认证状态映射（用户/KOL 通用）：
 * - 兼容数字态 0/1/2/3
 * - 兼容风控字符串 WAIT/GREEN/RED
 * - 兼容后端已翻译中文文案
 */
const AUTH_STATE_MAP: Record<string, StatusMeta> = {
    '0': { label: '未认证', className: 'text-amber-500' },
    '1': { label: '认证中', className: 'text-amber-500' },
    '2': { label: '成功', className: 'text-emerald-500' },
    '3': { label: '失败', className: 'text-rose-500' },
    WAIT: { label: '待处理', className: 'text-amber-500' },
    GREEN: { label: '成功', className: 'text-emerald-500' },
    RED: { label: '失败', className: 'text-rose-500' },
    未认证: { label: '未认证', className: 'text-amber-500' },
    认证中: { label: '认证中', className: 'text-amber-500' },
    待处理: { label: '待处理', className: 'text-amber-500' },
    待定: { label: '待定', className: 'text-amber-500' },
    成功: { label: '成功', className: 'text-emerald-500' },
    失败: { label: '失败', className: 'text-rose-500' },
    完成: { label: '完成', className: 'text-emerald-500' },
    初始化: { label: '初始化', className: 'text-slate-400' },
}

/**
 * KOL 状态映射。
 */
const KOL_STATE_MAP: Record<string, StatusMeta> = {
    '1': { label: '正常', className: 'text-emerald-500' },
    '2': { label: '已禁用', className: 'text-rose-500' },
    '3': { label: '已取消身份', className: 'text-slate-400' },
    正常: { label: '正常', className: 'text-emerald-500' },
    已禁用: { label: '已禁用', className: 'text-rose-500' },
    已取消身份: { label: '已取消身份', className: 'text-slate-400' },
    禁用: { label: '禁用', className: 'text-rose-500' },
    取消身份: { label: '取消身份', className: 'text-slate-400' },
}

/**
 * 不同 preset 对应的映射表。
 * 页面侧只需要传 preset + value，不需要自己重复写颜色和文案判断。
 */
const PRESET_MAP: Record<StatusPreset, Record<string, StatusMeta>> = {
    account: ACCOUNT_STATUS_MAP,
    success: SUCCESS_STATUS_MAP,
    boolean: BOOLEAN_STATUS_MAP,
    reviewState: REVIEW_STATE_MAP,
    reviewResult: REVIEW_RESULT_MAP,
    authState: AUTH_STATE_MAP,
    kolState: KOL_STATE_MAP,
}

const normalizedValue = computed(() => {
    if (typeof props.value === 'boolean') return String(props.value)
    if (props.value === null || typeof props.value === 'undefined' || props.value === '') return ''
    return String(props.value)
})

/**
 * 最终状态展示信息。
 * 如果映射不到，就显示 fallback，避免页面侧再写一层兜底逻辑。
 */
const statusMeta = computed<StatusMeta | null>(() => {
    const key = normalizedValue.value
    if (!key) return null
    return PRESET_MAP[props.preset][key] ?? null
})
</script>

<template>
    <!-- 状态文本：只负责把常见状态值映射成统一的颜色和文案 -->
    <span
        :class="statusMeta?.className"
        :style="statusMeta ? undefined : { color: 'var(--app-text-muted)' }"
    >
        {{ statusMeta ? t(statusMeta.label) : props.fallback }}
    </span>
</template>
