<script setup lang="ts">
import SideNavigationBar from '@/components/SideNavigationBar/index.vue'

const { t } = useI18n()

const isOnline = ref<boolean>(window.navigator.onLine)

const hasRoute = useRoute()

const store = sideBar()
const { isSidebar } = storeToRefs(store)

const storeTagsView = tagsView()
const { visitedViews } = storeToRefs(storeTagsView)

const keepAlive = computed(() =>
    visitedViews.value
        .map((item: { name?: string | null }) => item.name)
        .filter((item: string | null | undefined): item is string => Boolean(item)),
)

const mainLayoutClass = computed(() => [
    'min-h-screen bg-[#f5f6f8] transition-[margin-left] duration-300',
    isSidebar.value ? 'ml-[50px]' : 'ml-[235px]',
])

const headerClass = computed(() => [
    'fixed z-[100] h-[61px] bg-[#f5f6f8] !p-0',
    isSidebar.value ? 'w-[calc(100%-80px)]' : 'w-[calc(100%-235px)]',
])

const contentClass = computed(() => ['', ''])

const onCollapse = (val: boolean) => {
    isSidebar.value = val
}

const syncOnlineStatus = (): void => {
    isOnline.value = window.navigator.onLine
}

const fetchLayoutRoutes = (): void => {
    store.fetchSidebarRoutes()
}

watch(
    () => hasRoute.path,
    () => {
        if (hasRoute.path.startsWith('/redirect/')) return
        fetchLayoutRoutes()
    },
    { immediate: true },
)

onMounted(() => {
    syncOnlineStatus()
    window.addEventListener('online', syncOnlineStatus)
    window.addEventListener('offline', syncOnlineStatus)
})

onBeforeUnmount(() => {
    window.removeEventListener('online', syncOnlineStatus)
    window.removeEventListener('offline', syncOnlineStatus)
})
</script>

<template>
    <a-layout>
        <a-layout-sider
            theme="dark"
            breakpoint="lg"
            collapsible
            :width="235"
            :collapsed="isSidebar"
            class="fixed left-0 z-[3] min-h-screen overflow-auto"
            @collapse="onCollapse"
        >
            <SideNavigationBar />
        </a-layout-sider>
        <a-layout :class="mainLayoutClass">
            <a-layout-header :class="headerClass">
                <Header />
            </a-layout-header>
            <a-layout-content class="mt-16 overflow-y-auto">
                <div class="bg-[#f5f6f8]">
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
                    <div v-else class="flex flex-col items-center justify-center px-6 text-center">
                        <p class="mb-3.5 text-lg font-bold text-slate-700">
                            {{ t('网络异常') }}
                        </p>
                        <p class="text-sm text-slate-500">
                            {{ t('请检查网络状态后刷新重试') }}
                        </p>
                    </div>
                </div>
            </a-layout-content>
        </a-layout>
    </a-layout>
    <!--  <LockScreenDialog />-->
</template>
