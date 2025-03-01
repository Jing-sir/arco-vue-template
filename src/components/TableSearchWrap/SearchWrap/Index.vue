<script setup lang="ts">
import { IconSearch, IconCaretDown, IconCaretUp } from '@arco-design/web-vue/es/icon';
import { map, reduce, toPairs, debounce } from 'lodash-es';
import { timeStampToDate } from '@/filters/dateFormat';
import { SearchOption } from '@/interface/TableType';
import { PropType } from 'vue';
import * as console from 'node:console';

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
const emits = defineEmits(['searchCallback']);

const formRef = ref();
const isSearch = ref(sessionStorage.getItem('searchVal') === 'true');
const isDefaVal = ref(sessionStorage.getItem('searchVal') === 'true'); // 是否默认展开

const formState = reactive({
    domains: props.searchConf,
});

const searchState = ref<{ searchKey: string; searchVal: string }>({
    searchKey: props.searchConf.length ? props.searchConf[0].modelKey : '',
    searchVal: '',
});

const onToggleSearch = (): void => {
    isSearch.value = !isSearch.value;
};

const onChangeCheck = (e: boolean): void => {
    isSearch.value = isDefaVal.value;
    sessionStorage.setItem('searchVal', isDefaVal.value);
};

const onSearch = debounce(() => {
    emits('searchCallback', getSearchCal.value);
}, 600);

const onReset = (): void => {
    formRef.value.resetFields();
    formState.domains.forEach((item) => {
        if (['input', 'select'].includes(item.type)) {
            // 如果是 input 或 select 类型，直接设置默认值
            item[item.modelKey] = item.type === 'input' ? '' : null;
        } else if (item.type === 'date') {
            // 如果是 date 类型，遍历 modelKey 设置为空值
            item.modelKey.forEach((childItem) => {
                item[childItem] = '';
            });
        }
    });
    searchState.value.searchVal = '';
    emits('searchCallback', getSearchCal.value);
};

// 格式化搜索obj
const getSearchCal = computed(() => {
    const obj = reduce(getFormStateObj.value, (acc, item) => {
        const [key, value] = toPairs(item)[0];
        acc[key] = value;
        return acc;
    }, {});

    return {
        ...obj,
        [searchState.value.searchKey]: searchState.value.searchVal,
    };
});

const getFormStateObj = computed(() => map(formState.domains, (item) => {
    if (['input', 'select'].includes(item.type)) {
        return {
            [item.modelKey]: item.value ? timeStampToDate(item.value) : null
        };
    }

    // 处理多值情况
    return reduce(item.modelKey, (acc, childKey) => {
        const value = item[childKey];
        acc[childKey] = value ? timeStampToDate(value) : null;
        return acc;
    }, {});
}))

const getSearchOptions = computed(() => props.searchConf.filter((item) => item.type === 'input'));

const getConfArr = computed(() => formState.domains.filter((item) => item.modelKey !== searchState.value.searchKey));

const fetchTipsText = computed(() => getSearchOptions.value.find((item) => item.modelKey === searchState.value.searchKey)?.label || '');
</script>
<template>
    <div class="w-full mb-5">
        <header class="w-full">
            <div class="flex justify-between w-full">
                <div v-if="props.searchConf?.length" class="flex flex-row w-1/2">
                    <a-select v-model="searchState.searchKey" style="min-width: 160px" @change="onSearch">
                        <a-option v-for="item of getSearchOptions" :key="item.modelKey" :value="item.modelKey">
                            {{ item.label }}
                        </a-option>
                    </a-select>
                    <a-input
                        v-model="searchState.searchVal"
                        allow-clear
                        class="ml-4 w-2/5"
                        :placeholder="`${t('searchText')} ${fetchTipsText}`"
                        @pressEnter="onSearch"
                        @input="onSearch"
                    >
                        <!--       -->
                        <template #prefix>
                            <IconSearch class="search-icon" />
                        </template>
                    </a-input>
                </div>
                <div v-else>
                    <slot name="left"></slot>
                </div>
                <a-space v-if="props.isMore && props.searchConf.length > 1">
                    <a-checkbox v-model="isDefaVal" :value="false" @change="onChangeCheck">默认展开</a-checkbox>
                    <a-button @click.stop="onToggleSearch">
                        <template #icon>
                            <span class="mr-1">
                                <icon-caret-down v-if="!isSearch" />
                                <icon-caret-up v-else />
                            </span>
                        </template>
                        {{ t('moreBtn') }}
                        <!--   更多筛选    -->
                    </a-button>
                </a-space>
            </div>
        </header>
        <div
            v-if="isSearch && props.searchConf.length > 1"
            :class="['flex flex-col search-footer mt-0.5 animate__animated', isSearch ? 'animate__fadeIn' : 'animate__fadeOut', 'animate__delay-0.6s']"
        >
            <a-form ref="formRef" size="large" :model="formState" layout="vertical">
                <div class="flex flex-row w-full flex-wrap search-wrap">
                    <a-row :gutter="[10]">
                        <a-col v-for="(item, i) of getConfArr" :key="i" :span="['input', 'select'].includes(item.type) ? 4 : 8">
                            <a-form-item :label="item.label" :name="item.modelKey">
                                <a-input
                                    v-if="item.type === 'input'"
                                    v-model="item.value"
                                    class="w-full"
                                    :placeholder="`${t('inputText[0]')}${item.label}`"
                                    @pressEnter="onSearch"
                                    @input="onSearch"
                                />
                                <!--   请输入    -->
                                <a-select
                                    v-if="item.type === 'select'"
                                    v-model="item.value"
                                    :options="item.optionsArr"
                                    :placeholder="`${t('inputText[1]')}${item.label}`"
                                    v-bind="item.props"
                                    @change="onSearch"
                                >
                                    <!--   请选择    -->
                                    <a-option :value="null">全部</a-option>
                                    <a-option v-for="child of item.optionsArr" :key="child.value" :value="child.value">
                                        {{ child.label }}
                                    </a-option>
                                </a-select>
                                <template v-if="item.type === 'date' && item.modelKey.length">
                                    <div class="flex flex-row items-center w-full">
                                        <template v-for="(child, childI) of item.modelKey" :key="childI">
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
                <a-button type="primary" class="mr-2" @click.stop="onSearch">{{ t('searchText') }}</a-button>
                <!--   搜索    -->
                <a-button @click.stop="onReset">{{ t('resetText') }}</a-button>
                <!--   重置    -->
            </div>
        </div>
    </div>
</template>

<i18n>
zh-CN:
    searchText: 搜索
    resetText: 重置
    moreBtn: 更多筛选
    inputText:
        - 请输入
        - 请选择
</i18n>

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
