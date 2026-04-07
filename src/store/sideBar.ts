import permissionRoutes from '../routes/permissionRoutes';
import type { RouteRecordRaw } from 'vue-router';
import NProgress from 'nprogress';
import { Message } from '@arco-design/web-vue';
import api from '../api/sys';
import { formatText } from '@/utils/common';

type MenuItem = PromiseReturnType<typeof api.menuList>[number];

export default defineStore('sideBar', () => {
    const route = useRoute();
    const router = useRouter();

    const isSidebar = ref<boolean>(false); // 侧边栏开关状态
    const routes = ref<Array<RouteRecordRaw>>([]); // 路由权限列表
    const roleMenu = ref<MenuItem[]>([]);
    let fetchSidebarPromise: Promise<void> | null = null;

    const updateIsSidebar = (status: boolean): void => { // 更新isSidebar状态
        isSidebar.value = status;
    };

    const getAsyRouter = (
        routeList: RouteRecordRaw[],
        fetchRoleObj: Record<string, string>,
    ): RouteRecordRaw[] => routeList.filter((routeItem) => {
        const role = routeItem.meta?.role;
        const ignorePermission = Boolean(routeItem.meta?.ignorePermission);

        if (routeItem.children?.length) {
            routeItem.children = getAsyRouter(routeItem.children, fetchRoleObj);
        }

        // 允许 route.meta.ignorePermission 的路由跳过后端权限菜单校验；
        // 同时如果子路由中存在可访问节点，也保留父级菜单分组。
        const hasAccessibleChildren = Boolean(routeItem.children?.length);
        return Boolean(ignorePermission || (role && fetchRoleObj[role]) || hasAccessibleChildren);
    });

    // 遍历后台传来的路由字符串，转换为组件对象
    const filterAsyRouter = (roleList: MenuItem[]): RouteRecordRaw[] => {
        const fetchRoleObj = Object.fromEntries(
            roleList.map((item) => [item.component, item.component]),
        )
        return getAsyRouter(JSON.parse(JSON.stringify(permissionRoutes)), fetchRoleObj);
    };

    // 获取sidebar 列表路由
    const fetchSidebarRoutes = (): Promise<void> => {
        // 路由快速切换时可能触发并发拉取，这里统一复用同一请求，避免重复覆盖状态。
        if (fetchSidebarPromise) return fetchSidebarPromise;

        NProgress.start();
        fetchSidebarPromise = api.menuList()
            .then((r) => {
                const accessibleRoutes = filterAsyRouter(r);

                roleMenu.value = r;
                routes.value = accessibleRoutes;

                const fetchObj = Object.fromEntries(
                    r.map((item: MenuItem) => [item.component, item.component]),
                )

                if (route.meta.requiresAuth && !route.meta.ignorePermission && !fetchObj[String(route.meta.role)]) {
                    void router.push('/error/404')
                }
            })
            .catch((error: unknown) => {
                // http 拦截器有具体报错时会先展示，这里只对空错误做统一兜底提示，避免重复弹窗。
                if (!String(error ?? '').trim()) {
                    Message.error(formatText('权限菜单加载失败，请稍后重试'));
                }
            })
            .finally(() => {
                fetchSidebarPromise = null;
                NProgress.done();
            });

        return fetchSidebarPromise;
    };

    /* const onRefreshToken = (val: number): void => {
        const curTime = Number(sessionStorage.getItem('expireTime'));
        const expireTime = curTime - 10 * 60 * 1000;
        if (val >= expireTime) {
            userApi.refreshToken({ refreshToken: String(sessionStorage.getItem('refresh')) }).then((r) => {
                sessionStorage.setItem('expireTime', String(r.expireTime));
                sessionStorage.setItem('refresh', r.refreshToken);
                cookies('waasToken', r.accessToken);
            });
        }
    }; */

    return {
        routes,
        roleMenu,
        isSidebar,
        updateIsSidebar,
        fetchSidebarRoutes
    };
});
