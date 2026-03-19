<script setup lang="ts">
import { IconSearch, IconCaretDown, IconCaretUp } from '@arco-design/web-vue/es/icon'
import { map, reduce, toPairs, debounce } from 'lodash-es'
import { timeStampToDate } from '@/filters/dateFormat'
import { SearchOption, SearchParams, SearchFieldValue, InputSearchOption, SelectSearchOption, DateRangeSearchOption } from '@/interface/TableType'
import { PropType, unref } from 'vue'

// 常量定义
const DEBOUNCE_DELAY = 600
const SEARCH_STATE_KEY = 'searchVal'

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
})

const { t } = useI18n()
const emits = defineEmits(['searchCallback'])

const formRef = ref()
const isSearch = ref(sessionStorage.getItem(SEARCH_STATE_KEY) === 'true')
const isDefaVal = ref(sessionStorage.getItem(SEARCH_STATE_KEY) === 'true') // 是否默认展开

// 深拷贝避免修改props
const formState = reactive({
    domains: JSON.parse(JSON.stringify(props.searchConf)),
})

const getOptionList = (
    item: SearchOption,
): Array<{ value: string | null | number; label: string }> => unref(item.optionsArr ?? item.options ?? [])

// 安全获取第一个modelKey
const getFirstModelKey = (): string => {
    if (!props.searchConf.length) return ''
    const firstKey = props.searchConf[0].modelKey
    return typeof firstKey === 'string' ? firstKey : firstKey[0] || ''
}

const searchState = ref<{ searchKey: string; searchVal: string }>({
    searchKey: getFirstModelKey(),
    searchVal: '',
})

const onToggleSearch = (): void => {
    isSearch.value = !isSearch.value
}

const onChangeCheck = (): void => {
    isSearch.value = isDefaVal.value
    sessionStorage.setItem(SEARCH_STATE_KEY, String(isDefaVal.value))
}

const onSearch = debounce((): void => {
    emits('searchCallback', getSearchCal.value)
}, DEBOUNCE_DELAY)

const onReset = (): void => {
    formRef.value.resetFields()
    formState.domains.forEach((item: SearchOption) => {
        if (item.type === 'input') {
            // 输入框类型，设置为空字符串
            const inputItem = item as InputSearchOption
            inputItem.value = ''
        } else if (item.type === 'select') {
            // 下拉选择类型，设置为 null
            const selectItem = item as SelectSearchOption
            selectItem.value = null
        } else if (item.type === 'date') {
            // 日期范围类型，遍历 modelKey 设置为空值
            const dateItem = item as DateRangeSearchOption
            dateItem.modelKey.forEach((key: string) => {
                dateItem[key] = ''
            })
        }
    })
    searchState.value.searchVal = ''
    emits('searchCallback', getSearchCal.value)
}

// 格式化搜索obj
const getSearchCal = computed((): SearchParams => {
    const obj = reduce(
        getFormStateObj.value,
        (acc: SearchParams, item: SearchParams) => {
            const [key, value] = toPairs(item)[0]
            acc[key] = value
            return acc
        },
        {} as SearchParams,
    )

    return {
        ...obj,
        [searchState.value.searchKey]: searchState.value.searchVal,
    }
})

const getFormStateObj = computed((): SearchParams[] =>
    map(formState.domains, (item: SearchOption): SearchParams => {
        if (item.type === 'input') {
            // 输入框类型
            const inputItem = item as InputSearchOption
            const key = inputItem.modelKey
            return {
                [key]: inputItem.value ? timeStampToDate(inputItem.value) : null,
            }
        } else if (item.type === 'select') {
            // 下拉选择类型
            const selectItem = item as SelectSearchOption
            const key = selectItem.modelKey
            return {
                [key]: selectItem.value ? timeStampToDate(String(selectItem.value)) : null,
            }
        } else {
            // 日期范围类型
            const dateItem = item as DateRangeSearchOption
            return reduce(
                dateItem.modelKey,
                (acc: SearchParams, childKey: string) => {
                    const value = dateItem[childKey] as SearchFieldValue
                    acc[childKey] = value ? timeStampToDate(String(value)) : null
                    return acc
                },
                {} as SearchParams,
            )
        }
    }),
)

const getSearchOptions = computed(() => props.searchConf.filter((item) => item.type === 'input'))

const getConfArr = computed(() =>
    formState.domains.filter((item: SearchOption) => {
        const key = typeof item.modelKey === 'string' ? item.modelKey : item.modelKey[0]
        return key !== searchState.value.searchKey
    }),
)

const fetchTipsText = computed(
    () =>
        getSearchOptions.value.find((item) => item.modelKey === searchState.value.searchKey)
            ?.label || '',
)
</script>
<template>
    <div class="w-full mb-5">
        <header class="w-full">
            <div class="flex justify-between w-full">
                <div v-if="props.searchConf?.length" class="flex flex-row w-1/2">
                    <a-select
                        v-model="searchState.searchKey"
                        style="min-width: 160px"
                        @change="onSearch"
                    >
                        <a-option
                            v-for="item of getSearchOptions"
                            :key="item.modelKey"
                            :value="item.modelKey"
                        >
                            {{ item.label }}
                        </a-option>
                    </a-select>
                    <a-input
                        v-model="searchState.searchVal"
                        allow-clear
                        class="ml-4 w-2/5"
                        :placeholder="`${t('search.search')} ${fetchTipsText}`"
                        @pressEnter="onSearch"
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
                <a-space v-if="props.isMore && props.searchConf.length > 1">
                    <a-checkbox v-model="isDefaVal" :value="false" @change="onChangeCheck">
                        {{ t('search.defaultExpanded') }}
                    </a-checkbox>
                    <a-button @click.stop="onToggleSearch">
                        <template #icon>
                            <span class="mr-1">
                                <icon-caret-down v-if="!isSearch" />
                                <icon-caret-up v-else />
                            </span>
                        </template>
                        {{ t('search.moreFilters') }}
                    </a-button>
                </a-space>
            </div>
        </header>
        <div
            v-if="isSearch && props.searchConf.length > 1"
            :class="[
                'flex flex-col search-footer mt-0.5 animate__animated',
                isSearch ? 'animate__fadeIn' : 'animate__fadeOut',
                'animate__delay-0.6s',
            ]"
        >
            <a-form ref="formRef" size="large" :model="formState" layout="vertical">
                <div class="flex flex-row w-full flex-wrap search-wrap">
                    <a-row :gutter="10">
                        <a-col
                            v-for="(item, i) of getConfArr"
                            :key="i"
                            :span="['input', 'select'].includes(item.type) ? 4 : 8"
                        >
                            <a-form-item :label="item.label" :name="item.modelKey">
                                <a-input
                                    v-if="item.type === 'input'"
                                    v-model="item.value"
                                    class="w-full"
                                    :placeholder="`${t('search.pleaseInput')}${item.label}`"
                                    @pressEnter="onSearch"
                                    @input="onSearch"
                                />
                                <a-select
                                    v-if="item.type === 'select'"
                                    v-model="item.value"
                                    :options="getOptionList(item)"
                                    :placeholder="`${t('search.pleaseSelect')}${item.label}`"
                                    v-bind="item.props"
                                    @change="onSearch"
                                >
                                    <a-option :value="null">{{ t('search.all') }}</a-option>
                                    <a-option
                                        v-for="child of getOptionList(item)"
                                        :key="child.value"
                                        :value="child.value"
                                    >
                                        {{ child.label }}
                                    </a-option>
                                </a-select>
                                <template v-if="item.type === 'date' && item.modelKey.length">
                                    <div class="flex flex-row items-center w-full">
                                        <template
                                            v-for="(child, childI) of item.modelKey"
                                            :key="childI"
                                        >
                                            <a-date-picker
                                                v-model="item[child]"
                                                style="width: 100%"
                                                show-time
                                                format="YYYY-MM-DD HH:mm:ss"
                                                @change="onSearch"
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
            <div class="flex justify-end pb-3 pr-3">
                <a-button type="primary" class="mr-2" @click.stop="onSearch">
                    {{ t('search.search') }}
                </a-button>
                <a-button @click.stop="onReset">
                    {{ t('search.reset') }}
                </a-button>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.search-footer {
    background: #fbfbfd;
    @apply rounded-lg;
}
.search-wrap {
    @apply pt-3 px-3;
}

::v-deep(.ant-form-item) {
    @apply mb-4;
}
</style>
