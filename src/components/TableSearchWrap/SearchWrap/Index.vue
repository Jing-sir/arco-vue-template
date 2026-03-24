<script setup lang="ts">
import { IconCaretDown, IconCaretUp, IconSearch } from '@arco-design/web-vue/es/icon';
import dayjs from 'dayjs';
import { debounce, map, reduce, toPairs } from 'lodash-es';
import { timeStampToDate } from '@/filters/dateFormat';
import type {
    DateRangeSearchOption,
    DateSingleSearchOption,
    InputSearchOption,
    SearchFieldValue,
    SearchOption,
    SearchParams,
    SelectSearchOption,
    TableSearchFormExpose,
} from '@/interface/TableType';
import type { PropType } from 'vue';
import { unref, watch } from 'vue';

const DEBOUNCE_DELAY = 600;
const SEARCH_STATE_KEY = 'searchVal';

const props = defineProps({
    searchConf: {
        type: Array as PropType<SearchOption[]>,
        required: true,
        default: () => [],
    },
    isMore: {
        type: Boolean,
        default: true,
    },
});

const { t } = useI18n();
const emits = defineEmits<{
    searchCallback: [params: SearchParams];
}>();

const formRef = ref();
const isSearch = ref(sessionStorage.getItem(SEARCH_STATE_KEY) === 'true');
const isDefaVal = ref(sessionStorage.getItem(SEARCH_STATE_KEY) === 'true');

// 在本地克隆一份配置，避免表单交互直接修改调用方传进来的 searchConf。
const formState = reactive({
    domains: JSON.parse(JSON.stringify(props.searchConf)),
});

const getOptionList = (
    item: SearchOption,
): Array<{ value: string | null | number; label: string }> => unref(item.optionsArr ?? item.options ?? []);

const getTranslatedOptionList = (item: SearchOption): Array<{ value: string | null | number; label: string }> =>
    getOptionList(item).map((option) => ({
        ...option,
        label: t(option.label),
    }));

const getFirstModelKey = (): string => {
    const firstInputOption = props.searchConf.find((item) => item.type === 'input');

    if (!firstInputOption) return '';

    return typeof firstInputOption.modelKey === 'string'
        ? firstInputOption.modelKey
        : firstInputOption.modelKey[0] || '';
};

const searchState = ref<{ searchKey: string; searchVal: string }>({
    searchKey: getFirstModelKey(),
    searchVal: '',
});

// 将日期控件的值统一整理成接口可直接使用的字符串或时间戳。
const getNormalizedDateValue = (
    value: SearchFieldValue,
    timeFormat?: string,
): SearchFieldValue => {
    if (value === '' || value === null || typeof value === 'undefined') {
        return null;
    }

    if (timeFormat === 'timeStamp') {
        return String(dayjs(value).valueOf());
    }

    return timeStampToDate(String(value), timeFormat || 'YYYY-MM-DD HH:mm:ss');
};

const emitSearch = (): void => {
    emits('searchCallback', { ...getSearchCal.value });
};

// 顶部快捷搜索使用防抖，避免每次输入都立即触发请求。
const onSearch = debounce((): void => {
    emitSearch();
}, DEBOUNCE_DELAY);

const onToggleSearch = (): void => {
    isSearch.value = !isSearch.value;
};

const onChangeCheck = (): void => {
    isSearch.value = isDefaVal.value;
    sessionStorage.setItem(SEARCH_STATE_KEY, String(isDefaVal.value));
};

const onReset = (): void => {
    formRef.value?.resetFields();
    formState.domains.forEach((item: SearchOption) => {
        if (item.type === 'input') {
            (item as InputSearchOption).value = '';
            return;
        }

        if (item.type === 'select') {
            (item as SelectSearchOption).value = null;
            return;
        }

        if (item.type === 'date-single') {
            (item as DateSingleSearchOption).value = null;
            return;
        }

        if (item.type === 'date') {
            (item as DateRangeSearchOption).modelKey.forEach((key: string) => {
                (item as DateRangeSearchOption)[key] = '';
            });
        }
    });

    searchState.value = {
        searchKey: getFirstModelKey(),
        searchVal: '',
    };
    emitSearch();
};

// 将顶部快捷搜索和下方高级筛选合并成最终接口查询参数。
const getSearchCal = computed((): SearchParams => {
    const obj = reduce(
        getFormStateObj.value,
        (acc: SearchParams, item: SearchParams) => {
            const [key, value] = toPairs(item)[0];
            acc[key] = value;
            return acc;
        },
        {} as SearchParams,
    );

    if (!searchState.value.searchKey) {
        return obj;
    }

    return {
        ...obj,
        [searchState.value.searchKey]: searchState.value.searchVal || null,
    };
});

// 按字段类型把 searchConf 中的每一项转换成最终接口参数结构。
const getFormStateObj = computed((): SearchParams[] =>
    map(formState.domains, (item: SearchOption): SearchParams => {
        if (item.type === 'input') {
            const inputItem = item as InputSearchOption;
            return {
                [inputItem.modelKey]: inputItem.value || null,
            };
        }

        if (item.type === 'select') {
            const selectItem = item as SelectSearchOption;
            return {
                [selectItem.modelKey]: selectItem.value ?? null,
            };
        }

        if (item.type === 'date-single') {
            const dateSingleItem = item as DateSingleSearchOption;
            return {
                [dateSingleItem.modelKey]: getNormalizedDateValue(
                    dateSingleItem.value ?? null,
                    dateSingleItem.timeFormat,
                ),
            };
        }

        const dateItem = item as DateRangeSearchOption;
        return reduce(
            dateItem.modelKey,
            (acc: SearchParams, childKey: string) => {
                const value = dateItem[childKey] as SearchFieldValue;
                acc[childKey] = getNormalizedDateValue(value, dateItem.timeFormat);
                return acc;
            },
            {} as SearchParams,
        );
    }),
);

const getSearchOptions = computed(() => props.searchConf.filter((item) => item.type === 'input'));
const hasQuickSearch = computed(() => getSearchOptions.value.length > 0);

// 顶部快捷搜索已经占用的字段，在高级筛选区里隐藏，避免重复渲染。
const getConfArr = computed(() =>
    formState.domains.filter((item: SearchOption) => {
        const key = typeof item.modelKey === 'string' ? item.modelKey : item.modelKey[0];
        return !hasQuickSearch.value || key !== searchState.value.searchKey;
    }),
);

const fetchTipsText = computed(
    () => getSearchOptions.value.find((item) => item.modelKey === searchState.value.searchKey)?.label || '',
);

watch(
    () => props.searchConf,
    (value) => {
        formState.domains = JSON.parse(JSON.stringify(value));

        if (!getSearchOptions.value.find((item) => item.modelKey === searchState.value.searchKey)) {
            searchState.value.searchKey = getFirstModelKey();
        }
    },
    { deep: true },
);

// 对外暴露基础表单操作，供 TableSearchWrap 父组件复用当前搜索状态。
defineExpose<TableSearchFormExpose>({
    reset: onReset,
    search: emitSearch,
    getSearchParams: (): SearchParams => ({ ...getSearchCal.value }),
});
</script>
<template>
    <div class="w-full">
        <header class="w-full">
            <div class="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div
                    v-if="hasQuickSearch"
                    class="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:max-w-[48rem]"
                >
                    <a-select
                        v-model="searchState.searchKey"
                        class="min-w-[160px] sm:w-[180px]"
                        size="small"
                        @change="emitSearch"
                    >
                        <a-option
                            v-for="item of getSearchOptions"
                            :key="item.modelKey"
                            :value="item.modelKey"
                        >
                            {{ t(item.label) }}
                        </a-option>
                    </a-select>
                    <a-input
                        v-model="searchState.searchVal"
                        allow-clear
                        size="small"
                        class="w-2/5"
                        :placeholder="t('搜索{label}', { label: t(fetchTipsText) })"
                        @pressEnter="emitSearch"
                        @input="onSearch"
                    >
                        <template #prefix>
                            <IconSearch class="search-icon" />
                        </template>
                    </a-input>
                </div>
                <div v-else>
                    <slot name="left"></slot>
                </div>
                <a-space
                    v-if="props.isMore && props.searchConf.length > 1"
                    class="justify-end"
                    wrap
                >
                    <a-checkbox v-model="isDefaVal" :value="false" @change="onChangeCheck">
                        {{ t('默认展开') }}
                    </a-checkbox>
                    <a-button size="small" @click.stop="onToggleSearch">
                        <template #icon>
                            <span class="mr-1">
                                <IconCaretDown v-if="!isSearch" />
                                <IconCaretUp v-else />
                            </span>
                        </template>
                        {{ t('更多筛选') }}
                    </a-button>
                </a-space>
            </div>
        </header>
        <div
            v-if="isSearch && props.searchConf.length > 1"
            :class="[
                'mt-[10px] flex flex-col rounded-[10px] bg-[#f7f8fa] animate__animated',
                isSearch ? 'animate__fadeIn' : 'animate__fadeOut',
                'animate__delay-0.6s',
            ]"
        >
            <a-form ref="formRef" size="small" :model="formState" layout="vertical">
                <div class="w-full px-3 pt-3">
                    <a-row :gutter="[12, 0]">
                        <a-col
                            v-for="(item, i) of getConfArr"
                            :key="i"
                            :span="['input', 'select', 'date-single'].includes(item.type) ? 4 : 8"
                        >
                            <a-form-item :label="t(item.label)" :name="item.modelKey">
                                <a-input
                                    v-if="item.type === 'input'"
                                    v-model="item.value"
                                    class="w-full"
                                    :placeholder="t(item.placeholder || '请输入{label}', { label: t(item.label) })"
                                    v-bind="item.props"
                                    @pressEnter="emitSearch"
                                    @input="onSearch"
                                />
                                <a-select
                                    v-if="item.type === 'select'"
                                    v-model="item.value"
                                    :options="getTranslatedOptionList(item)"
                                    :placeholder="t(item.placeholder || '请选择{label}', { label: t(item.label) })"
                                    v-bind="item.props"
                                    @change="emitSearch"
                                >
                                    <a-option :value="null">{{ t('全部') }}</a-option>
                                    <a-option
                                        v-for="child of getTranslatedOptionList(item)"
                                        :key="child.value"
                                        :value="child.value"
                                    >
                                        {{ child.label }}
                                    </a-option>
                                </a-select>
                                <a-date-picker
                                    v-if="item.type === 'date-single'"
                                    v-model="item.value"
                                    class="w-full"
                                    show-time
                                    format="YYYY-MM-DD HH:mm:ss"
                                    v-bind="item.props"
                                    @change="emitSearch"
                                />
                                <template v-if="item.type === 'date' && item.modelKey.length">
                                    <div class="flex flex-row items-center w-full">
                                        <template
                                            v-for="(child, childI) of item.modelKey"
                                            :key="childI"
                                        >
                                            <a-date-picker
                                                v-model="item[child]"
                                                class="w-full"
                                                show-time
                                                format="YYYY-MM-DD HH:mm:ss"
                                                v-bind="item.props"
                                                @change="emitSearch"
                                            />
                                            <span v-if="childI === 0" class="mx-2">~</span>
                                        </template>
                                    </div>
                                </template>
                            </a-form-item>
                        </a-col>
                    </a-row>
                </div>
            </a-form>
            <div class="flex justify-end border-t border-[var(--app-divider)] bg-transparent px-3 pt-[10px] pb-3">
                <a-button type="primary" size="small" class="mr-2" @click.stop="emitSearch">
                    {{ t('搜索') }}
                </a-button>
                <a-button size="small" @click.stop="onReset">
                    {{ t('重置') }}
                </a-button>
            </div>
        </div>
    </div>
</template>
