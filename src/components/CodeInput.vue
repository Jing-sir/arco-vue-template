<script setup lang="ts">
import type { ComponentPublicInstance, VNodeRef } from 'vue';
import { ref, watch, onMounted } from 'vue';
import { INTER_NUMBER } from '@/utils/constant';

const { t } = useI18n();

const props = defineProps({
    modelValue: {
        type: Array as () => string[],
        default: () => [],
    },
});

const emit = defineEmits(['update:modelValue']);

const isError = ref(false);
const inputs = ref<Array<{ value: string }>>([
    { value: '' },
    { value: '' },
    { value: '' },
    { value: '' },
    { value: '' },
    { value: '' },
]);

const itemRefs = ref<Array<HTMLInputElement | null>>([]);
const curIndex = ref<number>(0);

const handleKeyDown = (event: KeyboardEvent): void => {
    const isVal = inputs.value[curIndex.value].value;
    if (event.keyCode === 8 && !isVal) {
        itemRefs.value[curIndex.value - 1]?.focus();
    }
};

const itemRef = (index: number): VNodeRef =>
    (el: Element | ComponentPublicInstance | null): void => {
        itemRefs.value[index] = el instanceof HTMLInputElement ? el : null;
    };

const onInput = (index: number, event: Event): void => {
    const target = event.target;
    const value = target instanceof HTMLInputElement ? target.value : '';

    isError.value = !INTER_NUMBER.test(value) && value !== '';
    inputs.value[index].value = value;
    if (isError.value) return;
    focusNextInput(value !== '' ? index : curIndex.value - 1);
    emit('update:modelValue', inputs.value.map((input) => input.value));
};

const focusNextInput = (index: number): void => {
    itemRefs.value[index + 1]?.focus();
};

const handleFocus = (index: number): void => {
    curIndex.value = index;
};

watch(
    () => props.modelValue,
    (o: string[]) => {
        if (o.length && o.length <= 6) {
            inputs.value.forEach((input, index) => {
                input.value = o[index] || '';
            });
        } else {
            inputs.value.forEach((input) => {
                input.value = '';
            });
            itemRefs.value[0]?.focus();
        }
    },
    { immediate: true }
);

onMounted(() => {
    itemRefs.value[0]?.focus();
});
</script>

<template>
    <div class="flex flex-col input-wrap">
        <div class="flex justify-around items-center">
            <input
                v-for="(input, index) in inputs"
                :key="index"
                :ref="itemRef(index)"
                :value="input.value"
                class="input-item"
                maxlength="1"
                @keydown="handleKeyDown"
                @input="onInput(index, $event)"
                @focus="handleFocus(index)"
            />
        </div>
        <div class="error-text">
            <span v-if="isError">{{ t('非法输入') }}</span>
        </div>
    </div>
</template>

<style scoped lang="scss">
.input-wrap {
    width: 100%;
    padding: 14px 0;
}

.input-item {
    outline: none;
    width: 46px;
    height: 50px;
    border: 1px solid #CCCCCC;
    border-radius: 4px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;

    &:focus {
        border-color: var(--primary-color);
    }
}

.error-text {
    padding-top: 6px;
    font-size: 12px;
    height: 20px;
    line-height: 20px;
    color: red;
}
</style>
