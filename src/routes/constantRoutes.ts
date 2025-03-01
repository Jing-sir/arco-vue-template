import { RouteRecordRaw } from 'vue-router';

// 常规路由

const constantRoutes: RouteRecordRaw[] = [
    {
        path: '/login',
        name: 'login',
        component: () => import(/* webpackChunkName: "error" */ '@/views/Login/Index.vue'),
        meta: { title: '登录', role: 'login', isShow: true, requiresAuth: false }
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
