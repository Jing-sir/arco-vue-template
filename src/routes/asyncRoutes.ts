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
    {
        path: '/user', // 用户管理
        name: 'user',
        redirect: 'noRedirect',
        component: () => import(/* webpackChunkName: "user" */ '@/Main.vue'),
        meta: { title: '用户管理', icon: 'accountManage', role: 'user', requiresAuth: true },
        children: [
            {
                path: 'userList',
                name: 'userList',
                component: () => import(/* webpackChunkName: "userList" */ '@/views/User/UserList/Index.vue'),
                meta: { title: '用户管理', role: 'userList', requiresAuth: true },
            },
            {
                path: 'labelList',
                name: 'labelList',
                component: () => import(/* webpackChunkName: "labelList" */ '@/views/User/LabelList/Index.vue'),
                meta: { title: '标签管理', role: 'labelList', requiresAuth: true },
            },
            {
                path: 'kolList',
                name: 'kolList',
                component: () => import(/* webpackChunkName: "kolList" */ '@/views/User/KOLList/Index.vue'),
                meta: { title: 'KOL列表', role: 'kolList', requiresAuth: true },
            },
            {
                path: 'user-auth',
                name: 'userAuthentication',
                component: () =>
                    import(/* webpackChunkName: "userAuthentication" */ '@/views/User/UserAuthentication/Index.vue'),
                meta: { title: '用户信息认证', role: 'userAuthentication', requiresAuth: true },
            },
            {
                path: 'user-whitelist',
                name: 'userWhiteList',
                component: () => import(/* webpackChunkName: "userWhiteList" */ '@/views/User/UserWhiteList/Index.vue'),
                meta: { title: '用户认证等级白名单', role: 'userWhiteList', requiresAuth: true },
            },
            {
                path: 'cancellationApplication',
                name: 'cancellationApplication',
                component: () =>
                    import(/* webpackChunkName: "cancellationApplication" */ '@/views/User/CancellationApplication/Index.vue'),
                meta: { title: '注销申请', role: 'cancellationApplication', requiresAuth: true },
            },
            {
                path: 'user-auth/:id',
                name: 'UserAuthDetail',
                component: () =>
                    import(/* webpackChunkName: "userAuthenticationDetail" */ '@/views/User/UserAuthentication/AuditDetail/Index.vue'),
                meta: { title: '审核详情', role: 'userAuthenticationDetail', requiresAuth: true, isShow: true },
            },
            {
                path: 'userLoginLog',
                name: 'userLoginLog',
                component: () => import(/* webpackChunkName: "userLoginLog" */ '@/views/User/UserLoginLog/Index.vue'),
                meta: { title: '用户登录日志', role: 'userLoginLog', requiresAuth: true },
            },
        ],
    },
    {
        path: '/userAddress',
        name: 'userAddress',
        redirect: 'noRedirect',
        component: () => import(/* webpackChunkName: "userAddress" */ '@/Main.vue'),
        meta: { title: '地址管理', icon: 'accountManage', role: 'user', requiresAuth: true },
        children: [
            {
                path: 'addressList',
                name: 'addressList',
                component: () => import(/* webpackChunkName: "addressList" */ '@/views/AddressList/Index.vue'),
                meta: { title: '地址列表', role: 'addressList', requiresAuth: true },
            },
        ],
    },
]

export default constantRoutes;
