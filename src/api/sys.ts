import { Api } from './api';

/**
 * sys.ts — /sys/* 前缀的后台系统接口模块。
 *
 * 包含：登录、当前用户信息、密码管理、角色管理、菜单权限、操作日志、2FA 校验。
 *
 * 原 fetchTest/index.ts 中的 /sys/* 接口已迁移至此，fetchTest 仅保留无法归类的业务接口。
 */
class SysApi extends Api {
    // ── 认证 / 登录 ──────────────────────────────────────────

    /** 登录 */
    sysUserLogin(params: { account: string; password: string; facode: string }): Promise<{
        initLogin: boolean       // 是否首次登录，首次需要强制重新设置密码
        opPassword: boolean      // 是否设置了操作密码
        opPasswordSetting: boolean // 是否有设置操作密码权限
        passwordError: boolean   // 是否密码错误
        passwordErrorNum: number // 密码错误次数
        token: string
        googleState: number      // 谷歌验证码状态：0 未开启，1 已开启
    }> {
        return this.api.post('/sys/login', params)
    }

    /** 退出登录 */
    loginOut(): Promise<boolean> {
        return this.api.get('/sys/user/loginOut')
    }

    // ── 当前用户 ─────────────────────────────────────────────

    /** 获取当前登录用户信息（用于 Header 展示和权限初始化） */
    loginInfo(): Promise<{
        account: string       // 账号
        bindAccount: string   // 绑定账号
        fullName: string      // 姓名
        isFACode: 0 | 1       // 是否开启 2FA：0 没有，1 有
        roleId: string        // 角色ID
        roleName: string      // 角色名称
        state: 1 | 2          // 状态：1 启用，2 禁用
        userId: string        // 用户ID
    }> {
        return this.api.get('/sys/user/getInfo')
    }

    /** 密钥（密码加密 IV）*/
    pwdIv(): Promise<string> {
        return this.api.get('/sysConfig/pwdIv')
    }

    // ── 密码管理 ─────────────────────────────────────────────

    /** 修改登录密码 */
    sysUserUpdatePassword(params: {
        password?: string
        type: 1 | 2 | 3  // 1 重置登录密码，2 重置审核密码，3 重置锁屏密码
        oldPassword: string
        facode: string
    }): Promise<void> {
        return this.api.post('/sys/user/updatePassword', params)
    }

    /** 重置登录密码（管理员操作） */
    sysUserResetPassword(params: {
        password?: string
        type: 1 | 2 | 3  // 1 重置登录密码，2 重置审核密码，3 重置锁屏密码
        userId: string
        facode: string
    }): Promise<void> {
        return this.api.post('/sys/user/resetPassword', params)
    }

    /** 重置秘钥（2FA 绑定设备重置） */
    setSysUserResetSecret(params: {
        code?: string
        password: string
        userId: string
        facode: string
    }): Promise<{ opPassword: boolean; opPasswordSetting: boolean }> {
        return this.api.post('/sys/user/resetSecret', params)
    }

    /** 首次登录设置新密码 */
    setLoginPass(params: {
        code?: string
        password: string
    }): Promise<{ opPassword: boolean; opPasswordSetting: boolean }> {
        return this.api.post('/sys/setLoginPassword', params)
    }

    /** 获取设置密码验证码 */
    getSetLoginPwdMsgCode(): Promise<void> {
        return this.api.get('/sysUser/getSetLoginPwdMsgCode')
    }

    // ── 管理员账号 ────────────────────────────────────────────

    /** 管理员列表 */
    sysUserList(params: {
        pageNo: number
        pageSize: number
        account: string
        realName: string
    }): Promise<{
        list: SystemUserRow[]
        pageNo: number
        pageSize: number
        totalPages: number
        totalSize: number
    }> {
        return this.api.get('/sys/user/list', { params })
    }

    /** 新增/编辑管理员 */
    sysUserAddOrUpdate(params: {
        account?: string
        id?: string
        fullName?: string
        roleId?: string
        state?: number  // 1 启用，2 禁用
    }): Promise<void> {
        return this.api.post('/sys/user/addOrUpdate', params)
    }

    /** 查看管理员详情 */
    sysUserInfo(params: { userId: string | undefined }): Promise<{
        account: string
        createTime: string
        fullName: string
        id: string
        newsletter: string
        remark: string
        roleId: string
        roleName: string
        state: number  // 1 启用，2 禁用，3 密码错误冻结
        updateTime: string
    }> {
        return this.api.get('/sys/user/getUserInfo', { params })
    }

    // ── 角色管理 ─────────────────────────────────────────────

    /** 角色列表（下拉选项用） */
    sysRoleList(): Promise<SystemRoleItem[]> {
        return this.api.get('/sys/role/list')
    }

    /** 新增/编辑角色及权限 */
    sysRoleAddUpdate(params: {
        checkOpPassword: boolean
        menuIdList: {
            checkUserPassword: number  // 1 免密，2 校验
            menuId: number
        }[]
        roleId?: string
        remark?: string
        state?: 1 | 2
        roleName: string
    }): Promise<void> {
        return this.api.post('/sys/role/addOrUpdate', params)
    }

    /** 获取角色信息 */
    sysRoleInfo(params: { roleId: string }): Promise<RolePermissionsType> {
        return this.api.get('/sys/role/getInfo', { params })
    }

    // ── 菜单/权限树 ───────────────────────────────────────────

    /** 获取完整权限菜单树（用于角色配置页左侧树） */
    sysRoleMenuList(): Promise<TreeDataType[]> {
        return this.api.get('/sys/menu/permissions/list')
    }

    /** 获取当前用户的菜单树（用于侧边栏渲染） */
    menuList(): Promise<{
        id: string
        name: string
        component: string
        type: string | number  // 1 页面，2 按钮
        path: string
        title: string
        route: string
        parentId: string
    }[]> {
        return this.api.get('/sys/menu/list')
    }

    /** 编辑角色时获取已勾选的权限菜单列表 */
    sysInfoCheckMenuList(params: { roleId: string }): Promise<TreeDataType[]> {
        return this.api.get('/sys/menu/permissions/check/list', { params })
    }

    // ── 操作日志 ─────────────────────────────────────────────

    /** 操作日志列表 */
    fetchOperationLogList(params: {
        pageNo: number
        pageSize: number
        opAccount: string
        reqFunc: string
        startTime?: string
        endTime?: string
    }): Promise<{
        list: OperationLogRow[]
        pageNo: number
        pageSize: number
        totalPages: number
        totalSize: number
    }> {
        return this.api.get('/sys/operationLog/list', { params })
    }

    // ── 2FA 校验 ─────────────────────────────────────────────

    /** 校验操作密码（绑定 2FA 前的验证） */
    checkCipher(params: {
        password: string
        userId: string
        facode?: string
        type?: 1 | 2 | 3
    }): Promise<boolean> {
        return this.api.post('/sys/user/checkCipher', params)
    }

    /** 校验 Google 验证码 */
    validateGoogle(params: { googleCode: string }): Promise<boolean> {
        return this.api.post('/sys/validateGoogle', params)
    }

    // ── 权限列表（旧接口，按需使用）─────────────────────────────

    /** 权限列表（旧接口，来自 api/sys.ts 原有实现，暂保留） */
    permissionList(): Promise<{
        id: string
        name: string
        type: string
        path: string
        title: string
        route: string
        parentId: string
        checked: number
    }[]> {
        return this.api.get('/list')
    }

    /** 编辑获取角色权限（旧接口，暂保留） */
    check(params: { roleId: string }): Promise<{
        id: string
        name: string
        type: string
        path: string
        title: string
        route: string
        parentId: string
        checked: number
    }[]> {
        return this.api.get('/check', { params })
    }
}

// ── 类型引用（与 SystemManageType 中的类型保持一致） ───────────────
import type {
    OperationLogRow,
    RolePermissionsType,
    SystemRoleItem,
    SystemUserRow,
    TreeDataType,
} from '@/interface/SystemManageType'

export default new SysApi()