<script setup lang="ts">
import TableSearchWrap from '@/components/TableSearchWrap/Index.vue'
import PermissionButton from '@/components/TableSearchWrap/components/PermissionButton.vue'
import type { ColumnType, SearchOption, TableSearchWrapExpose } from '@/interface/TableType'
import kolApi from '@/api/kolConfiguration/index'
import { Message } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import useConfirmAction from '@/use/useConfirmAction'
import AddKolModal from './modal/AddKolModal.vue'

const { t } = useI18n()
const { confirmAndRun } = useConfirmAction()

const tableWrapRef = ref<TableSearchWrapExpose | null>(null)

const stateOptions = computed(() => [
    { label: t('全部'), value: null },
    { label: t('正常'), value: 1 },
    { label: t('已禁用'), value: 2 },
    { label: t('已取消身份'), value: 3 },
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
        label: t('本人邀请码'),
        modelKey: 'invitationCode',
        placeholder: t('请输入'),
        type: 'input',
        value: '',
    },
    {
        label: t('邮箱'),
        modelKey: 'email',
        placeholder: t('请输入'),
        type: 'input',
        value: '',
    },
    {
        label: t('手机号后四位'),
        modelKey: 'phone',
        placeholder: t('请输入'),
        type: 'input',
        value: '',
    },
    {
        label: t('状态'),
        modelKey: 'state',
        type: 'select',
        value: null,
        options: stateOptions.value,
    },
    {
        label: t('创建时间'),
        modelKey: ['startTime', 'endTime'],
        type: 'date',
        timeFormat: 'YYYY-MM-DD HH:mm:ss',
    },
])

const tableColumns = computed<ColumnType[]>(() => [
    { title: t('UID'), dataIndex: 'accountId', width: 200, fixed: 'left' },
    { title: t('用户类型'), dataIndex: 'userTypeName', width: 120 },
    { title: t('本人邀请码'), dataIndex: 'invitationCode', width: 140 },
    { title: t('姓'), dataIndex: 'surname', width: 120 },
    { title: t('名'), dataIndex: 'name', width: 120 },
    {
        title: t('用户标签'),
        dataIndex: 'labelName',
        width: 180,
        cellPreset: {
            type: 'labelTags',
            labelNamesField: 'labelName',
        },
    },
    {
        title: t('初级认证状态'),
        dataIndex: 'authStateName',
        width: 140,
        cellPreset: {
            type: 'statusText',
            preset: 'authState',
        },
    },
    {
        title: t('高级认证状态'),
        dataIndex: 'advancedAuthStateName',
        width: 140,
        cellPreset: {
            type: 'statusText',
            preset: 'authState',
        },
    },
    { title: t('邮箱'), dataIndex: 'email', width: 200 },
    { title: t('手机号'), dataIndex: 'phone', width: 130 },
    {
        title: t('状态'),
        dataIndex: 'stateName',
        width: 120,
        cellPreset: {
            type: 'statusText',
            preset: 'kolState',
        },
    },
    { title: t('创建时间'), dataIndex: 'createTime', width: 180 },
    { title: t('更新时间'), dataIndex: 'updateTime', width: 180 },
    {
        title: t('操作'),
        dataIndex: 'action',
        width: 240,
        fixed: 'right',
        sorter: false,
        cellPreset: {
            type: 'actionButtons',
            buttons: [
                {
                    buttonKey: 'enable',
                    show: (record) => [1, 2].includes(Number(record.state)),
                    status: (record) =>
                        Number(record.state) === 1 ? 'danger' : 'normal',
                    text: (record) =>
                        Number(record.state) === 1 ? '禁用' : '启用',
                    onClick: (record) =>
                        setStateWithConfirm(
                            record,
                            Number(record.state) === 1 ? 2 : 1,
                            Number(record.state) === 1 ? '禁用' : '启用',
                        ),
                },
                {
                    buttonKey: 'changePartnerState',
                    show: (record) => Number(record.state) === 2,
                    status: 'danger',
                    text: '取消合伙人',
                    onClick: (record) => setStateWithConfirm(record, 3, '取消合伙人'),
                },
                {
                    buttonKey: 'changePartnerState',
                    show: (record) => Number(record.state) === 3,
                    text: '恢复合伙人',
                    onClick: (record) => setStateWithConfirm(record, 1, '恢复合伙人'),
                },
            ],
        },
    },
])

const fetchKolList = (params: Record<string, unknown> = {}) =>
    kolApi.fetchGetKolInfluencerList({
        ...params,
        userType: 0,
    })

const setStateWithConfirm = (record: Record<string, any>, state: 1 | 2 | 3, title: string): void => {
    confirmAndRun({
        content: `${t('是否确认执行该操作？')}（${t(title)}）`,
        onOk: async () => {
            await kolApi.fetchEnableKolInfluencer({ id: String(record.id), state })
            Message.success(t('操作成功'))
            await tableWrapRef.value?.refresh()
        },
    })
}

const addModalVisible = ref(false)

const openAddModal = (): void => {
    addModalVisible.value = true
}

/**
 * 新增 KOL 成功后刷新当前列表，保持和其它操作一致的回显策略。
 */
const handleAddSuccess = async (): Promise<void> => {
    await tableWrapRef.value?.refresh()
}
</script>

<template>
    <div>
        <TableSearchWrap
            ref="tableWrapRef"
            :api-fetch="fetchKolList"
            :table-columns="tableColumns"
            :search-conf="searchConf"
            :enable-column-sort="false"
            :scroll="{ x: 2200, y: 700 }"
            row-key="id"
        >
            <template #roleBtnWrap>
                <PermissionButton button-key="add" type="primary" @click="openAddModal">
                    <template #icon>
                        <icon-plus />
                    </template>
                    {{ t('添加') }}
                </PermissionButton>
            </template>
        </TableSearchWrap>
        <AddKolModal v-model:visible="addModalVisible" @success="handleAddSuccess" />
    </div>
</template>
