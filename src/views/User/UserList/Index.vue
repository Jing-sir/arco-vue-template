<script setup lang="ts">
import TableSearchWrap from '@/components/TableSearchWrap/Index.vue'
import LabelTagList from '@/components/TableSearchWrap/components/LabelTagList.vue'
import PermissionButton from '@/components/TableSearchWrap/components/PermissionButton.vue'
import accountAuthApi from '@/api/userApi/account/auth'
import accountListApi from '@/api/userApi/account/list'
import tagApi from '@/api/userApi/tag'
import { subSumStatusMap, userIdTypeMap } from '@/api/userApi/userEnum'
import type {
    ColumnType,
    SearchOption,
    SearchParams,
    TableExportConfig,
    TableSearchWrapExpose,
} from '@/interface/TableType'
import { Message, Modal } from '@arco-design/web-vue'
import UserAuthCell from '../UserAuthCell.vue'

const { t } = useI18n()
const route = useRoute()

const tableWrapRef = ref<TableSearchWrapExpose | null>(null)

interface UserListRow extends Record<string, unknown> {
    id: string
    state: 1 | 2 | 3
    authState: 0 | 1 | 2 | 3
    authStateName?: string
    advancedAuthState: 0 | 1 | 2 | 3
    advancedAuthStateName?: string
    documentType?: number | string | null
    documentTypeName?: string
    documentTypeListing?: string
    certificateType?: number | string | null
    labelList?: Array<{ id: string; name: string; color: string }>
    labelNames?: string
}

/**
 * 兼容历史从其它列表跳转时携带 ?uid=xxx 的场景：
 * 1. 首次进入默认按 uid 预筛选
 * 2. 路由 query 变化时自动同步触发一次查询
 */
const routeUid = computed(() => String(route.query.uid || ''))
const defaultParams = computed<SearchParams>(() => ({
    accountId: routeUid.value || '',
}))

const stateOptions = [
    { label: t('全部'), value: '' },
    { label: t('正常'), value: 1 },
    { label: t('冻结'), value: 2 },
    { label: t('已注销'), value: 3 },
]

/**
 * 标签与国家下拉来源于后端，保持和标签模块、认证模块同一数据口径。
 */
const tagOptions = ref<Array<{ label: string; value: string | number }>>([
    { label: t('全部'), value: '' },
])
const countryOptions = ref<Array<{ label: string; value: string | number }>>([
    { label: t('全部'), value: '' },
])

const authStatusOptions = computed(() => [
    { label: t('全部'), value: '' },
    ...Array.from(subSumStatusMap.entries())
        .filter(([value]) => typeof value === 'number')
        .map(([value, item]) => ({
            label: t(item.label),
            value,
        })),
])

const documentTypeOptions = computed(() => [
    { label: t('全部'), value: '' },
    ...Array.from(userIdTypeMap.entries()).map(([value, item]) => ({
        label: t(item.label),
        value,
    })),
])

/**
 * 用户列表筛选项：
 * - 保留现有常用搜索
 * - 补齐老页面中仍在使用的证件类型、认证状态、标签、国家、渠道客户编号等字段
 */
const searchConf = computed<SearchOption[]>(() => [
    {
        label: t('UID'),
        modelKey: 'accountId',
        placeholder: t('请输入'),
        type: 'input',
        value: routeUid.value,
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
        label: t('渠道客户编号'),
        modelKey: 'customerNo',
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
        label: t('上级邀请码'),
        modelKey: 'parentInvitationCode',
        placeholder: t('请输入'),
        type: 'input',
        value: '',
    },
    {
        label: t('证件类型'),
        modelKey: 'documentType',
        type: 'select',
        value: '',
        options: documentTypeOptions.value,
    },
    {
        label: t('证件颁发国家'),
        modelKey: 'country',
        type: 'select',
        value: '',
        options: countryOptions.value,
    },
    {
        label: t('用户标签'),
        modelKey: 'labelId',
        type: 'select',
        value: '',
        options: tagOptions.value,
    },
    {
        label: t('初级认证状态'),
        modelKey: 'authState',
        type: 'select',
        value: '',
        options: authStatusOptions.value,
    },
    {
        label: t('高级认证状态'),
        modelKey: 'advancedAuthState',
        type: 'select',
        value: '',
        options: authStatusOptions.value,
    },
    {
        label: t('状态'),
        modelKey: 'state',
        type: 'select',
        value: '',
        options: stateOptions,
    },
    {
        label: t('创建日期'),
        modelKey: ['startTime', 'endTime'],
        type: 'date',
        timeFormat: 'YYYY-MM-DD HH:mm:ss',
    },
])

const tableColumns = computed<ColumnType[]>(() => [
    /**
     * 你要求“不是所有列都需要排序，默认仅状态/时间带排序”：
     * - 非状态/时间列统一显式关闭 sorter
     * - 状态类与时间类列显式声明 sorter，避免行为漂移
     */
    { title: t('UID'), dataIndex: 'id', width: 200, fixed: 'left', sorter: false },
    { title: t('渠道客户编号'), dataIndex: 'customerNo', width: 140, sorter: false },
    { title: t('所属代理商'), dataIndex: 'agentName', width: 160, sorter: false },
    { title: t('用户类型'), dataIndex: 'userTypeName', width: 100, sorter: false },
    { title: t('本人邀请码'), dataIndex: 'invitationCode', width: 140, sorter: false },
    { title: t('上级邀请码'), dataIndex: 'parentInvitationCode', width: 140, sorter: false },
    { title: t('姓'), dataIndex: 'surname', width: 100, sorter: false },
    { title: t('名'), dataIndex: 'name', width: 100, sorter: false },
    { title: t('标签'), dataIndex: 'labelList', slotName: 'labelList', width: 220, sorter: false },
    { title: t('证件颁发国家'), dataIndex: 'country', width: 140, sorter: false },
    {
        title: t('初级认证状态'),
        dataIndex: 'authState',
        slotName: 'authState',
        width: 140,
        sorter: {
            type: 'enum',
            enumOrder: [0, 1, 2, 3],
        },
    },
    {
        title: t('高级认证状态'),
        dataIndex: 'advancedAuthState',
        slotName: 'advancedAuthState',
        width: 140,
        sorter: {
            type: 'enum',
            enumOrder: [0, 1, 2, 3],
        },
    },
    { title: t('证件类型'), dataIndex: 'documentType', slotName: 'documentType', width: 120, sorter: false },
    { title: t('邮箱'), dataIndex: 'email', width: 220, sorter: false },
    { title: t('区号'), dataIndex: 'globalCode', width: 100, sorter: false },
    { title: t('手机号'), dataIndex: 'phone', width: 140, sorter: false },
    {
        title: t('创建日期'),
        dataIndex: 'createTime',
        width: 180,
        sorter: {
            type: 'date',
        },
    },
    {
        title: t('状态'),
        dataIndex: 'state',
        slotName: 'state',
        width: 120,
        fixed: 'right',
        sorter: {
            type: 'enum',
            enumOrder: [1, 2, 3],
        },
    },
    { title: t('操作'), dataIndex: 'action', slotName: 'action', fixed: 'right', width: 240, sorter: false },
])

const fetchUserList = (params: Record<string, unknown> = {}) =>
    accountListApi.getAccountList(params as Parameters<typeof accountListApi.getAccountList>[0])

/**
 * 用户列表导出配置统一交给 TableSearchWrap 内置导出组件处理。
 * 导出参数默认沿用当前搜索条件和分页参数。
 */
const userListExportConfig = computed<TableExportConfig>(() => ({
    buttonKey: 'export',
    buttonText: t('导出'),
    fileName: `${t('用户列表')}.xlsx`,
    exportApi: (params: Record<string, unknown>) =>
        accountListApi.exportAccountList(params as Parameters<typeof accountListApi.exportAccountList>[0]),
}))

const stateTextMap: Record<number, string> = {
    1: '正常',
    2: '冻结',
    3: '已注销',
}

/**
 * 证件类型字段在不同接口版本里可能是：
 * - documentType: 1/2 或 "1"/"2"
 * - documentTypeName / documentTypeListing: 已翻译字符串
 * - "1,2" 这种逗号分隔值
 *
 * 这里统一做兼容，避免 /user/userList 出现“证件状态/证件类型不显示”。
 */
const formatDocumentTypeText = (value: unknown): string | null => {
    if (value === null || value === '' || typeof value === 'undefined') {
        return null
    }

    if (Array.isArray(value)) {
        const textList = value
            .map((item) => formatDocumentTypeText(item))
            .filter((item): item is string => Boolean(item))
        return textList.length ? textList.join(' / ') : null
    }

    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed) return null

        if (trimmed.includes(',')) {
            const textList = trimmed
                .split(',')
                .map((item) => formatDocumentTypeText(item.trim()))
                .filter((item): item is string => Boolean(item))
            return textList.length ? textList.join(' / ') : null
        }

        if (!Number.isNaN(Number(trimmed))) {
            const mappedLabel = userIdTypeMap.get(Number(trimmed))?.label
            return mappedLabel ? t(mappedLabel) : trimmed
        }

        return trimmed
    }

    if (typeof value === 'number') {
        const mappedLabel = userIdTypeMap.get(value)?.label
        return mappedLabel ? t(mappedLabel) : String(value)
    }

    return String(value)
}

const formatDocumentType = (record: UserListRow): string => {
    const candidateValues = [
        record.documentTypeName,
        record.documentTypeListing,
        record.documentType,
        record.certificateType,
    ]

    for (const candidateValue of candidateValues) {
        const mappedText = formatDocumentTypeText(candidateValue)
        if (mappedText) return mappedText
    }

    return '--'
}

const stateColorClass = (state: number): string => {
    if (state === 1) return 'text-green-500'
    if (state === 2) return 'text-red-500'
    return 'text-gray-500'
}

/**
 * 统一封装敏感操作确认，避免同类弹窗分散在模板里难维护。
 */
const withConfirm = (
    content: string,
    onOk: () => Promise<unknown>,
): void => {
    Modal.confirm({
        title: t('确认'),
        content,
        okText: t('确认'),
        cancelText: t('取消'),
        hideCancel: false,
        draggable: false,
        simple: false,
        onOk,
    })
}

const handleToggleState = (record: UserListRow): void => {
    const nextState = record.state === 1 ? 2 : 1
    const actionText = nextState === 1 ? t('启用') : t('禁用')

    withConfirm(
        t('是否确认执行该操作？') + `（${actionText}）`,
        async () => {
            await accountListApi.updateAccountState({ id: String(record.id), state: nextState as 1 | 2 })
            Message.success(t('操作成功'))
            await tableWrapRef.value?.refresh()
        },
    )
}

const handleResetPassword = (record: UserListRow): void => {
    withConfirm(t('是否确认执行该操作？') + `（${t('重置登录密码')}）`, async () => {
        await accountListApi.resetAccountPassword({ id: String(record.id) })
        Message.success(t('操作成功'))
        await tableWrapRef.value?.refresh()
    })
}

const handleResetPayPassword = (record: UserListRow): void => {
    withConfirm(t('是否确认执行该操作？') + `（${t('重置资金密码')}）`, async () => {
        await accountListApi.resetAccountPayPassword({ id: String(record.id) })
        Message.success(t('操作成功'))
        await tableWrapRef.value?.refresh()
    })
}

/**
 * 统一拉取用户列表筛选下拉：
 * - 标签：复用标签模块接口
 * - 国家：复用认证模块国家配置
 */
const querySearchOptions = async (): Promise<void> => {
    const [tagList, countryList] = await Promise.all([
        tagApi.getTagList(),
        accountAuthApi.getUapyCountryList(),
    ])

    tagOptions.value = [
        { label: t('全部'), value: '' },
        ...tagList.map((item) => ({
            label: item.name,
            value: item.id,
        })),
    ]

    countryOptions.value = [
        { label: t('全部'), value: '' },
        ...countryList.map((item) => ({
            label: String(item.nameZh ?? item.alpha3 ?? '--'),
            value: String(item.alpha3 ?? ''),
        })),
    ]
}

watch(
    () => routeUid.value,
    (nextUid, prevUid) => {
        if (nextUid === prevUid || !tableWrapRef.value) {
            return
        }

        tableWrapRef.value
            .search({
                ...tableWrapRef.value.getSearchParams(),
                accountId: nextUid || null,
            })
            .then()
    },
)

onMounted(() => {
    querySearchOptions().catch(() => {
        Message.error(t('加载失败，请稍后重试'))
    })
})
</script>

<template>
    <TableSearchWrap
        ref="tableWrapRef"
        :api-fetch="fetchUserList"
        :table-columns="tableColumns"
        :search-conf="searchConf"
        :default-params="defaultParams"
        :export-config="userListExportConfig"
        :scroll="{ x: 3300, y: 700 }"
        row-key="id"
    >
        <template #labelList="{ record }">
            <LabelTagList :label-list="record.labelList" :label-names="record.labelNames" />
        </template>

        <template #authState="{ record }">
            <UserAuthCell :status="record.authStateName || record.authState || ''" />
        </template>

        <template #advancedAuthState="{ record }">
            <UserAuthCell :status="record.advancedAuthStateName || record.advancedAuthState || ''" />
        </template>

        <template #documentType="{ record }">
            {{ formatDocumentType(record as UserListRow) }}
        </template>

        <template #state="{ record }">
            <span :class="stateColorClass(Number(record.state))">
                {{ t(stateTextMap[Number(record.state)] || '--') }}
            </span>
        </template>

        <template #action="{ record }">
            <div class="flex flex-wrap items-center gap-3">
                <PermissionButton
                    button-key="disable"
                    :status="record.state === 1 ? 'danger' : 'normal'"
                    @click="handleToggleState(record)"
                >
                    {{ record.state === 1 ? t('禁用') : t('启用') }}
                </PermissionButton>
                <PermissionButton button-key="reset" @click="handleResetPassword(record)">
                    {{ t('重置登录密码') }}
                </PermissionButton>
                <PermissionButton button-key="resetFund" @click="handleResetPayPassword(record)">
                    {{ t('重置资金密码') }}
                </PermissionButton>
            </div>
        </template>
    </TableSearchWrap>
</template>
