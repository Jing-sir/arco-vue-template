<script setup lang="ts">
import { IconMenuFold, IconMenuUnfold } from '@arco-design/web-vue/es/icon'
import BindGoogle from '@/components/Modal/BindGoogle.vue'
import type { RouteRecordRaw } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import cookies from 'cookies-js'
import api from '@/api/sys'

type HeaderRouteRecord = RouteRecordRaw & {
    meta?: RouteRecordRaw['meta'] & {
        title?: string | (() => string)
    }
}

const props = withDefaults(
    defineProps<{
        isOnline?: boolean
    }>(),
    {
        isOnline: true,
    },
)

const { t } = useI18n()

const googleRef = ref<InstanceType<typeof BindGoogle> | null>(null)
const hasRoute = useRoute()

const store = sideBar()
const userStore = user()
const { push } = useRouter()
const storeTagsView = tagsView()
const { isSidebar } = storeToRefs(store)

const homeRoute: HeaderRouteRecord = {
    path: '/',
    meta: { title: '首页', role: '' },
    redirect: '/Home',
}

const pageTitleOverrides: Record<string, string> = {
    addAccount: '新增管理员',
    editAccount: '编辑管理员',
    addRolePermissions: '新增角色',
    editRolePermissions: '编辑角色权限',
    viewRolePermissions: '查看角色权限',
}

const pageSummaryMap: Record<string, string> = {
    Home: '汇总关键业务数据与筛选入口',
    operationLog: '查看系统访问行为与操作追踪记录',
    rolePermissions: '配置角色范围与系统功能访问边界',
    addRolePermissions: '新增角色并配置权限范围',
    editRolePermissions: '编辑角色权限范围与功能访问控制',
    viewRolePermissions: '查看角色权限分配详情',
    accountManage: '维护后台账号、状态与访问权限',
    addAccount: '新增后台账号并配置角色与状态',
    editAccount: '编辑后台账号信息与角色配置',
}

const onIsSidebar = (status: boolean) => {
    store.updateIsSidebar(!status)
}

const isHome = (route?: HeaderRouteRecord) => {
    const name = route?.name
    if (!name) return false
    return String(name).trim().toLocaleLowerCase() === 'main'
}

const onOpenGoogle = (): void => {
    googleRef.value?.onShowDialog(true)
}

const onOpenPass = (): void => {
    Message.info(t('请前往账号管理修改密码'))
}

const onLink = (item: HeaderRouteRecord) => {
    const { redirect, path } = item
    if (redirect) {
        const routePath = redirect === '/Home' ? '/' : redirect
        push(String(routePath))
        return
    }
    push(path)
}

const onLoginOut = (): void => {
    api.loginOut().then(() => {
        cookies.set('manageToken', '')
        storeTagsView.clearVisitedView()
        push('/login')
    })
}

const formatRouteTitle = (title?: string | (() => string)): string =>
    title ? t(String(typeof title === 'function' ? title() : title)) : ''

const breadcrumbRoutes = computed<HeaderRouteRecord[]>(() => {
    const matched = hasRoute.matched.filter((item) =>
        Boolean(item.meta?.title),
    ) as HeaderRouteRecord[]

    if (!matched.length) {
        return [homeRoute]
    }

    return isHome(matched[0]) ? matched : [homeRoute, ...matched]
})

const routeName = computed(() => String(hasRoute.name ?? ''))

const currentPageTitleKey = computed(
    () =>
        pageTitleOverrides[routeName.value] ||
        String(
            breadcrumbRoutes.value[breadcrumbRoutes.value.length - 1]?.meta?.title ||
                hasRoute.meta?.title ||
                '首页',
        ),
)

const currentPageTitle = computed(() => formatRouteTitle(currentPageTitleKey.value))

const currentPageSummary = computed(() =>
    t(pageSummaryMap[routeName.value] || '当前页面的业务视图与操作入口'),
)

const userDisplayName = computed(() => userStore.userInfo?.fullName || '')
const userInitial = computed(() => userDisplayName.value.slice(0, 1).toUpperCase() || 'A')

onMounted(() => {
    userStore.getUserInfo()
})
</script>

<template>
    <div class="px-0.5 py-2 bg-white rounded-xl mt-2">
        <BindGoogle ref="googleRef" />

        <div class="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div class="flex min-w-0 items-start gap-3">
                <button
                    type="button"
                    class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--app-surface-strong)] text-[#5f6876] transition-colors hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-text)]"
                    @click.stop="onIsSidebar(isSidebar)"
                >
                    <IconMenuFold v-if="isSidebar" :style="{ fontSize: '18px' }" />
                    <IconMenuUnfold v-else :style="{ fontSize: '18px' }" />
                </button>

                <div class="flex min-w-0 flex-1 flex-col gap-2">
                    <a-breadcrumb class="m-0">
                        <a-breadcrumb-item
                            v-for="(item, index) in breadcrumbRoutes"
                            :key="`${item.path}-${index}`"
                        >
                            <span
                                v-if="
                                    item.redirect === 'noRedirect' ||
                                    index === breadcrumbRoutes.length - 1
                                "
                                class="cursor-text text-[11px] leading-none text-[#98a2b3]"
                            >
                                {{ formatRouteTitle(item.meta?.title) }}
                            </span>
                            <a
                                v-else
                                class="text-[11px] leading-none text-[var(--app-text-muted)]"
                                @click.prevent="onLink(item)"
                            >
                                {{ formatRouteTitle(item.meta?.title) }}
                            </a>
                        </a-breadcrumb-item>
                    </a-breadcrumb>

                    <div class="flex flex-wrap items-center gap-2.5">
                        <h1
                            class="m-0 text-[25px] font-semibold leading-[1.1] tracking-[-0.03em] text-[var(--app-text)]"
                        >
                            {{ currentPageTitle }}
                        </h1>
                        <span
                            class="inline-flex items-center gap-1.5 text-[10px] font-medium tracking-[0.02em]"
                            :class="
                                props.isOnline ? 'text-[var(--color-primary-6)]' : 'text-[#8f5f5a]'
                            "
                        >
                            <span class="h-1.5 w-1.5 rounded-full bg-current" />
                            {{ props.isOnline ? t('在线') : t('离线') }}
                        </span>
                    </div>

                    <p
                        class="m-0 max-w-[620px] text-xs leading-[1.55] text-[var(--app-text-muted)]"
                    >
                        {{ currentPageSummary }}
                    </p>
                </div>
            </div>

            <div class="flex items-center gap-2 lg:self-start">
                <div
                    class="inline-flex min-h-9 items-center justify-center rounded-lg bg-[var(--app-surface-strong)] px-2"
                    :title="t('主题色')"
                >
                    <ColorPicker />
                </div>

                <a-dropdown trigger="hover">
                    <div
                        class="flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--app-surface-strong)] px-[10px] py-1 pl-1 transition-colors hover:bg-[var(--app-surface-muted)]"
                    >
                        <div
                            class="inline-flex h-[30px] w-[30px] items-center justify-center rounded-[7px] bg-[var(--color-primary-6)] text-xs font-bold text-white"
                        >
                            {{ userInitial }}
                        </div>
                        <div class="min-w-0">
                            <p
                                class="m-0 max-w-[180px] overflow-hidden text-xs font-semibold text-[var(--app-text)] text-ellipsis whitespace-nowrap"
                            >
                                {{ userDisplayName || '--' }}
                            </p>
                            <p
                                class="mt-0.5 mb-0 text-[11px] leading-none text-[var(--app-text-muted)]"
                            >
                                {{ t('系统账户') }}
                            </p>
                        </div>
                    </div>
                    <template #content>
                        <a-menu>
                            <a-menu-item key="google" @click="onOpenGoogle">{{
                                t('修改2FA')
                            }}</a-menu-item>
                            <a-menu-item key="password" @click="onOpenPass">{{
                                t('修改密码')
                            }}</a-menu-item>
                            <a-menu-item key="logout" @click="onLoginOut">{{
                                t('退出登录')
                            }}</a-menu-item>
                        </a-menu>
                    </template>
                </a-dropdown>
            </div>
        </div>
    </div>
</template>
