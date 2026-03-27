import { Api } from '@/api/api'
import type { AccountList, AccountParams } from '@/api/userApi/types.d'
import type { CancellationApplicationType, List, Pagination } from '@/interface/type'

class AccountListApi extends Api {
    /** 代理商账户列表 */
    getAccountList(params: Partial<AccountParams>): Promise<{ list: AccountList[] } & Pagination> {
        return this.api.post('/account/list', params)
    }

    /** 导出代理商账户列表 */
    exportAccountList(params: Partial<AccountParams>): Promise<Blob> {
        return this.api.post('/account/accountExcelWriter', params, { responseType: 'blob' })
    }

    /** 更新账户状态 */
    updateAccountState(params: { id: string; state: 1 | 2 }): Promise<boolean> {
        return this.api.post('/account/updateState', params)
    }

    /** 重置登录密码 */
    resetAccountPassword(params: { id: string }): Promise<boolean> {
        return this.api.get('/account/resetPassword', { params })
    }

    /** 重置资金密码 */
    resetAccountPayPassword(params: { id: string }): Promise<boolean> {
        return this.api.get('/account/resetPayPassword', { params })
    }

    /** 注销申请列表 */
    getCancellationApplicationList(params: CancellationApplicationType): Promise<{ list: List } & Pagination> {
        return this.api.post('/account/closeAccountList', params)
    }

    /** 解绑邮箱 */
    updateCloseAccount(params: { id: string }): Promise<boolean> {
        return this.api.post('/account/updateCloseAccount', params)
    }
}

export default new AccountListApi()
