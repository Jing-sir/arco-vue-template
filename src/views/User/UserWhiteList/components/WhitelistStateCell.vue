<script setup lang="ts">
import { whitelistStateEnum, whitelistStateEnumMap } from '@/enums/whitelistEnum'

interface Props {
    status: string | number
}

const props = defineProps<Props>()
const { t } = useI18n()

/**
 * 白名单状态展示：状态为 Enable 时强调绿色，Disable 时强调红色。
 */
const stateMeta = computed(() => whitelistStateEnumMap.get(Number(props.status) as any))

const stateClass = computed(() => {
    if (Number(props.status) === whitelistStateEnum.Enable) return 'text-green-500'
    return 'text-red-500'
})
</script>

<template>
    <span :class="stateClass">{{ t('已') }}{{ stateMeta?.label ? t(stateMeta.label) : '--' }}</span>
</template>
