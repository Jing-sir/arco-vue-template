<script setup lang="ts">
import sysAccountLogApi from '@/api/userApi/sys/accountLog'
import tagApi from '@/api/userApi/tag'
import TableSearchWrap from '@/components/TableSearchWrap/Index.vue'
import LabelTagList from '@/components/TableSearchWrap/components/LabelTagList.vue'
import PermissionButton from '@/components/TableSearchWrap/components/PermissionButton.vue'
import type { AccountLogParams } from '@/api/userApi/types.d'
import type { ColumnType, SearchOption, TableFetchResult, TableSearchWrapExpose } from '@/interface/TableType'
import { Message } from '@arco-design/web-vue'
import dayjs from 'dayjs'

const { t } = useI18n()

const tableWrapRef = ref<TableSearchWrapExpose | null>(null)
const exportLoading = ref(false)

/**
 * 标签筛选来自后端标签管理，保证登录日志和标签模块数据口径一致。
 */
const tagOptions = ref<Array<{ label: string; value: string }>>([
    { label: t('全部'), value: '' },
])

const platformOptions = [
    { label: t('全部'), value: '' },
    { label: t('安卓'), value: 1 },
    { label: t('iOS'), value: 2 },
    { label: t('Web'), value: 3 },
    { label: t('PC'), value: 4 },
    { label: t('H5'), value: 5 },
]

const platformTextMap: Record<string, string> = {
    '1': '安卓',
    '2': 'iOS',
    '3': 'Web',
    '4': 'PC',
    '5': 'H5',
}

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
        modelKey: 'operated',
        type: 'input',
        placeholder: t('请输入邮箱'),
        value: '',
    },
    {
        label: t('手机号'),
        modelKey: 'nationalNumber',
        type: 'input',
        placeholder: t('请输入手机号'),
        value: '',
    },
    {
        label: t('用户姓名(中文)'),
        modelKey: 'usernameCn',
        type: 'input',
        placeholder: t('请输入用户姓名'),
        value: '',
    },
    {
        label: t('用户姓名(英文)'),
        modelKey: 'usernameEn',
        type: 'input',
        placeholder: t('请输入用户姓名'),
        value: '',
    },
    {
        label: t('登录方式'),
        modelKey: 'platform',
        type: 'select',
        value: '',
        options: platformOptions,
    },
    {
        label: t('设备唯一ID'),
        modelKey: 'deviceId',
        type: 'input',
        placeholder: t('请输入设备唯一ID'),
        value: '',
    },
    {
        label: t('平台语言'),
        modelKey: 'platformLanguage',
        type: 'input',
        placeholder: t('请输入平台语言'),
        value: '',
    },
    {
        label: t('浏览器语言'),
        modelKey: 'browserLanguage',
        type: 'input',
        placeholder: t('请输入浏览器语言'),
        value: '',
    },
    {
        label: t('设备语言'),
        modelKey: 'deviceLanguage',
        type: 'input',
        placeholder: t('请输入设备语言'),
        value: '',
    },
    {
        label: t('MAC地址'),
        modelKey: 'macAddress',
        type: 'input',
        placeholder: t('请输入MAC地址'),
        value: '',
    },
    {
        label: t('IP地址'),
        modelKey: 'ipAddress',
        type: 'input',
        placeholder: t('请输入IP地址'),
        value: '',
    },
    {
        label: t('用户标签'),
        modelKey: 'labelId',
        type: 'select',
        value: '',
        options: tagOptions.value,
    },
    {
        label: t('登录时间'),
        modelKey: ['startTime', 'endTime'],
        type: 'date',
        timeFormat: 'YYYY-MM-DD HH:mm:ss',
    },
])

const tableColumns = computed<ColumnType[]>(() => [
    { title: t('用户UID'), dataIndex: 'accountId', width: 200, fixed: 'left' },
    { title: t('标签'), dataIndex: 'labelList', slotName: 'labelList', width: 220 },
    { title: t('邮箱'), dataIndex: 'operated', width: 220 },
    { title: t('用户姓名(中文)'), dataIndex: 'usernameCn', width: 140 },
    { title: t('用户姓名(英文)'), dataIndex: 'usernameEn', width: 160 },
    { title: t('登录方式'), dataIndex: 'platform', slotName: 'platform', width: 100 },
    { title: t('设备agent'), dataIndex: 'userAgent', width: 260 },
    { title: t('设备唯一ID'), dataIndex: 'deviceId', width: 220 },
    { title: t('区号'), dataIndex: 'callingCode', width: 100 },
    { title: t('手机号'), dataIndex: 'nationalNumber', width: 140 },
    { title: t('平台语言'), dataIndex: 'platformLanguage', width: 120 },
    { title: t('浏览器语言'), dataIndex: 'browserLanguage', width: 120 },
    { title: t('设备语言'), dataIndex: 'deviceLanguage', width: 120 },
    { title: t('MAC地址'), dataIndex: 'macAddress', width: 180 },
    { title: t('IP地址'), dataIndex: 'ipAddress', width: 180 },
    { title: t('时区'), dataIndex: 'timeZone', width: 120 },
    { title: t('登录时间'), dataIndex: 'createTime', width: 180 },
    { title: t('登录状态'), dataIndex: 'status', slotName: 'status', width: 120, fixed: 'right' },
])

/**
 * 将搜索参数补齐为接口完整结构，避免缺字段导致后端解析分支不一致。
 */
const normalizeLogParams = (
    params: Record<string, unknown> = {},
): AccountLogParams => ({
    accountId: String(params.accountId || ''),
    browserLanguage: String(params.browserLanguage || ''),
    deviceLanguage: String(params.deviceLanguage || ''),
    endTime: String(params.endTime || ''),
    hostName: String(params.hostName || ''),
    ipAddress: String(params.ipAddress || ''),
    macAddress: String(params.macAddress || ''),
    operated: String(params.operated || ''),
    pageNo: Number(params.pageNo || 1),
    pageSize: Number(params.pageSize || 20),
    platform:
        params.platform === '' || params.platform === null || typeof params.platform === 'undefined'
            ? null
            : Number(params.platform),
    platformLanguage: String(params.platformLanguage || ''),
    startTime: String(params.startTime || ''),
    usernameCn: String(params.usernameCn || ''),
    usernameEn: String(params.usernameEn || ''),
    nationalNumber: String(params.nationalNumber || ''),
    deviceId: String(params.deviceId || ''),
    labelId: String(params.labelId || ''),
})

const fetchAccountLogList = async (
    params: Record<string, unknown> = {},
): Promise<TableFetchResult<Record<string, unknown>>> => {
    const normalizedParams = normalizeLogParams(params)
    const response = await sysAccountLogApi.getAccountLogList(normalizedParams)

    return {
        list: response.list as unknown as Record<string, unknown>[],
        pageNo: Number((response as unknown as Record<string, unknown>).pageNo ?? normalizedParams.pageNo),
        pageSize: Number((response as unknown as Record<string, unknown>).pageSize ?? normalizedParams.pageSize),
        totalSize: Number(response.totalSize ?? 0),
    }
}

const downloadBlob = (blob: Blob, fileName: string): void => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

/**
 * 导出要求必须带登录时间范围，且跨度不超过 365 天，避免大数据量阻塞。
 */
const handleExport = async (): Promise<void> => {
    const searchParams = tableWrapRef.value?.getSearchParams() || {}

    if (!searchParams.startTime || !searchParams.endTime) {
        Message.warning(t('登录开始时间不能为空'))
        return
    }

    const start = dayjs(String(searchParams.startTime))
    const end = dayjs(String(searchParams.endTime))

    if (end.diff(start, 'day') > 365) {
        Message.warning(t('请选择365天以内的时间'))
        return
    }

    exportLoading.value = true
    try {
        const normalizedParams = normalizeLogParams(searchParams)
        const blob = await sysAccountLogApi.exportAccountLog({
            ...normalizedParams,
            platform: normalizedParams.platform ?? undefined,
            pageNo: 1,
            pageSize: 2000,
        })

        downloadBlob(blob, `${t('用户登录日志')}-${dayjs().format('YYYYMMDDHHmmss')}.xlsx`)
        Message.success(t('导出成功'))
    } finally {
        exportLoading.value = false
    }
}

const queryTags = async (): Promise<void> => {
    const tagList = await tagApi.getTagList()
    tagOptions.value = [
        { label: t('全部'), value: '' },
        ...tagList.map((item) => ({ label: item.name, value: item.id })),
    ]
}

onMounted(() => {
    queryTags().catch(() => {
        Message.error(t('加载失败，请稍后重试'))
    })
})
</script>

<template>
    <TableSearchWrap
        ref="tableWrapRef"
        :api-fetch="fetchAccountLogList"
        :table-columns="tableColumns"
        :search-conf="searchConf"
        :enable-column-sort="false"
        :scroll="{ x: 3200, y: 700 }"
        row-key="id"
    >
        <template #actionsWrap>
            <PermissionButton button-key="export" :loading="exportLoading" @click="handleExport">
                {{ t('导出') }}
            </PermissionButton>
        </template>

        <template #labelList="{ record }">
            <LabelTagList :label-list="record.labelList" :label-names="record.labelNames" />
        </template>

        <template #platform="{ record }">
            {{ t(platformTextMap[String(record.platform)] || '未知') }}
        </template>

        <template #status>
            <span class="text-green-500">{{ t('登录成功') }}</span>
        </template>
    </TableSearchWrap>
</template>
