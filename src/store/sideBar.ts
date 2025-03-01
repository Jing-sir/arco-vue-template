import constantRoutes from '../routes/constantRoutes';
import asyncRoutes from '../routes/asyncRoutes';
import { RouteRecordRaw } from 'vue-router';
import NProgress from 'nprogress';
import api from '../api/sys';

export default defineStore('sideBar', () => {
    const route = useRoute();
    const router = useRouter();

    const isSidebar = ref<boolean>(false); // 侧边栏开关状态
    const routes = ref<Array<RouteRecordRaw>>([]); // 路由权限列表
    const roleMenu = ref<PromiseReturnType<typeof api.menuList>>([]);

    const updateIsSidebar = (status: boolean): void => { // 更新isSidebar状态
        isSidebar.value = status;
    };

    const getAsyRouter = (routes: RouteRecordRaw[], fetchRoleObj:any) => routes.filter((route: any) => {
        const { children, meta: { role } } = route;
        if (children != null && children && children.length) {
            route.children = getAsyRouter(children, fetchRoleObj);
        }
        return fetchRoleObj[role];
    });

    // 遍历后台传来的路由字符串，转换为组件对象
    const filterAsyRouter = (roleList: PromiseReturnType<typeof api.menuList>) => {
        const fetchRoleObj = Object.fromEntries(roleList.map((item: any) => [item.name, item.name]));
        return getAsyRouter(JSON.parse(JSON.stringify(asyncRoutes)), fetchRoleObj);
    };

    // 获取sidebar 列表路由
    const fetchSidebarRoutes = () => {
        NProgress.start();
        api.menuList().then((r) => {
            roleMenu.value = [...filterAsyRouter(r)];
            const fetchObj = Object.fromEntries(r?.map((item: PromiseReturnType<typeof api.menuList>[0]) => [item.name, item.name]));
            if (route.meta.requiresAuth && !fetchObj[String(route.meta.role)]) router.push('/error/404');
        }).finally(() => {
            NProgress.done();
        });
        routes.value = [...constantRoutes, ...asyncRoutes];
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
