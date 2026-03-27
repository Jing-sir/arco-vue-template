<script setup lang="ts">
import accountListApi from '@/api/userApi/account/list'
import TableSearchWrap from '@/components/TableSearchWrap/Index.vue'
import type { CancellationApplicationItem, CancellationApplicationType } from '@/interface/type'
import type { ColumnType, SearchOption, TableFetchResult, TableSearchWrapExpose } from '@/interface/TableType'
import { buildTableFetchResult } from '@/utils/table'
import { Message } from '@arco-design/web-vue'
import useConfirmAction from '@/use/useConfirmAction'

type CancellationTableRow = CancellationApplicationItem
type CancellationStatus = 1 | 2 | 3 | ''

const { t } = useI18n()
const { confirmAndRun } = useConfirmAction()

const tableWrapRef = ref<TableSearchWrapExpose | null>(null)

const closeAccountCheckOptions = computed(() => [
    { label: t('全部'), value: '' },
    { label: t('待审核'), value: 1 },
    { label: t('审核通过'), value: 2 },
    { label: t('审核拒绝'), value: 3 },
])

/**
 * 统一把状态筛选值收敛到后端可识别的取值：
 * - 空条件：''
 * - 有效状态：1 / 2 / 3
 * - 其它异常输入：兜底回空条件
 */
const normalizeStatusValue = (value: unknown): CancellationStatus => {
    if (value === '' || value === null || typeof value === 'undefined') return ''
    const normalized = Number(value)
    if (normalized === 1 || normalized === 2 || normalized === 3) {
        return normalized
    }
    return ''
}

/**
 * 兼容老项目查询契约：
 * 1. 所有筛选字段都显式传给后端
 * 2. 空值统一用空字符串，而不是 null / undefined
 * 3. 保留 `state` 字段默认空值，避免后端分支与老项目不一致
 */
const normalizeCancellationParams = (
    params: Record<string, unknown> = {},
): CancellationApplicationType => ({
    pageNo: Number(params.pageNo || 1),
    pageSize: Number(params.pageSize || 20),
    accountId: String(params.accountId || ''),
    userEmail: String(params.userEmail || ''),
    checkCloseState: normalizeStatusValue(params.checkCloseState),
    state: normalizeStatusValue(params.state),
    startTime: String(params.startTime || ''),
    endTime: String(params.endTime || ''),
})

const searchConf = computed<SearchOption[]>(() => [
    {
        label: t('用户UID'),
        modelKey: 'accountId',
        type: 'input',
        placeholder: t('请输入用户UID'),
        value: '',
    },
    {
        label: t('邮箱'),
        modelKey: 'userEmail',
        type: 'input',
        placeholder: t('请输入邮箱'),
        value: '',
    },
    {
        label: t('审核状态'),
        modelKey: 'checkCloseState',
        type: 'select',
        value: '',
        options: closeAccountCheckOptions.value,
    },
    {
        label: t('操作时间'),
        modelKey: ['startTime', 'endTime'],
        type: 'date',
        timeFormat: 'YYYY-MM-DD HH:mm:ss',
    },
])

const tableColumns = computed<ColumnType[]>(() => [
    { title: t('用户UID'), dataIndex: 'accountId', slotName: 'accountId', width: 200, fixed: 'left' },
    { title: t('注册手机号'), dataIndex: 'phone', slotName: 'phone', width: 140 },
    { title: t('注册邮箱'), dataIndex: 'email', width: 220 },
    { title: t('注册时间'), dataIndex: 'createTime', width: 180 },
    { title: t('申请时间'), dataIndex: 'cancelTime', width: 180 },
    { title: t('操作时间'), dataIndex: 'updateTime', width: 180 },
    {
        title: t('注销审核状态'),
        dataIndex: 'closeAccountCheck',
        width: 140,
        cellPreset: {
            type: 'statusText',
            preset: 'cancellationCheckState',
        },
    },
    {
        title: t('状态'),
        dataIndex: 'state',
        width: 100,
        cellPreset: {
            type: 'statusText',
            preset: 'cancellationUserState',
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
                    buttonKey: 'unbinging',
                    status: 'danger',
                    text: '解绑',
                    show: (record) => String(record.closeAccountCheck) === '1',
                    onClick: (record) => handleUnbindEmail(record as CancellationTableRow),
                },
            ],
        },
    },
])

const fetchCancellationList = async (
    params: Record<string, unknown> = {},
): Promise<TableFetchResult<CancellationApplicationItem>> => {
    const normalizedParams = normalizeCancellationParams(params)
    const response = await accountListApi.getCancellationApplicationList(normalizedParams)

    return buildTableFetchResult<CancellationApplicationItem>({
        response,
        params: normalizedParams,
        list: response.list,
    })
}

/**
 * 解绑邮箱是不可逆操作，所以在执行前加确认流程。
 */
const handleUnbindEmail = (record: CancellationTableRow): void => {
    confirmAndRun({
        content: t('解绑后不可恢复，确定继续？'),
        onOk: async () => {
            await accountListApi.updateCloseAccount({ id: String(record.id) })
            Message.success(t('解绑成功'))
            await tableWrapRef.value?.refresh()
        },
    })
}
</script>

<template>
    <TableSearchWrap
        ref="tableWrapRef"
        :api-fetch="fetchCancellationList"
        :table-columns="tableColumns"
        :search-conf="searchConf"
        :enable-column-sort="false"
        :scroll="{ x: 1600, y: 700 }"
        row-key="id"
    >
        <template #accountId="{ record }">
            {{ record.accountId || record.id || '--' }}
        </template>

        <template #phone="{ record }">
            <span v-if="record.globalCode && record.phone">{{ `${record.globalCode} ${record.phone}` }}</span>
            <span v-else-if="record.globalCode">{{ record.globalCode }}</span>
            <span v-else>{{ record.phone || '--' }}</span>
        </template>

    </TableSearchWrap>
</template>
