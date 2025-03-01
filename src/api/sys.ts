import { AxiosInstance } from 'axios';
import { Api } from './api';

class FetchTest extends Api {
    loginInfo(): Promise<{
        account: string; // 账号
        bindAccount: string; // 绑定账号
        fullName: string; // 姓名
        isFACode: 0 | 1; // 是否有2fa,0没有 ,1有
        roleId: string; // 角色ID
        roleName: string; // 角色名称
        state: 1 | 2; // 状态 1、启用 2、禁用
        userId: string; // 用户ID
    }> {
        return this.api.get('/sys/user/getInfo');
    }

    // 登陆
    sysUserLogin(params: { account: string; password: string; facode: string }): Promise<{
        initLogin: boolean; // 是否首次登陆 首次需要强制重新设置登陆密码
        opPassword: boolean; // 是否设置了操作密码 true false
        opPasswordSetting: boolean; // 是否有设置操作密码权限 true false
        passwordError: boolean; // 是否密码错误
        passwordErrorNum: number; // 密码错误次数 及提示消息
        token: string; // token
    }> {
        return this.api.post('/sys/login', params);
    }

    // 密钥
    pwdIv(): Promise<string> {
        return this.api.get('/sysConfig/pwdIv');
    }

    permissionList(): Promise<{
        id: string; // 权限ID	string
        name: string; // 名称
        type: string; // 类型:1=页面，2=按钮	string
        path: string; // 路径
        title: string; // 标题
        route: string; // 路由
        parentId: string; // 父ID
        checked: number; // 是否选中:1=是,2=否
    }[]> { // 权限列表
        return this.api.get('/list');
    }

    check(params: { roleId: string }): Promise<{ // 编辑获取角色权限
        id: string,
        name: string,
        type: string,
        path: string,
        title: string,
        route: string,
        parentId: string,
        checked: number
    }[]> {
        return this.api.get('/check', { params });
    }

    // 权限菜单
    menuList(): Promise<{
        id: string; // 权限ID
        name: string; // 名称
        type: string | number; // 类型:1=页面，2=按钮
        path: string; // 路径
        title: string; // 标题
        route: string; // 路由
        parentId: string; // 父ID
    }[]> {
        return this.api.get('/sys/menu/list');
    }

    // 推出登录
    loginOut(): Promise<boolean> {
        return this.api.get('/sys/user/loginOut');
    }

    // 绑定2FA,校验密码
    checkCipher(params: {
        password: string; // 操作密码
        userId: string; // 用户ID
        facode?: string;
        type?: 1 | 2 | 3; // 1、重置登陆密码 2、重置审核密码 3、重置锁屏密码
    }): Promise<boolean> {
        return this.api.post('/sys/user/checkCipher', params);
    }
}
export default new FetchTest();
