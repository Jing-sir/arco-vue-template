<script setup lang="ts">
import { IconComputer, IconMenuFold, IconMenuUnfold, IconMoonFill, IconSunFill } from '@arco-design/web-vue/es/icon'
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
const themeStore = theme()
const userStore = user()
const { push } = useRouter()
const storeTagsView = tagsView()
const { isSidebar } = storeToRefs(store)
const { themeMode, resolvedThemeMode } = storeToRefs(themeStore)

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

const userDisplayName = computed(() => userStore.userInfo?.fullName || '')
const userInitial = computed(() => userDisplayName.value.slice(0, 1).toUpperCase() || 'A')
/**
 * 在线状态在页面标题区和用户区都可能复用，集中到 computed 可以避免模板里重复分支。
 */
const onlineStatusClassName = computed(() =>
    props.isOnline ? 'text-[var(--color-primary-6)]' : 'text-[var(--app-status-offline)]',
)
const onlineStatusLabel = computed(() => (props.isOnline ? t('在线') : t('离线')))

/**
 * 主题模式按钮直接复用中文 i18n key。
 * 这样按钮文案和下拉项都能跟随当前语言切换。
 */
const currentThemeModeLabel = computed(() => {
    if (themeMode.value === 'system') return '跟随系统'
    return themeMode.value === 'dark' ? '深色' : '浅色'
})

/**
 * 跟随系统模式需要展示“用户当前选择的是 system”，但图标要反映真正生效的明暗结果。
 * 这样既能表达偏好来源，也能让按钮图标保持直观。
 */
const currentThemeModeIcon = computed(() => {
    if (themeMode.value === 'system') return IconComputer
    return resolvedThemeMode.value === 'dark' ? IconMoonFill : IconSunFill
})

const onUpdateThemeMode = (mode: 'light' | 'dark' | 'system'): void => {
    themeStore.updateThemeMode(mode)
}

onMounted(() => {
    userStore.getUserInfo()
})
</script>

<template>
    <div class="mt-2 rounded-xl border border-[var(--app-divider)] bg-[var(--app-surface-strong)] px-0.5 py-2">
        <BindGoogle ref="googleRef" />

        <div class="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div class="flex min-w-0 items-start gap-3">
                <button
                    type="button"
                    class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--app-control-bg)] text-[var(--app-control-text)] transition-colors hover:bg-[var(--app-control-hover-bg)] hover:text-[var(--app-text)]"
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
                                class="cursor-text text-[11px] leading-none text-[var(--app-control-text-muted)]"
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

                    <div class="flex items-center">
                        <h1
                            class="m-0 text-[25px] font-semibold leading-[1.1] tracking-[-0.03em] text-[var(--app-text)]"
                        >
                            {{ currentPageTitle }}
                        </h1>
                    </div>
                </div>
            </div>

            <div class="flex items-center gap-2 lg:self-start">
                <a-dropdown trigger="click">
                    <button
                        type="button"
                        class="inline-flex min-h-9 items-center gap-2 rounded-lg bg-[var(--app-control-bg)] px-3 text-[var(--app-text)] transition-colors hover:bg-[var(--app-control-hover-bg)]"
                        :title="t('主题模式')"
                    >
                        <component :is="currentThemeModeIcon" :style="{ fontSize: '15px' }" />
                        <span class="hidden text-xs font-medium sm:inline">
                            {{ t(currentThemeModeLabel) }}
                        </span>
                    </button>
                    <template #content>
                        <a-menu :selected-keys="[themeMode]">
                            <a-menu-item key="light" @click="onUpdateThemeMode('light')">
                                <div class="flex items-center gap-2">
                                    <IconSunFill :style="{ fontSize: '15px' }" />
                                    <span>{{ t('浅色') }}</span>
                                </div>
                            </a-menu-item>
                            <a-menu-item key="dark" @click="onUpdateThemeMode('dark')">
                                <div class="flex items-center gap-2">
                                    <IconMoonFill :style="{ fontSize: '15px' }" />
                                    <span>{{ t('深色') }}</span>
                                </div>
                            </a-menu-item>
                            <a-menu-item key="system" @click="onUpdateThemeMode('system')">
                                <div class="flex items-center gap-2">
                                    <IconComputer :style="{ fontSize: '15px' }" />
                                    <span>{{ t('跟随系统') }}</span>
                                </div>
                            </a-menu-item>
                        </a-menu>
                    </template>
                </a-dropdown>

                <div
                    class="inline-flex min-h-9 items-center justify-center rounded-lg bg-[var(--app-control-bg)] px-2"
                    :title="t('主题色')"
                >
                    <ColorPicker />
                </div>

                <a-dropdown trigger="hover">
                    <div
                        class="flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--app-control-bg)] px-[10px] py-1 pl-1 transition-colors hover:bg-[var(--app-control-hover-bg)]"
                    >
                        <div
                            class="inline-flex h-[30px] w-[30px] items-center justify-center rounded-[7px] bg-[var(--color-primary-6)] text-xs font-bold text-white"
                        >
                            {{ userInitial }}
                        </div>
                        <div class="flex min-w-0 flex-col gap-0.5">
                            <p
                                class="m-0 max-w-[180px] overflow-hidden text-xs font-semibold text-[var(--app-text)] text-ellipsis whitespace-nowrap"
                            >
                                {{ userDisplayName || '--' }}
                            </p>
                            <span
                                class="inline-flex items-center gap-1 text-[10px] font-medium leading-none tracking-[0.02em]"
                                :class="onlineStatusClassName"
                            >
                                <span class="h-1.5 w-1.5 rounded-full bg-current" />
                                {{ onlineStatusLabel }}
                            </span>
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
