<script setup lang="ts">
import { subSumStatusMap } from '@/api/userApi/userEnum'

interface Props {
    status: string | number
}

const props = defineProps<Props>()
const { t } = useI18n()

/**
 * 列表状态值在不同接口里可能是 number 或数字字符串。
 * 这里先做一次标准化，避免 "2" 无法命中 map(2) 导致文案丢失。
 */
const normalizedStatus = computed(() => {
    if (typeof props.status === 'string') {
        const trimmed = props.status.trim()
        if (trimmed && !Number.isNaN(Number(trimmed))) {
            return Number(trimmed)
        }
        return trimmed
    }

    return props.status
})

const statusMeta = computed(() => subSumStatusMap.get(normalizedStatus.value as any))

/**
 * 文案优先使用枚举映射；如果后端已直接返回格式化文案，则直接展示。
 */
const statusText = computed(() => {
    const rawText = typeof normalizedStatus.value === 'string' ? normalizedStatus.value.trim() : ''
    const upperText = rawText.toUpperCase()

    if (upperText === 'NONE' || upperText === 'UNVERIFIED') {
        return t('未认证')
    }

    if (statusMeta.value?.label) {
        return t(statusMeta.value.label)
    }

    if (typeof normalizedStatus.value === 'string') {
        return rawText ? t(rawText) : '--'
    }

    if (typeof normalizedStatus.value === 'number') {
        return String(normalizedStatus.value)
    }

    return '--'
})

const statusClass = computed(() => {
    const rawText = typeof normalizedStatus.value === 'string' ? normalizedStatus.value.trim() : ''
    const upperText = rawText.toUpperCase()

    if (
        normalizedStatus.value === 2 ||
        upperText === '2' ||
        upperText === 'GREEN' ||
        upperText === 'SUCCESS' ||
        upperText === 'DONE' ||
        rawText === '成功' ||
        rawText === '通过' ||
        rawText === '完成'
    ) {
        return 'text-green-500'
    }

    if (
        normalizedStatus.value === 1 ||
        upperText === '1' ||
        upperText === 'WAIT' ||
        upperText === 'PENDING' ||
        upperText === 'NONE' ||
        upperText === 'UNVERIFIED' ||
        rawText === '认证中' ||
        rawText === '待处理' ||
        rawText === '未认证'
    ) {
        return 'text-orange-500'
    }

    if (
        normalizedStatus.value === 3 ||
        upperText === '3' ||
        upperText === 'RED' ||
        upperText === 'FAILED' ||
        upperText === 'FAIL' ||
        rawText === '失败' ||
        rawText === '拒绝'
    ) {
        return 'text-red-500'
    }

    return 'text-gray-500'
})
</script>

<template>
    <span :class="statusClass">{{ statusText }}</span>
</template>
