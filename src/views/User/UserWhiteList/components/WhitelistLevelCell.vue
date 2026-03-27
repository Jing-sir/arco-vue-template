<script setup lang="ts">
import { commonLevelEnumMap } from '@/enums/whitelistEnum'

interface Props {
    status: string | number
}

const props = defineProps<Props>()
const { t } = useI18n()

/**
 * 白名单认证等级展示：统一从枚举映射拿文案，避免页面散落 hard-code。
 */
const levelMeta = computed(() => commonLevelEnumMap.get(Number(props.status) as any))

const levelClass = computed(() => {
    if (Number(props.status) === 2) return 'text-green-500'
    if (Number(props.status) === 1) return 'text-orange-500'
    return 'text-gray-500'
})
</script>

<template>
    <span :class="levelClass">{{ levelMeta?.label ? t(levelMeta.label) : '--' }}</span>
</template>
