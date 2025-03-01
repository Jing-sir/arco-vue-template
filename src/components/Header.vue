<script setup lang="ts">
import { IconMenuFold, IconMenuUnfold } from '@arco-design/web-vue/es/icon';
import { RouteRecordRaw } from 'vue-router';
import cookies from 'cookies-js';

const googleRef = ref();
const resetPassRef = ref();
const hasRoute = useRoute();
const routes = ref<RouteRecordRaw[]>([]);

const store = sideBar();
const userStore = user();
const { push } = useRouter();
const storeTagsView = tagsView();
const { isSidebar } = storeToRefs(store);

const handleIsSidebar = (status: boolean) => { // 开关左侧列表
    store.updateIsSidebar(!status);
};

const isHome = (route: RouteRecordRaw) => { // 是否是首页
    const name = route && route.name;
    if (!name) return false;
    return String(name).trim().toLocaleLowerCase() === 'main'.toLocaleLowerCase();
};

const handleOpenGoogle = (): void => { // 打开google绑定二维码弹窗
    googleRef.value.handleShowDialog(true);
};

const handleOpenPass = (): void => { // 打开重置密码弹窗
    resetPassRef.value.handleShowDialog(true);
};

const fetchBreadcrumb = () => { // 获取routes
    let hasMatched: RouteRecordRaw[] = hasRoute.matched.filter((item: RouteRecordRaw) => item.meta && item.meta.title);
    const hasRouteList: RouteRecordRaw[] = [{ path: '/', meta: { title: '首页', role: '' }, redirect: '/Home' }];

    if (!isHome(hasMatched[0])) {
        hasMatched = hasRouteList.concat(hasMatched);
    }

    routes.value = hasMatched.filter((item: RouteRecordRaw) => item.meta && item.meta.title);
};

const handleLink = (item: RouteRecordRaw) => { // 跳转路由
    const { redirect, path } = item;
    if (redirect) {
        const routePath = redirect === '/Home' ? '/' : redirect;
        push(String(routePath));
        return;
    }
    push(path);
};

const handleLoginOut = (): void => { // 退出登录
    api.loginOut().then(() => {
        cookies.set('walletToken', '');
        storeTagsView.clearVisitedView();
        push('/login');
    });
};

// const fetchName = computed<string>(() => userStore.userInfo?.username);
// const fetchUserName = computed<string>(() => userStore.userInfo?.username?.substr(0, 1) || '');

watch(() => hasRoute.path, () => { // 监听路由变化
    if (hasRoute.path.startsWith('/redirect/')) return;
    fetchBreadcrumb();
});

onBeforeMount(() => {
    // fetchBreadcrumb();
    // userStore.fetchCurrUserInfo();
});
</script>

<template>
    <div class="flex justify-between items-center header">
        <div class="flex flex-row items-center">
            <div class="cursor-pointer" @click.stop="handleIsSidebar(isSidebar)">
                <icon-menu-fold v-if="isSidebar" :style="{ fontSize: 22 }" />
                <icon-menu-unfold v-else :style="{ fontSize: 22 }" />
            </div>
            <a-breadcrumb>
                <a-breadcrumb-item v-for="(item,index) in routes" :key="item.path">
                    <span v-if="item.redirect === 'noRedirect'|| index === routes.length - 1" class="no-redirect">{{ item.meta?.title }}</span>
                    <a v-else @click.prevent="handleLink(item)">{{ item.meta?.title }}</a>
                </a-breadcrumb-item>
            </a-breadcrumb>
        </div>
        <div class="flex flex-row items-center">
            <ColorPicker/>
            <a-dropdown>
                <div class="flex flex-row items-center cursor-pointer" @click.prevent>
                    <div class="user-header">{{ 11 }}</div>
                    <p class="user-text">{{ 22 }}</p>
                </div>
                <template #overlay>
                    <a-menu>
                        <a-menu-item key="0" @click="handleOpenGoogle">修改2FA</a-menu-item>
                        <a-menu-item key="0" @click="handleOpenPass">修改密码</a-menu-item>
                        <a-menu-item key="0" @click="handleLoginOut">退出登录</a-menu-item>
                    </a-menu>
                </template>
            </a-dropdown>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.header {
    height: 55px;
    overflow: hidden;
    position: relative;
    padding-left: 10px;
    background: #fff;
    box-shadow: 0 1px 4px rgb(0 21 41 / 8%);
}

.sidebar-btn-active {
    width: 32px;
    height: 32px;
    text-align: center;
    line-height: 32px;
    background: #e5e9f1;
    border-radius: 8px;
    cursor: pointer;
    margin-right: 10px;
}

.user-header {
    width: 32px;
    height: 32px;
    border-radius: 16px;
    margin-right: 8px;
    background: var(--primary-color);
    color: #fff;
    font-size: 15px;
    text-align: center;
    line-height: 32px;
}

.user-text {
    font-size: 14px;
    color: rgb(0 0 0 / 60%);
    margin-right: 30px;
}

.no-redirect {
    color: #97a8be;
    cursor: text;
}
</style>
