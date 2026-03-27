<script setup lang="ts">
import accountListApi from '@/api/userApi/account/list'
import TableSearchWrap from '@/components/TableSearchWrap/Index.vue'
import PermissionButton from '@/components/TableSearchWrap/components/PermissionButton.vue'
import type { CancellationApplicationType } from '@/interface/type'
import type { ColumnType, SearchOption, TableFetchResult, TableSearchWrapExpose } from '@/interface/TableType'
import { Message, Modal } from '@arco-design/web-vue'

interface CancellationTableRow extends Record<string, unknown> {
    id: string
    accountId?: string
    email?: string
    phone?: string
    globalCode?: string
    cancelTime?: string
    closeAccountCheck?: 1 | 2 | 3 | ''
    userEmail?: string
}

const { t } = useI18n()

const tableWrapRef = ref<TableSearchWrapExpose | null>(null)

const closeAccountCheckOptions = [
    { label: t('全部'), value: '' },
    { label: t('待审核'), value: 1 },
    { label: t('审核通过'), value: 2 },
    { label: t('审核拒绝'), value: 3 },
]

const closeAccountCheckTextMap: Record<string, string> = {
    '1': '待审核',
    '2': '审核通过',
    '3': '审核拒绝',
}

const stateTextMap: Record<string, string> = {
    '1': '正常',
    '2': '冻结',
    '3': '注销',
}

const searchConf = ref<SearchOption[]>([
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
        options: closeAccountCheckOptions,
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
    { title: t('注销审核状态'), dataIndex: 'closeAccountCheck', slotName: 'closeAccountCheck', width: 140 },
    { title: t('状态'), dataIndex: 'state', slotName: 'state', width: 100 },
    { title: t('操作'), dataIndex: 'action', slotName: 'action', width: 120, fixed: 'right', sorter: false },
])

const fetchCancellationList = async (
    params: Record<string, unknown> = {},
): Promise<TableFetchResult<Record<string, unknown>>> => {
    const response = await accountListApi.getCancellationApplicationList(
        params as CancellationApplicationType,
    )

    return {
        list: response.list as unknown as Record<string, unknown>[],
        pageNo: Number((response as unknown as Record<string, unknown>).pageNo ?? params.pageNo ?? 1),
        pageSize: Number((response as unknown as Record<string, unknown>).pageSize ?? params.pageSize ?? 20),
        totalSize: Number(response.totalSize ?? 0),
    }
}

/**
 * 解绑邮箱是不可逆操作，所以在执行前加确认流程。
 */
const handleUnbindEmail = (record: CancellationTableRow): void => {
    Modal.confirm({
        title: t('确认'),
        content: t('解绑后不可恢复，确定继续？'),
        okText: t('确认'),
        cancelText: t('取消'),
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

        <template #closeAccountCheck="{ record }">
            {{ t(closeAccountCheckTextMap[String(record.closeAccountCheck)] || '--') }}
        </template>

        <template #state="{ record }">
            {{ t(stateTextMap[String(record.state)] || '--') }}
        </template>

        <template #action="{ record }">
            <PermissionButton
                v-if="String(record.closeAccountCheck) === '1'"
                button-key="unbinging"
                status="danger"
                @click="handleUnbindEmail(record as CancellationTableRow)"
            >
                {{ t('解绑') }}
            </PermissionButton>
        </template>
    </TableSearchWrap>
</template>
