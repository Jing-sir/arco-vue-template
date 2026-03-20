<script setup lang="ts">
import type { ComponentPublicInstance, VNodeRef } from 'vue'
import { computed, nextTick, onMounted, ref, watch } from 'vue'

const { t } = useI18n()

const props = withDefaults(
    defineProps<{
        modelValue?: string
        length?: number
        disabled?: boolean
    }>(),
    {
        modelValue: '',
        length: 6,
        disabled: false,
    },
)

const emit = defineEmits<{
    'update:modelValue': [value: string]
    complete: [value: string]
}>()

const isError = ref(false)
const inputValues = ref<string[]>(createEmptyValues(props.length))
const inputRefs = ref<Array<HTMLInputElement | null>>([])

const inputClass = computed(() => [
    'h-[50px] w-[46px] rounded border text-center text-xl font-bold outline-none transition-colors',
    'disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400',
    isError.value
        ? 'border-red-500 focus:border-red-500'
        : 'border-[#CCCCCC] focus:border-[var(--color-primary-6)]',
])

function createEmptyValues(length: number): string[] {
    return Array.from({ length }, () => '')
}

function normalizeCode(value: string): string {
    return value.replace(/\D/g, '').slice(0, props.length)
}

const itemRef = (index: number): VNodeRef =>
    (el: Element | ComponentPublicInstance | null): void => {
        inputRefs.value[index] = el instanceof HTMLInputElement ? el : null
    }

const focusInput = (index: number): void => {
    if (props.disabled) return
    const safeIndex = Math.min(Math.max(index, 0), props.length - 1)
    nextTick(() => inputRefs.value[safeIndex]?.focus())
}

const emitValue = (): string => {
    const value = inputValues.value.join('')
    emit('update:modelValue', value)

    if (value.length === props.length) {
        emit('complete', value)
    }

    return value
}

const syncInputValues = (value: string): void => {
    const normalizedValue = normalizeCode(String(value ?? ''))
    inputValues.value = createEmptyValues(props.length).map(
        (_, index) => normalizedValue[index] ?? '',
    )
}

const writeValue = (value: string, startIndex: number): void => {
    const normalizedValue = normalizeCode(value)
    isError.value = value.trim() !== '' && normalizedValue === ''

    if (!normalizedValue) return

    // 将整段验证码拆分到多个输入框，兼容系统粘贴和浏览器自动填充。
    normalizedValue.split('').forEach((char, offset) => {
        const targetIndex = startIndex + offset
        if (targetIndex >= props.length) return
        inputValues.value[targetIndex] = char
    })

    const code = emitValue()
    const nextIndex = startIndex + normalizedValue.length

    if (code.length === props.length) {
        focusInput(props.length - 1)
        return
    }

    focusInput(nextIndex)
}

const handleKeyDown = (index: number, event: KeyboardEvent): void => {
    if (props.disabled) return

    const isPasteShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v'
    if (isPasteShortcut) return

    if (event.key === 'Backspace' && !inputValues.value[index]) {
        event.preventDefault()
        const previousIndex = Math.max(index - 1, 0)
        inputValues.value[previousIndex] = ''
        emitValue()
        focusInput(previousIndex)
        return
    }

    if (event.key === 'ArrowLeft') {
        event.preventDefault()
        focusInput(index - 1)
        return
    }

    if (event.key === 'ArrowRight') {
        event.preventDefault()
        focusInput(index + 1)
    }
}

const handleInput = (index: number, event: Event): void => {
    const target = event.target
    const value = target instanceof HTMLInputElement ? target.value : ''

    if (!value) {
        isError.value = false
        inputValues.value[index] = ''
        emitValue()
        focusInput(index - 1)
        return
    }

    writeValue(value, index)
}

const handlePaste = (index: number, event: ClipboardEvent): void => {
    if (props.disabled) return
    event.preventDefault()
    writeValue(event.clipboardData?.getData('text') ?? '', index)
}

const handleFocus = (index: number): void => {
    inputRefs.value[index]?.select()
}

const focus = (): void => {
    const firstEmptyIndex = inputValues.value.findIndex((value) => !value)
    focusInput(firstEmptyIndex === -1 ? props.length - 1 : firstEmptyIndex)
}

watch(
    () => props.modelValue,
    (value) => {
        syncInputValues(String(value ?? ''))
    },
    { immediate: true },
)

onMounted(() => {
    focus()
})

defineExpose({ focus })
</script>

<template>
    <div class="flex w-full flex-col py-3.5">
        <div class="flex items-center justify-between gap-2">
            <input
                v-for="(_, index) in inputValues"
                :key="index"
                :ref="itemRef(index)"
                :value="inputValues[index]"
                :class="inputClass"
                maxlength="1"
                inputmode="numeric"
                autocomplete="one-time-code"
                :disabled="props.disabled"
                @keydown="handleKeyDown(index, $event)"
                @input="handleInput(index, $event)"
                @focus="handleFocus(index)"
                @paste="handlePaste(index, $event)"
            />
        </div>
        <div class="h-5 pt-1.5 text-xs leading-5 text-red-500">
            <span v-if="isError">{{ t('非法输入') }}</span>
        </div>
    </div>
</template>
