<script setup lang="ts">
import TableSearchWrap from '@/components/TableSearchWrap/Index.vue';
import api from '@/api/fetchTest';

const searchConf = ref([
    {
        label: '用户UID',
        modelKey: 'accountId',
        placeholder: '请输入',
        type: 'input',
        value: '',
    },
    {
        label: '用户标签',
        modelKey: 'labelId',
        placeholder: '请选择',
        type: 'select',
        value: null,
    },
    {
        label: '所属代理商',
        modelKey: 'agentName',
        placeholder: '请输入',
        type: 'input',
        value: '',
    },
    {
        label: '渠道客户编号',
        modelKey: 'customerNo',
        placeholder: '请输入',
        type: 'input',
        value: '',
    },
    {
        label: '卡号',
        modelKey: 'cardNo',
        placeholder: '请输入',
        type: 'input',
        value: '',
    },
    {
        label: '卡片渠道',
        modelKey: 'ditchName',
        placeholder: '请选择',
        type: 'select',
        options: [],
        value: null,
    },
    {
        label: '卡片名称',
        modelKey: 'cardName',
        placeholder: '请输入',
        type: 'input',
        value: '',
    },
    {
        label: '赎回币种',
        modelKey: 'coinSymbol',
        placeholder: '请选择',
        type: 'select',
        options: [],
        value: null,
    },
    {
        label: '到账币种',
        modelKey: 'creditedAmountSymbol',
        placeholder: '请选择',
        type: 'select',
        options: [],
        value: null,
    },
    {
        label: '预扣手续费币种',
        modelKey: 'priorFeeSymbol',
        placeholder: '请选择',
        type: 'select',
        options: [],
        value: null,
    },
    {
        label: '原始币种',
        modelKey: 'originalCoinId',
        placeholder: '请选择',
        type: 'select',
        options: [],
        value: null,
    },
    {
        label: '订单号',
        modelKey: 'orderNo',
        placeholder: '请输入',
        type: 'input',
        value: '',
    },
    {
        label: '闪兑订单号',
        modelKey: 'swapNo',
        placeholder: '请输入',
        type: 'input',
        value: '',
    },
    {
        label: '开卡关联订单号',
        modelKey: 'applicationOrderNo',
        placeholder: '请输入',
        type: 'input',
        value: '',
    },
    {
        label: '创建时间',
        modelKey: ['startCreateTime', 'endCreateTime'],
        placeholder: '请选择创建时间',
        timeFormat: 'timeStamp',
        type: 'date',
        value: [],
    },
    {
        label: '更新时间',
        modelKey: ['startUpdateTime', 'endUpdateTime'],
        placeholder: '请选择创建时间',
        timeFormat: 'timeStamp',
        type: 'date',
        value: '',
    },
    {
        label: '来源',
        modelKey: 'source',
        placeholder: '请选择',
        type: 'select',
        options: [],
        value: null,
    },
    {
        label: '订单状态',
        modelKey: 'state',
        placeholder: '请选择',
        type: 'select',
        options: [],
        value: null,
    },
]);

const tableColumns = [
    { title: 'ID', dataIndex: 'id', width: 80, fixed: 'left' },
    { title: '内部卡ID', dataIndex: 'ditchCardId', width: 140 },
    { title: '渠道卡ID', dataIndex: 'internalCardId', key: 'internalCardId', width: 140 },
    { title: '交易关联ID', dataIndex: 'transactionId', key: 'transactionId', width: 140 },
    { title: '渠道交易ID', dataIndex: 'uuid', key: 'uuid', width: 140 },
    { title: '账户号', dataIndex: 'accountNo', width: 140 },
    { title: '业务类型', dataIndex: 'type', width: 140 },
    { title: '交易金额', dataIndex: 'amount', width: 140 },
    { title: '交易币种', dataIndex: 'currencyCode', width: 140 },
    { title: '变动后余额', dataIndex: 'newAmount', width: 140 },
    { title: '冻结金额', dataIndex: 'frozenAmount', width: 140 },
    { title: '变动后冻结余额', dataIndex: 'newFrozenAmount', width: 140 },
    { title: '交易发生时间', dataIndex: 'createTime', width: 140 },
    { title: '备注', dataIndex: 'note', width: 140 },
    { title: '操作', dataIndex: 'optional', slotName: 'optional', fixed: 'right', width: 160 },
];
</script>

<i18n>
  zh-CN:
    text: '测试'
  en-US:
    text: 'test'
</i18n>
<template>
    <div class="main-wrapper">
        <TableSearchWrap :api-fetch="api.redemptionList.bind(api)" :table-columns="tableColumns" :search-conf="searchConf">
            <template #optional>
                <a-button type="text">编辑</a-button>
            </template>
        </TableSearchWrap>
    </div>
</template>

<style lang="scss" scoped>
.home {
  background: red;
}
</style>
