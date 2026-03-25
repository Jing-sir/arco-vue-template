import type { RouteRecordRaw } from 'vue-router';

// 需要权限路由
const constantRoutes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'main',
        component: () => import(/* webpackChunkName: "main" */ '../Main.vue'),
        meta: {
            requiresAuth: false,
            role: 'Home',
            title: '首页',
            hidden: true,
            icon: 'icon-zhuye',
        },
        children: [
            {
                path: '',
                name: 'Home',
                component: () => import(/* webpackChunkName: "Home" */ '@/views/Home/Index.vue'),
                // 首页仍然要求登录态，但不参与后端权限菜单校验。
                meta: { title: '首页', role: 'Home', isShow: true, requiresAuth: true, ignorePermission: true },
            },
        ],
    },
    {
        path: '/systemManage', // 系统管理
        name: 'systemManage',
        redirect: 'noRedirect', // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
        component: () => import(/* webpackChunkName: "systemManage" */ '@/Main.vue'),
        meta: { title: '系统管理', icon: 'systemManage', role: 'systemManage', requiresAuth: true },
        children: [
            {
                // 角色与权限
                path: 'operationLog',
                name: 'operationLog',
                component: () =>
                    import(/* webpackChunkName: "systemManage" */ '@/views/SystemManage/operation-log/Index.vue'),
                meta: { title: '操作日志', role: 'operationLog', icon: 'operationLog', requiresAuth: true },
            },
            {
                // 角色与权限
                path: 'rolePermissions',
                name: 'rolePermissions',
                component: () =>
                    import(/* webpackChunkName: "systemManage" */ '@/views/SystemManage/role-permissions/Index.vue'),
                meta: { title: '角色与权限', role: 'rolePermissions', icon: 'rolePermissions', requiresAuth: true },
            },
            {
                // 角色与权限
                path: 'addRolePermissions',
                name: 'addRolePermissions',
                component: () =>
                    import(/* webpackChunkName: "addRolePermissions" */ '@/views/SystemManage/role-permissions/form/Index.vue'),
                meta: { title: '新增', role: 'rolePermissions', isShow: true, requiresAuth: true },
            },
            {
                // 角色与权限-查看
                path: 'viewRolePermissions/:id/:see',
                name: 'viewRolePermissions',
                component: () =>
                    import(/* webpackChunkName: "viewRolePermissions" */ '@/views/SystemManage/role-permissions/form/Index.vue'),
                meta: { title: '查看', role: 'rolePermissions', isShow: true, requiresAuth: true },
            },
            {
                // 角色与权限-编辑
                path: 'editRolePermissions/:id',
                name: 'editRolePermissions',
                component: () =>
                    import(/* webpackChunkName: "editRolePermissions" */ '@/views/SystemManage/role-permissions/form/Index.vue'),
                meta: { title: '编辑', role: 'rolePermissions', isShow: true, requiresAuth: true },
            },
            {
                // 账号管理
                path: 'accountManage',
                name: 'accountManage',
                component: () =>
                    import(/* webpackChunkName: "addRolePermissions" */ '@/views/SystemManage/account-manage/Index.vue'),
                meta: { title: '账号管理', role: 'accountManage', icon: 'accountManage', requiresAuth: true },
            },
            {
                // 账号管理-新增
                path: 'addAccount',
                name: 'addAccount',
                component: () =>
                    import(/* webpackChunkName: "addAccount" */ '@/views/SystemManage/account-manage/form/Index.vue'),
                meta: { title: '新增', role: 'accountManage', requiresAuth: true, isShow: true },
            },
            {
                // 账号管理-编辑
                path: 'editAccount/:id',
                name: 'editAccount',
                component: () =>
                    import(/* webpackChunkName: "editAccount" */ '@/views/SystemManage/account-manage/form/Index.vue'),
                meta: { title: '编辑', role: 'accountManage', requiresAuth: true, isShow: true },
            },
        ],
    },
]

export default constantRoutes;
