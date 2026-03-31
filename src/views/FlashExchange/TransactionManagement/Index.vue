<script setup lang="ts">
import flashExchangeApi from '@/api/flashExchange'
import type { FlashOption, TradePairItem } from '@/api/flashExchange'
import TableSearchWrap from '@/components/TableSearchWrap/Index.vue'
import type {
    ColumnType,
    SearchOption,
    TableFetchResult,
    TableSearchWrapExpose,
    TableToolbarButtonConfig,
} from '@/interface/TableType'
import { buildTableFetchResult } from '@/utils/table'
import { fetchTradeOptions, formatTradeOptionLabel } from '@/utils/tradeOptions'
import TradePairModal from './modal/TradePairModal.vue'

interface TradePairModalExpose {
    open: (mode?: 'add' | 'edit', source?: TradePairItem) => void
}

const { t } = useI18n()

const tableWrapRef = ref<TableSearchWrapExpose | null>(null)
const tradePairModalRef = ref<TradePairModalExpose | null>(null)

const tradeOptions = ref<FlashOption[]>([])

/**
 * TableSearchWrap 的 actionButtons 回调参数是通用 Record，
 * 这里集中做一次类型收窄，避免操作列里重复断言。
 */
const toTradePairItem = (record: Record<string, unknown>): TradePairItem =>
    record as unknown as TradePairItem

const showOptions = computed(() => [
    { label: t('是'), value: 1 },
    { label: t('否'), value: 2 },
])

const switchOptions = computed(() => [
    { label: t('开启'), value: 1 },
    { label: t('关闭'), value: 2 },
])

const tradeStatusOptions = computed(() => [
    { label: t('上架'), value: 1 },
    { label: t('下架'), value: 2 },
])

/**
 * 查询条件与老页面保持一致：
 * - 交易对、显示开关、下单开关、交易对状态
 */
const searchConf = computed<SearchOption[]>(() => [
    {
        label: t('交易对'),
        modelKey: 'tradeId',
        type: 'select',
        value: null,
        options: tradeOptions.value.map((item) => ({
            label: formatTradeOptionLabel(item),
            value: item.value,
        })),
    },
    {
        label: t('是否在行情区显示'),
        modelKey: 'marketShow',
        type: 'select',
        value: null,
        options: showOptions.value,
    },
    {
        label: t('是否在交易区显示'),
        modelKey: 'transactionShow',
        type: 'select',
        value: null,
        options: showOptions.value,
    },
    {
        label: t('市价单买入'),
        modelKey: 'marketPriceBuySwitch',
        type: 'select',
        value: null,
        options: switchOptions.value,
    },
    {
        label: t('市价单卖出'),
        modelKey: 'marketPriceSellSwitch',
        type: 'select',
        value: null,
        options: switchOptions.value,
    },
    {
        label: t('限价单买入'),
        modelKey: 'limitPriceBuySwitch',
        type: 'select',
        value: null,
        options: switchOptions.value,
    },
    {
        label: t('限价单卖出'),
        modelKey: 'limitPriceSellSwitch',
        type: 'select',
        value: null,
        options: switchOptions.value,
    },
    {
        label: t('交易对状态'),
        modelKey: 'status',
        type: 'select',
        value: null,
        options: tradeStatusOptions.value,
    },
])

const toolbarButtons = computed<TableToolbarButtonConfig[]>(() => [
    {
        buttonKey: 'add',
        text: t('新增'),
        type: 'primary',
        onClick: () => {
            tradePairModalRef.value?.open('add')
        },
    },
])

const tableColumns = computed<ColumnType[]>(() => [
    { title: t('ID'), dataIndex: 'id', width: 90, fixed: 'left', sorter: false },
    { title: t('交易对'), dataIndex: 'tradeName', width: 140, sorter: false },
    { title: t('排序'), dataIndex: 'sort', width: 90, sorter: false },
    { title: t('价格精度'), dataIndex: 'pricePrecision', width: 100, sorter: false },
    { title: t('数量精度'), dataIndex: 'countPrecision', width: 100, sorter: false },
    { title: t('额度精度'), dataIndex: 'quotaPrecision', width: 100, sorter: false },
    {
        title: t('是否在行情区显示'),
        dataIndex: 'marketShow',
        width: 140,
        sorter: false,
        cellPreset: {
            type: 'statusText',
            preset: 'flashShowState',
        },
    },
    {
        title: t('是否在交易区显示'),
        dataIndex: 'transactionShow',
        width: 140,
        sorter: false,
        cellPreset: {
            type: 'statusText',
            preset: 'flashShowState',
        },
    },
    {
        title: t('市价单买入'),
        dataIndex: 'marketPriceBuySwitch',
        width: 120,
        sorter: false,
        cellPreset: {
            type: 'statusText',
            preset: 'flashSwitchState',
        },
    },
    {
        title: t('市价单卖出'),
        dataIndex: 'marketPriceSellSwitch',
        width: 120,
        sorter: false,
        cellPreset: {
            type: 'statusText',
            preset: 'flashSwitchState',
        },
    },
    {
        title: t('限价单买入'),
        dataIndex: 'limitPriceBuySwitch',
        width: 120,
        sorter: false,
        cellPreset: {
            type: 'statusText',
            preset: 'flashSwitchState',
        },
    },
    {
        title: t('限价单卖出'),
        dataIndex: 'limitPriceSellSwitch',
        width: 120,
        sorter: false,
        cellPreset: {
            type: 'statusText',
            preset: 'flashSwitchState',
        },
    },
    {
        title: t('交易对状态'),
        dataIndex: 'status',
        width: 120,
        sorter: false,
        cellPreset: {
            type: 'statusText',
            preset: 'flashTradeStatus',
        },
    },
    {
        title: t('操作'),
        dataIndex: 'action',
        width: 120,
        fixed: 'right',
        sorter: false,
        cellPreset: {
            type: 'actionButtons',
            buttons: [
                {
                    buttonKey: 'edit',
                    text: t('编辑'),
                    onClick: (record) => {
                        tradePairModalRef.value?.open('edit', toTradePairItem(record))
                    },
                },
            ],
        },
    },
])

const fetchTradePairList = async (
    params: Record<string, unknown> = {},
): Promise<TableFetchResult<Record<string, unknown>>> => {
    /**
     * 查询参数保持原样透传给后端（例如 select 的 null），
     * 这里只兜底分页字段，保证 TableSearchWrap 和接口分页契约稳定。
     */
    const requestParams = {
        ...params,
        pageNo: Number(params.pageNo || 1),
        pageSize: Number(params.pageSize || 20),
    }
    const response = await flashExchangeApi.getTradePairPage(
        requestParams as Parameters<typeof flashExchangeApi.getTradePairPage>[0],
    )

    return buildTableFetchResult<Record<string, unknown>>({
        response,
        params: requestParams,
    })
}

const loadTradeOptions = async (): Promise<void> => {
    tradeOptions.value = await fetchTradeOptions()
}

const handleModalSuccess = async (): Promise<void> => {
    await tableWrapRef.value?.refresh()
}

useOnActivated(() => {
    loadTradeOptions().then()
    tableWrapRef.value?.reset()
})

onMounted(() => {
    loadTradeOptions().then()
})
</script>

<template>
    <div>
        <TableSearchWrap
            ref="tableWrapRef"
            :api-fetch="fetchTradePairList"
            :table-columns="tableColumns"
            :search-conf="searchConf"
            :toolbar-buttons="toolbarButtons"
            :scroll="{ x: 1900, y: 700 }"
            row-key="id"
        />
        <TradePairModal ref="tradePairModalRef" @success="handleModalSuccess" />
    </div>
</template>
