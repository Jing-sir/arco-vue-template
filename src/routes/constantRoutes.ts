import { RouteRecordRaw } from 'vue-router';

// 常规路由

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
            meta: { title: '首页', role: 'Home', isShow: true, requiresAuth: false }
        }]
    }, {
        path: '/error',
        name: 'error-main',
        component: () => import(/* webpackChunkName: "main" */ '../Main.vue'),
        meta: { title: 'error', role: 'error', icon: '', isShow: true, requiresAuth: false },
        children: [{
            path: '',
            name: 'error',
            component: () => import(/* webpackChunkName: "error" */ '../components/Error.vue'),
            meta: { title: '404', role: '404', isShow: true, requiresAuth: false }
        }, {
            path: '404',
            name: 'notRole',
            component: () => import(/* webpackChunkName: "error" */ '../components/NotRolePurview.vue'),
            meta: { title: '404', role: '404', isShow: true, requiresAuth: false }
        }]
    }
];

export default constantRoutes;
