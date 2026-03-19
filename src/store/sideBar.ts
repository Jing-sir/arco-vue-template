import constantRoutes from '../routes/constantRoutes';
import asyncRoutes from '../routes/asyncRoutes';
import { RouteRecordRaw } from 'vue-router';
import NProgress from 'nprogress';
import api from '../api/sys';

type MenuItem = PromiseReturnType<typeof api.menuList>[number];

export default defineStore('sideBar', () => {
    const route = useRoute();
    const router = useRouter();

    const isSidebar = ref<boolean>(false); // 侧边栏开关状态
    const routes = ref<Array<RouteRecordRaw>>([]); // 路由权限列表
    const roleMenu = ref<MenuItem[]>([]);

    const updateIsSidebar = (status: boolean): void => { // 更新isSidebar状态
        isSidebar.value = status;
    };

    const getAsyRouter = (
        routeList: RouteRecordRaw[],
        fetchRoleObj: Record<string, string>,
    ): RouteRecordRaw[] => routeList.filter((routeItem) => {
        const role = routeItem.meta?.role;

        if (routeItem.children?.length) {
            routeItem.children = getAsyRouter(routeItem.children, fetchRoleObj);
        }

        return Boolean(role && fetchRoleObj[role]);
    });

    // 遍历后台传来的路由字符串，转换为组件对象
    const filterAsyRouter = (roleList: MenuItem[]): RouteRecordRaw[] => {
        const fetchRoleObj = Object.fromEntries(roleList.map((item) => [item.name, item.name]));
        return getAsyRouter(JSON.parse(JSON.stringify(asyncRoutes)), fetchRoleObj);
    };

    // 获取sidebar 列表路由
    const fetchSidebarRoutes = (): void => {
        NProgress.start();
        api.menuList().then((r) => {
            const accessibleRoutes = filterAsyRouter(r);

            roleMenu.value = r;
            routes.value = accessibleRoutes;

            const fetchObj = Object.fromEntries(
                r.map((item: MenuItem) => [item.name, item.name]),
            );

            if (route.meta.requiresAuth && route.meta.role && !fetchObj[String(route.meta.role)]) {
                router.push('/error/404');
            }
        }).finally(() => {
            NProgress.done();
        });
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
