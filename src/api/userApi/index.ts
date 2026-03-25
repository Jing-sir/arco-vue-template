import { Api } from '../api';
import type { CancellationApplicationType, List, Pagination } from '../../interface/type';
import type {
    AccountParams,
    AccountList,
    AccountLogParams,
    AccountLogData,
    IUserAuthInfo,
    authenticationInfo,
} from '@/api/userApi/types.d';
import { subSumStatusMap, genderMap } from '@/api/userApi/userEnum';
import type { TableResultType } from '@/interface/TableType';

class User extends Api {
    fetchAccountList(params: Partial<AccountParams>) {
        // 代理商列表
        interface _Response extends Pagination {
            list: AccountList;
        }

        return this.api.post('/account/list', params).then((result: any) => result as _Response);
    }
    fetchKolInfluencerIsAgent(params: { accountId: string }) {
        return this.api.get('/kolInfluencer/isAgent', { params }).then((result: any) => result as any);
    }

    // 导出
    fetchAccountExcelWriter(params: AccountParams) {
        // 代理商列表
        return this.api.post('/account/accountExcelWriter', params, { responseType: 'blob' }).then((result: any) => result);
    }

    fetchAuthInfo(params: { id: string | undefined }) {
        // 认证详情
        interface _Response {
            authRemark: string; // 审核备注
            authState: 0 | 1 | 2 | 3; // 认证状态：0=未认证，1=认证中，2=成功，3=失败
            backUri: string; // 背面照
            birthDate: string; // 生日：1999-09-09
            certificateNo: string; // 证件号
            certificateType: 1 | 2; // 证件类型:1=身份证，2=护照
            frontUri: string; // 正面照
            gender: 1 | 2; // 性别:1=男，2=女
            handheldUri: string; // 手持照
            name: string; // 名
            surname: string; // 姓
        }

        return this.api.get('/account/authInfo', { params }).then((result: any) => result as _Response);
    }

    fetchAuthAdvancedInfo(params: {
        // 高级认证详情
        id: string | undefined;
    }) {
        // 认证详情
        interface _Response {
            advancedCode: string; // 认证编码
            advancedUrl: 0 | 1 | 2 | 3; // 认证视频
        }

        return this.api.get('/account/authAdvancedInfo', { params }).then((result: any) => result as _Response);
    }

    fetchAuthUpdate(params: {
        // 审核
        id: string | undefined;
        authRemark: string; // 审核备注
        state: 1 | 2; // 状态：1=通过，2=拒绝
    }) {
        return this.api.post('/account/auth', params);
    }

    fetchAuthAuthAdvanced(params: {
        // 高级审核
        id: string | undefined;
        authRemark: string; // 审核备注
        state: 1 | 2; // 状态：1=通过，2=拒绝
    }) {
        return this.api.post('/account/authAdvanced', params);
    }

    fetchAccountState(params: {
        // 编辑状态
        id: string;
        state: 1 | 2; // 1=启用,2=禁用
    }) {
        return this.api.post('/account/updateState', params);
    }

    fetchAccountResetPassword(params: {
        // 重置密码
        id: string;
    }) {
        return this.api.get('/account/resetPassword', { params });
    }

    fetchAccountResetPayPassword(params: {
        // 重置资金密码
        id: string;
    }) {
        return this.api.get('/account/resetPayPassword', { params });
    }

    // 注销用户列表
    fetchCancellationApplication(params: CancellationApplicationType) {
        interface _Response extends Pagination {
            list: List;
        }

        return this.api.post('/account/closeAccountList', params).then((result: any) => result as _Response);
    }

    // 解绑邮箱
    fetchupdateCloseAccount(params: { id: string }) {
        return this.api.post('/account/updateCloseAccount', params);
    }

    // 用户登录日志
    fetchAccountLogList(params: AccountLogParams) {
        interface _Response extends Pagination {
            list: AccountLogData[];
        }

        return this.api.post('/sys/accountLog/loginList', params).then((res: any) => res as _Response);
    }

    // 用户登录日志
    fetchTagList() {
        interface _Response {
            color: string;
            id: string;
            name: string;
        }

        return this.api.get('/tag/list').then((r: any) => r as _Response[]);
    }

    fetchUserAuthList(params: Record<string, any>) {
        interface IFormatResponse extends IUserAuthInfo {
            genderName?: string;
            documentTypeName?: string;
            reviewStatusName?: string;
            primaryStatusName?: string;
        }

        interface _Response extends Pagination {
            list: IFormatResponse;
        }

        return this.api.post('/account/authenticationList', params).then((r: any) => {
            r.list.forEach((item: IFormatResponse) => {
                item.genderName = genderMap.get(item.gender)?.label;
                // item.documentTypeName = userIdTypeMap.get(Number(item.documentType))?.label;
                item.primaryStatusName = subSumStatusMap.get(item.primaryStatus)?.label;
                item.reviewStatusName = subSumStatusMap.get(item.reviewStatus)?.label;
            });
            return r as _Response;
        });
    }

    fetchUserAuthDetail(params: Record<string, any>): Promise<authenticationInfo> {
        return this.api.get('/account/authenticationInfo', { params });
    }

    fetchSetUserAuthLevel(params: Record<string, any>) {
        return this.api.get('/account/updateAuthLevel', { params }).then((r: any) => r as boolean);
    }

    fetchGetUserAuthLevel() {
        return this.api.get('/account/authLevel').then((r: any) => r as Record<string, any>);
    }

    fetchUapyCountryList() {
        return this.api.get('/account/uapyCountryList').then((r: any) => r as Record<string, any>[]);
    }

    // 用户登录日志导出
    accountLogExport(params: {
        deviceId: string;
        accountId?: string; // 用户id
        browserLanguage?: string; // 浏览器语言
        endTime: string; // 结束时间
        hostName?: string; // 主机名
        ipAddress?: string; // IP地址
        macAddress?: string; // mac地址
        nationalNumber?: string; // 电话号码
        offset?: string; //
        operated?: string; // 邮箱
        pageNo?: number; // 页码
        pageSize?: number; // 页面大小
        platform?: number; // 登录方式/平台 1=安卓，2=iOS,3=Web,4=PC
        platformLanguage?: string; // 平台语言
        startTime: string; // 开始时间
        usernameCn?: string; // 用户姓名(中文)
        usernameEn?: string; // 用户姓名(英文)
        labelId?: string; // 标签id
    }): Promise<Blob> {
        return this.api.post('/sys/accountLog/export', params, { responseType: 'blob' })
    };



    tagPageList(params: {
        // 标签列表
        pageNo: number; //
        pageSize: number; // 页面大小
        id: string; // 标签id
        name: string; // 标签名称
        operatorName: string; // 修改人名称
    }): Promise<
        {
            list: {
                accountIds: string; // 包含用户
                color: string; // 颜色
                createTime: string; // 创建日期
                id: string; // id
                name: string; // 名称
                operatorName: string; // 修改人
                sort: number; // 顺序
                updateTime: string; // 修改日期
            }[];
        } & TableResultType
    > {
        return this.api.get('/tag/pageList', { params });
    }


    // 添加或修改标签
    tagAddOrUpdate(params: {
        accountIds: string; // 用户id
        color: string; // 颜色
        createBy: string; // 创建人(不用传)
        id: string; // id(修改时传入)
        name: string; // 名称
        sort: number; // 顺序
    }): Promise<any> {
        return this.api.post('/tag/addOrUpdate', params);
    }

    // 删除标签
    tagDelete(params: {
        id: string; // id
    }): Promise<any> {
        return this.api.get('/tag/delete', { params });
    }

    // 标签详情
    tagGetInfo(params: {
        id: string; // id
    }): Promise<any> {
        return this.api.get('/tag/info', { params });
    }

    // 导出标签
    tagExport(params: {
        id: string; // id
        name: string; // 名称
        operatorName: string; // 修改人名称
    }): Promise<any> {
        return this.api.get('/tag/exportList', { params, responseType: 'blob' });
    }



    // 用户多标签模版
    tagInPutTemplate(): Promise<any> {
        return this.api.get('/tag/inPutTemplate', { responseType: 'blob' });
    }

    // 用户列表下拉
    tagAccountList(params?: {
        accountId?: string; // 用户id
    }) {
        return this.api.get('/tag/accountList', { params }).then((r: any) => r as any[]);
    }

    // 用户多标签导入
    tagInPut(params: {
        file: File; // 文件
    }): Promise<any> {
        return this.api.post('/tag/importTag', params, {
            headers: { Accept: 'application/json, ext/plain', 'Content-Type': 'multipart/form-data' },
        });
    }
}

export default new User();
