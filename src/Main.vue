<script setup lang="ts">
import Header from '@/components/Header.vue'
import SideNavigationBar from '@/components/SideNavigationBar/index.vue'
import TagsView from '@/components/TagsView.vue'

const { t } = useI18n()

const isOnline = ref<boolean>(window.navigator.onLine)

const hasRoute = useRoute()
const shellTopRef = ref<HTMLElement | null>(null)
let shellTopResizeObserver: ResizeObserver | null = null

const store = sideBar()
const { isSidebar, roleMenu } = storeToRefs(store)

const storeTagsView = tagsView()
const { visitedViews } = storeToRefs(storeTagsView)

const keepAlive = computed(() =>
    visitedViews.value
        .map((item: { name?: string | null }) => item.name)
        .filter((item: string | null | undefined): item is string => Boolean(item)),
)

const onCollapse = (val: boolean) => {
    isSidebar.value = val
}

const syncOnlineStatus = (): void => {
    isOnline.value = window.navigator.onLine
}

const syncShellTopHeight = (): void => {
    const shellTopHeight = shellTopRef.value?.offsetHeight ?? 0
    document.documentElement.style.setProperty('--app-shell-top-height', `${shellTopHeight}px`)
}

const ensureLayoutRoutes = (): void => {
    if (hasRoute.path.startsWith('/redirect/')) return
    if (!roleMenu.value.length) {
        store.fetchSidebarRoutes()
    }
}

watch(
    () => hasRoute.path,
    () => {
        ensureLayoutRoutes()
    },
    { immediate: true },
)

onMounted(() => {
    syncOnlineStatus()
    nextTick(() => {
        syncShellTopHeight()
    })

    if (shellTopRef.value) {
        shellTopResizeObserver = new ResizeObserver(() => {
            syncShellTopHeight()
        })
        shellTopResizeObserver.observe(shellTopRef.value)
    }

    window.addEventListener('online', syncOnlineStatus)
    window.addEventListener('offline', syncOnlineStatus)
    window.addEventListener('resize', syncShellTopHeight)
})

onBeforeUnmount(() => {
    window.removeEventListener('online', syncOnlineStatus)
    window.removeEventListener('offline', syncOnlineStatus)
    window.removeEventListener('resize', syncShellTopHeight)
    shellTopResizeObserver?.disconnect()
    shellTopResizeObserver = null
})

watch(
    () => [hasRoute.fullPath, isSidebar.value],
    () => {
        nextTick(() => {
            syncShellTopHeight()
        })
    },
)
</script>

<template>
    <a-layout class="bg-transparent">
        <a-layout-sider
            theme="dark"
            breakpoint="lg"
            collapsible
            :width="260"
            :collapsed-width="88"
            :collapsed="isSidebar"
            class="app-shell-sider fixed inset-y-0 left-0 z-30 overflow-hidden"
            @collapse="onCollapse"
        >
            <SideNavigationBar />
        </a-layout-sider>
        <a-layout
            class="flex min-h-[100dvh] flex-col transition-[margin-left] duration-300"
            :class="isSidebar ? 'ml-[88px]' : 'ml-[260px]'"
        >
            <div
                ref="shellTopRef"
                class="sticky top-0 z-20 grid shrink-0 gap-2.5 px-[14px] pt-0 backdrop-blur-sm"
            >
                <Header :is-online="isOnline" />
                <TagsView />
            </div>
            <a-layout-content class="flex-1 bg-transparent px-[14px] pb-[18px]">
                <template v-if="isOnline">
                    <router-view v-slot="{ Component, route }">
                        <transition
                            mode="out-in"
                            enter-active-class="transform-gpu transition duration-300 ease-out"
                            enter-from-class="translate-y-2 opacity-0"
                            leave-active-class="transform-gpu transition duration-200 ease-in"
                            leave-to-class="-translate-y-2 opacity-0"
                        >
                            <keep-alive :include="[...keepAlive, 'AllFees', 'TotalFees']">
                                <component :is="Component" :key="route.path" />
                            </keep-alive>
                        </transition>
                    </router-view>
                </template>
                <div
                    v-else
                    class="flex min-h-[var(--content-pane-min-height)] flex-col items-center justify-center gap-2.5 rounded-[var(--app-pane-radius)] bg-[var(--app-surface)] text-center"
                >
                    <p class="text-xl font-bold text-[var(--app-text)]">
                        {{ t('网络异常') }}
                    </p>
                    <p class="text-sm text-[var(--app-text-muted)]">
                        {{ t('请检查网络状态后刷新重试') }}
                    </p>
                </div>
            </a-layout-content>
        </a-layout>
    </a-layout>
    <!--  <LockScreenDialog />-->
</template>

<style scoped lang="scss">
.app-shell-sider {
    :deep(.arco-layout-sider-trigger) {
        @apply border-0 text-white/80 transition-colors duration-200;
        height: 48px;
        background: linear-gradient(
            180deg,
            var(--app-sidebar-surface-strong) 0%,
            var(--app-sidebar-surface) 100%
        );
        backdrop-filter: blur(10px);
    }

    :deep(.arco-layout-sider-trigger:hover) {
        color: #fff;
        background: linear-gradient(
            180deg,
            color-mix(in srgb, var(--color-primary-6) 18%, rgb(255 255 255 / 6%) 82%) 0%,
            color-mix(in srgb, var(--color-primary-6) 12%, rgb(255 255 255 / 2%) 88%) 100%
        );
    }
}
</style>
