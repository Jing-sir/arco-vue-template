import type { RouteRecordRaw } from 'vue-router';

// 需要权限路由
const constantRoutes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'main',
        component: () => import(/* webpackChunkName: "main" */ '../Main.vue'),
        meta: { requiresAuth: false, role: 'Home', title: '首页', hidden: true, icon: 'icon-zhuye' },
        children: [{
            path: '',
            name: 'Home',
            component: () => import(/* webpackChunkName: "Home" */ '@/views/Home/Index.vue'),
            meta: { title: '首页', role: 'Home', isShow: true, requiresAuth: true }
        }]
    }
];

export default constantRoutes;
