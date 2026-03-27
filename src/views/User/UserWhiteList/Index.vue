<script setup lang="ts">
import type { WhitelistRow } from '@/api/whiteList'
import whiteListApi from '@/api/whiteList'
import TableSearchWrap from '@/components/TableSearchWrap/Index.vue'
import LabelTagList from '@/components/TableSearchWrap/components/LabelTagList.vue'
import PermissionButton from '@/components/TableSearchWrap/components/PermissionButton.vue'
import {
    commonLevelEnumMap,
    whitelistStateEnum,
    whitelistStateEnumMap,
} from '@/enums/whitelistEnum'
import type {
    ColumnType,
    SearchOption,
    TableFetchResult,
    TableSearchWrapExpose,
} from '@/interface/TableType'
import { transMapBySelectOptions } from '@/utils/component'
import { Message, Modal } from '@arco-design/web-vue'
import EditWhiteListModal from './modal/EditWhiteListModal.vue'
import WhitelistLevelCell from './components/WhitelistLevelCell.vue'
import WhitelistStateCell from './components/WhitelistStateCell.vue'

interface WhitelistTableRow extends WhitelistRow, Record<string, unknown> {
    stateLoading?: boolean
    ditchCardIds?: string
}

interface EditWhiteListModalExpose {
    open: (source?: WhitelistTableRow) => void
    close: () => void
}

const { t } = useI18n()

const tableWrapRef = ref<TableSearchWrapExpose | null>(null)
const editModalRef = ref<EditWhiteListModalExpose | null>(null)

const levelOptions = computed(() => [
    { label: t('全部'), value: '' },
    ...transMapBySelectOptions(commonLevelEnumMap, (value, item) => ({
        label: t(item.label),
        value: value as number,
    })),
])

const stateOptions = computed(() => [
    { label: t('全部'), value: '' },
    ...transMapBySelectOptions(whitelistStateEnumMap, (value, item) => ({
        label: t(item.label),
        value: value as number,
    })),
])

const searchConf = computed<SearchOption[]>(() => [
    {
        label: t('UID'),
        modelKey: 'accountId',
        placeholder: t('请输入'),
        type: 'input',
        value: '',
    },
    {
        label: t('赦免认证等级'),
        modelKey: 'kycLevelRequired',
        type: 'select',
        value: '',
        options: levelOptions.value,
    },
    {
        label: t('模拟认证等级'),
        modelKey: 'kycLevelMock',
        type: 'select',
        value: '',
        options: levelOptions.value,
    },
    {
        label: t('状态'),
        modelKey: 'state',
        type: 'select',
        value: '',
        options: stateOptions.value,
    },
])

const tableColumns = computed<ColumnType[]>(() => [
    { title: t('UID'), dataIndex: 'accountId', width: 200, fixed: 'left' },
    { title: t('标签'), dataIndex: 'labelList', slotName: 'labelList', width: 220 },
    { title: t('业务类型'), dataIndex: 'businessType', slotName: 'businessType', width: 220 },
    {
        title: t('赦免认证等级'),
        dataIndex: 'kycLevelRequired',
        slotName: 'kycLevelRequired',
        width: 140,
    },
    { title: t('实际认证等级'), dataIndex: 'kycLevel', slotName: 'kycLevel', width: 140 },
    { title: t('模拟认证等级'), dataIndex: 'kycLevelMock', slotName: 'kycLevelMock', width: 140 },
    { title: t('状态'), dataIndex: 'state', slotName: 'state', width: 120 },
    {
        title: t('操作'),
        dataIndex: 'action',
        slotName: 'action',
        width: 180,
        fixed: 'right',
        sorter: false,
    },
])

const fetchWhitelistList = async (
    params: Record<string, unknown> = {},
): Promise<TableFetchResult<Record<string, unknown>>> => {
    const response = await whiteListApi.fetchWhitelistList(params)
    return {
        list: response.list as unknown as Record<string, unknown>[],
        pageNo: Number(
            (response as unknown as Record<string, unknown>).pageNo ?? params.pageNo ?? 1,
        ),
        pageSize: Number(
            (response as unknown as Record<string, unknown>).pageSize ?? params.pageSize ?? 20,
        ),
        totalSize: Number(response.totalSize ?? 0),
    }
}

const handleEditSuccess = async (): Promise<void> => {
    await tableWrapRef.value?.refresh()
}

/**
 * 白名单状态切换需要确认，避免误触导致用户策略即时生效。
 */
const handleSetState = (record: WhitelistTableRow): void => {
    const nextState =
        Number(record.state) === whitelistStateEnum.Disable
            ? whitelistStateEnum.Enable
            : whitelistStateEnum.Disable

    Modal.confirm({
        title: t('确认'),
        content: `${t('是否确认执行该操作？')}（${nextState === whitelistStateEnum.Enable ? t('启用') : t('禁用')}）`,
        okText: t('确认'),
        cancelText: t('取消'),
        onOk: async () => {
            record.stateLoading = true
            try {
                await whiteListApi.fetchPpdateState({
                    id: record.id,
                    state: nextState,
                })
                Message.success(t('操作成功'))
                await tableWrapRef.value?.refresh()
            } finally {
                record.stateLoading = false
            }
        },
    })
}
</script>

<template>
    <div>
        <TableSearchWrap
            ref="tableWrapRef"
            :api-fetch="fetchWhitelistList"
            :table-columns="tableColumns"
            :search-conf="searchConf"
            :enable-column-sort="false"
            :scroll="{ x: 1600, y: 700 }"
            row-key="id"
        >
            <template #roleBtnWrap>
                <PermissionButton
                    button-key="userWhiteListAdd"
                    type="primary"
                    size="mini"
                    @click="editModalRef?.open()"
                >
                    {{ t('新增') }}
                </PermissionButton>
            </template>

            <template #labelList="{ record }">
                <LabelTagList :label-list="record.labelList" :label-names="record.labelNames" />
            </template>

            <template #businessType="{ record }">
                <ul class="space-y-1 pl-0">
                    <li
                        v-for="bus in String(record.businessType || '')
                            .split(',')
                            .map((item: string) => item.trim())
                            .filter(Boolean)"
                        :key="bus"
                        class="list-none"
                    >
                        {{ bus }}
                    </li>
                    <li v-if="!record.businessType" class="list-none">--</li>
                </ul>
            </template>

            <template #kycLevelRequired="{ record }">
                <WhitelistLevelCell :status="record.kycLevelRequired" />
            </template>

            <template #kycLevel="{ record }">
                <WhitelistLevelCell :status="record.kycLevel" />
            </template>

            <template #kycLevelMock="{ record }">
                <WhitelistLevelCell :status="record.kycLevelMock" />
            </template>

            <template #state="{ record }">
                <WhitelistStateCell :status="record.state" />
            </template>

            <template #action="{ record }">
                <div class="flex flex-wrap items-center gap-3">
                    <PermissionButton
                        button-key="userWhiteListUpdateState"
                        size="mini"
                        :loading="Boolean(record.stateLoading)"
                        @click="handleSetState(record as WhitelistTableRow)"
                    >
                        {{
                            Number(record.state) === whitelistStateEnum.Disable
                                ? t('启用')
                                : t('禁用')
                        }}
                    </PermissionButton>
                    <PermissionButton
                        button-key="userListEditLabel"
                        size="mini"
                        @click="editModalRef?.open(record as WhitelistTableRow)"
                    >
                        {{ t('编辑') }}
                    </PermissionButton>
                </div>
            </template>
        </TableSearchWrap>

        <EditWhiteListModal ref="editModalRef" @success="handleEditSuccess" />
    </div>
</template>
