<script setup lang="ts">
import { RouteRecordRaw } from 'vue-router';

const isOnline = ref<boolean>(true);

const hasRoute = useRoute();
const routes = ref<RouteRecordRaw[]>([]);

const store = sideBar();
const { push } = useRouter();
const { isSidebar } = storeToRefs(store);

// 是否是首页
const isHome = (route: RouteRecordRaw) => {
    const name = route && route.name;
    if (!name) return false;
    return String(name).trim().toLocaleLowerCase() === 'main'.toLocaleLowerCase();
};

// 获取routes
const fetchBreadcrumb = () => {
    // store.fetchSidebarRoutes();
    let hasMatched: RouteRecordRaw[] = hasRoute.matched.filter((item: RouteRecordRaw) => item.meta && item.meta.title);
    const hasRouteList: RouteRecordRaw[] = [{ path: '/', meta: { title: '首页' }, redirect: '/Home' }];

    if (!isHome(hasMatched[0])) {
        hasMatched = hasRouteList.concat(hasMatched);
    }
    routes.value = hasMatched.filter((item: RouteRecordRaw) => item.meta && item.meta.title);
};

const storeTagsView = tagsView();
const { visitedViews } = storeToRefs(storeTagsView);
const keepAlive = computed(() => visitedViews.value.map((item) => item.name));

const onCollapse = (val: boolean) => {
    isSidebar.value = val;
};

const fetchHeaderWidth = computed<string>(() => (isSidebar.value ? 'calc(100% - 80px)' : 'calc(100% - 235px)'));

const nameComponent = computed(() => {
    return (Component: { type: { name: string } }, name: string) => {
        Component.type.name = name;
        return Component;
    };
});

const handleLink = (item: RouteRecordRaw) => {
    // 跳转路由
    const { redirect, path } = item;
    if (redirect) {
        const routePath = redirect === '/Home' ? '/' : redirect;
        push(String(routePath));
        return;
    }
    push(path);
};

watch(
    () => window.navigator.onLine,
    (o: boolean) => {
        isOnline.value = o;
    },
    { deep: true, immediate: true }
);

watch(
    () => hasRoute.path,
    () => {
        if (hasRoute.path.startsWith('/redirect/')) return;
        fetchBreadcrumb();
    }
);

onBeforeMount(fetchBreadcrumb);
</script>

<template>
    <a-layout>
        <a-layout-sider
            theme="dark"
            breakpoint="lg"
            collapsible
            :width="235"
            :collapsed="isSidebar"
            :style="{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, zIndex: 3 }"
            @collapse="onCollapse"
        >
            <SideNavigationBar/>
        </a-layout-sider>
        <a-layout :style="{ marginLeft: isSidebar ? '50px' : '235px', mineHeight: '100vh' }">
            <a-layout-header
                :style="{ background: '#f5f6f8', padding: 0, position: 'fixed', height: '61px', zIndex: 100, width: fetchHeaderWidth }">
                <Header/>
            </a-layout-header>
            <a-layout-content :style="{ overflowY: 'auto', marginTop: '56px', mineWidth: '1200px' }">
                <div :style="{ background: '#f5f6f8', minHeight: '730px' }">
                    <template v-if="isOnline">
                        <router-view v-slot="{ Component, route }">
                            <transition name="fade-transform" mode="out-in">
                                <keep-alive :include="[...keepAlive, 'AllFees', 'TotalFees']">
                                    <component :is="Component" :key="route.path" />
                                </keep-alive>
                            </transition>
                        </router-view>
                    </template>
                    <div v-else class="flex-direction-column flex-align-items-center table-container">
                        <p class="network-text">网络异常</p>
                        <p class="text-size-14">请检查网络状态后刷新重试</p>
                    </div>
                </div>
            </a-layout-content>
        </a-layout>
    </a-layout>
    <!--  <LockScreenDialog />-->
</template>

<style lang="scss" scoped>
.main {
    &::after {
        content: '';
        display: table;
        clear: both;
    }

    position: relative;
    height: 100%;
    width: 100%;
}

.content {
    min-height: 100%;
    transition: margin-left 0.28s;
    margin-left: 210px;
    position: relative;
    background: #f0f2f5;

    &.close-sidebar {
        margin-left: 80px;
    }
}

.breadcrumb-wrapper {
    margin: 65px 30px 0;
    padding: 10px 20px;
    background: #fff;
}

.content-wrapper {
    min-height: calc(100vh - 64px);
    width: 100%;
    position: relative;
    overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.35s ease;
}

.fade-enter-from,
.fade-leave-active {
    opacity: 0%;
}

.site-layout .site-layout-background {
    background: #fff;
}

[data-theme='dark'] .site-layout .site-layout-background {
    background: #141414;
}

.network-img {
    width: 488px;
    height: 288px;
    margin-top: 100px;
}

.network-text {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 14px;
}
</style>
