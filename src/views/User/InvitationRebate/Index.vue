<script setup lang="ts">
import referralApi from '@/api/userApi/referral'
import TableSearchWrap from '@/components/TableSearchWrap/Index.vue'
import type {
    ColumnType,
    SearchOption,
    TableExportConfig,
    TableSearchWrapExpose,
} from '@/interface/TableType'

interface InvitationRebateRow extends Record<string, unknown> {
    id: string
    cardDepositOrderNo: string
    depositAmount: string
    depositType: string | number
    ditchName?: string
    ditchId?: string
    earningAmount: string
    rebateRatio: string
    invitationCode: string
    inviteAccountId: string
    accountCardNo?: string
    parentAccountId: string
    createTime: string
}

const { t } = useI18n()
const tableWrapRef = ref<TableSearchWrapExpose | null>(null)

const getDepositTypeLabel = (depositType: number): string => {
    if (depositType === 1) return t('开卡')
    if (depositType === 2) return t('充值')
    if (depositType === 3) return t('开卡减免')
    if (depositType === 4) return t('首次开卡减免')
    return '--'
}

/**
 * 邀请返佣查询条件：
 * - 与老项目保持同一组筛选字段
 * - 保留“类型”下拉（开卡/充值/减免）查询能力
 */
const searchConf = computed<SearchOption[]>(() => [
    {
        label: t('UID'),
        modelKey: 'inviteAccountId',
        placeholder: t('请输入'),
        type: 'input',
        value: '',
    },
    {
        label: t('上级邀请码'),
        modelKey: 'invitationCode',
        placeholder: t('请输入'),
        type: 'input',
        value: '',
    },
    {
        label: t('关联订单号'),
        modelKey: 'cardDepositOrderNo',
        placeholder: t('请输入'),
        type: 'input',
        value: '',
    },
    {
        label: t('上级 ID'),
        modelKey: 'parentAccountId',
        placeholder: t('请输入'),
        type: 'input',
        value: '',
    },
    {
        label: t('类型'),
        modelKey: 'depositType',
        type: 'select',
        value: null,
        options: [
            { label: t('开卡'), value: 1 },
            { label: t('充值'), value: 2 },
            { label: t('开卡减免'), value: 3 },
            { label: t('首次开卡减免'), value: 4 },
        ],
    },
])

const tableColumns = computed<ColumnType[]>(() => [
    { title: t('ID'), dataIndex: 'id', width: 80, fixed: 'left', sorter: false },
    { title: t('关联订单号'), dataIndex: 'cardDepositOrderNo', width: 220, sorter: false },
    { title: t('充值数量'), dataIndex: 'depositAmount', width: 120, sorter: false },
    { title: t('类型'), dataIndex: 'depositType', slotName: 'depositType', width: 130, sorter: false },
    { title: t('渠道名称'), dataIndex: 'ditchName', width: 140, sorter: false },
    { title: t('渠道ID'), dataIndex: 'ditchId', width: 220, sorter: false },
    { title: t('返佣/减免数量'), dataIndex: 'earningAmount', width: 150, sorter: false },
    { title: t('返佣比例'), dataIndex: 'rebateRatio', slotName: 'rebateRatio', width: 120, sorter: false },
    { title: t('上级邀请码'), dataIndex: 'invitationCode', width: 180, sorter: false },
    { title: t('UID'), dataIndex: 'inviteAccountId', width: 220, sorter: false },
    { title: t('UID卡号'), dataIndex: 'accountCardNo', width: 180, sorter: false },
    { title: t('上级 ID'), dataIndex: 'parentAccountId', width: 220, sorter: false },
    { title: t('返佣时间'), dataIndex: 'createTime', width: 180, fixed: 'right', sorter: false },
])

/**
 * 老接口要求 pageNo/pageSize 必传，且字符串筛选字段保持空串语义。
 * 这里统一做参数归一，避免 null/undefined 造成后端分支偏差。
 */
const normalizeReferralQueryParams = (params: Record<string, unknown> = {}) => ({
    inviteAccountId: String(params.inviteAccountId || ''),
    parentAccountId: String(params.parentAccountId || ''),
    invitationCode: String(params.invitationCode || ''),
    cardDepositOrderNo: String(params.cardDepositOrderNo || ''),
    depositType: params.depositType ?? '',
    pageNo: Number(params.pageNo || 1),
    pageSize: Number(params.pageSize || 20),
})

const fetchReferralList = (params: Record<string, unknown> = {}) =>
    referralApi.getReferralList(
        normalizeReferralQueryParams(
            params,
        ) as Parameters<typeof referralApi.getReferralList>[0],
    )

/**
 * 导出保持老页面行为：
 * 1. 沿用当前筛选条件
 * 2. 带上当前分页参数
 * 3. 导出文件名固定为“邀请返佣.xlsx”
 */
const exportConfig = computed<TableExportConfig>(() => ({
    exportApi: (params: Record<string, unknown>) =>
        referralApi.exportReferralList(
            normalizeReferralQueryParams(
                params,
            ) as Parameters<typeof referralApi.exportReferralList>[0],
        ),
    fileName: `${t('邀请返佣')}.xlsx`,
}))

const formatDepositType = (record: InvitationRebateRow): string => {
    const rawType = Number(record.depositType)
    return getDepositTypeLabel(rawType)
}

const formatRebateRatio = (record: InvitationRebateRow): string => `${String(record.rebateRatio ?? '')}%`

/**
 * 兼容 keep-alive 的历史行为：
 * - hash 为 #no-refresh 时不刷新
 * - 其余场景激活后重置筛选并重新拉取
 */
useOnActivated(() => {
    tableWrapRef.value?.reset()
})
</script>

<template>
    <TableSearchWrap
        ref="tableWrapRef"
        :api-fetch="fetchReferralList"
        :table-columns="tableColumns"
        :search-conf="searchConf"
        :export-config="exportConfig"
        :scroll="{ x: 2100, y: 700 }"
        row-key="id"
    >
        <template #depositType="{ record }">
            {{ formatDepositType(record as InvitationRebateRow) }}
        </template>

        <template #rebateRatio="{ record }">
            {{ formatRebateRatio(record as InvitationRebateRow) }}
        </template>
    </TableSearchWrap>
</template>
