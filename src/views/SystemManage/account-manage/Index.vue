<script setup lang="ts">
import ResetPasswords from './modal/ResetPasswords.vue';
import TableSearchWrap from '@/components/TableSearchWrap/Index.vue';
import type {
    ColumnType,
    SearchOption,
    TableSearchWrapExpose,
} from '@/interface/TableType';
import { Message } from '@arco-design/web-vue';
import { IconPlus } from '@arco-design/web-vue/es/icon';
import api from '@/api/fetchTest/index';

const { t } = useI18n();
const router = useRouter();
const { isShowBtn: buttonPermissions } = useButtonRole();

const tableWrapRef = ref<TableSearchWrapExpose | null>(null);
const resetVisible = ref(false);
const resetType = ref<'loginPwd' | '2FA'>('loginPwd');
const resetUserId = ref('');

const searchConf = ref<SearchOption[]>([
    {
        label: '管理员账号',
        modelKey: 'account',
        placeholder: '请输入',
        type: 'input',
        value: '',
    },
    {
        label: '姓名',
        modelKey: 'realName',
        placeholder: '请输入',
        type: 'input',
        value: '',
    },
]);

const stateList = computed(() => [
    { label: t('启用'), color: 'text-emerald-500' },
    { label: t('禁用'), color: 'text-rose-500' },
    { label: t('冻结'), color: 'text-amber-500' },
]);

const tableColumns = computed<ColumnType[]>(() => [
    { title: t('序号'), slotName: 'index', width: 80 },
    { title: t('管理员账号'), dataIndex: 'account' },
    { title: t('姓名'), dataIndex: 'realName' },
    { title: t('角色'), dataIndex: 'roleName' },
    { title: t('账号状态'), dataIndex: 'state', slotName: 'state', width: 140 },
    { title: t('最后登陆时间'), dataIndex: 'lastLoginTime', width: 180 },
    {
        title: t('操作'),
        dataIndex: 'action',
        slotName: 'action',
        fixed: 'right',
        width: 280,
    },
]);

const fetchUserList = (params: Record<string, unknown> = {}) =>
    api.sysUserList(params as Parameters<typeof api.sysUserList>[0]);

const handleCloseDialog = (userId: string, type: 'loginPwd' | '2FA'): void => {
    resetVisible.value = true;
    resetUserId.value = userId;
    resetType.value = type;
};

const handleStatusChange = (state: number, id: string): void => {
    api.sysUserAddOrUpdate({ state, id }).then(() => {
        Message.success(t('操作成功'));
        tableWrapRef.value?.refresh();
    });
};

useOnActivated(() => {
    tableWrapRef.value?.refresh();
});
</script>

<template>
    <div>
        <TableSearchWrap
            ref="tableWrapRef"
            :api-fetch="fetchUserList"
            :table-columns="tableColumns"
            :search-conf="searchConf"
            row-key="userId"
            :scroll="{ x: 1100, y: 800 }"
        >
            <template #roleBtnWrap>
                <a-button
                    v-if="buttonPermissions('add')"
                    type="primary"
                    size="small"
                    @click.stop="router.push('/systemManage/addAccount')"
                >
                    <template #icon>
                        <icon-plus />
                    </template>
                    {{ t('新增管理员') }}
                </a-button>
            </template>

            <template #index="{ rowIndex, pagination }">
                {{ ((pagination?.current ?? 1) - 1) * (pagination?.pageSize ?? 20) + rowIndex + 1 }}
            </template>

            <template #state="{ record }">
                <a-switch
                    v-if="buttonPermissions('disable')"
                    :model-value="record.state"
                    :checked-value="1"
                    :unchecked-value="2"
                    :checked-text="t('启用')"
                    :unchecked-text="record.state === 3 ? t('冻结') : t('禁用')"
                    @change="(value) => handleStatusChange(Number(value), record.userId)"
                />
                <span v-else :class="stateList[record.state - 1]?.color ?? 'text-slate-400'">
                    {{ stateList[record.state - 1]?.label ?? '--' }}
                </span>
            </template>

            <template #action="{ record }">
                <div class="flex flex-wrap items-center gap-3">
                    <a-button
                        type="text"
                        size="small"
                        class="!px-0"
                        @click.stop="handleCloseDialog(record.userId, 'loginPwd')"
                    >
                        {{ t('重置登录密码') }}
                    </a-button>
                    <a-button
                        type="text"
                        size="small"
                        class="!px-0"
                        @click.stop="handleCloseDialog(record.userId, '2FA')"
                    >
                        {{ t('重置2FA') }}
                    </a-button>
                    <a-button
                        type="text"
                        size="small"
                        class="!px-0"
                        :disabled="record.state === 1"
                        @click.stop="router.push(`/systemManage/editAccount/${record.userId}`)"
                    >
                        {{ t('编辑') }}
                    </a-button>
                </div>
            </template>
        </TableSearchWrap>

        <ResetPasswords
            v-model:visible="resetVisible"
            :type="resetType"
            :user-id="resetUserId"
            @on-success="tableWrapRef?.refresh()"
        />
    </div>
</template>
