import { Api } from '../api'
import type { TableResultType } from '@/interface/TableType'

/**
 * fetchTest/index.ts — 临时业务接口聚合层。
 *
 * 迁移进度（按 URL 前缀）：
 * - /sys/*    → src/api/sys.ts        ✅ 已迁移，此处保留同名方法 re-export 保持调用方兼容
 * - /file/*   → src/api/file.ts       ✅ 已迁移，此处保留同名方法 re-export 保持调用方兼容
 * - /accountCard/*               ⬜ 待迁移至 src/api/accountCard.ts
 * - /ditchFinancePaytrades/*     ⬜ 待迁移至对应前缀模块
 * - /ditchAssetsDetails/*        ⬜ 待迁移至对应前缀模块
 *
 * 当前页面调用方：
 *   - views/SystemManage/operation-log/Index.vue         → 使用 fetchOperationLogList
 *   - views/SystemManage/role-permissions/form/Index.vue → 使用 sysRoleMenuList / sysRoleAddUpdate / sysRoleInfo / sysInfoCheckMenuList
 *   - views/SystemManage/account-manage/Index.vue        → 使用 sysUserList
 *   - views/SystemManage/account-manage/form/Index.vue   → 使用 sysUserAddOrUpdate / sysRoleList / sysUserInfo
 *   - views/SystemManage/account-manage/modal/ResetPasswords.vue → 使用 sysUserResetPassword / setSysUserResetSecret
 *
 * 待上述页面的 import 统一切换到 src/api/sys.ts 后，此文件中的 re-export 可删除。
 */

// ── /sys/* 接口 re-export（已迁移至 src/api/sys.ts）─────────────────
import sysApi from '../sys'

// ── /file/* 接口 re-export（已迁移至 src/api/file.ts）───────────────
import fileApi from '../file'

// ── 剩余待迁移业务接口 ────────────────────────────────────────────────
class FetchTestResidual extends Api {
    /** 预计渠道提款金额 /accountCard/predictDitchAmount */
    sysAccountCardPredictDitchAmount(params: {
        amount: string
        cardNo: string
        ditchCardId: string
    }) {
        return this.api.get('/accountCard/predictDitchAmount', { params })
    }

    /** 提款 /accountCard/drawings */
    sysAccountCardDrawings(params: {
        accountBalance: string
        accountId: string
        agentId: string
        applyTime: string
        cardNumber: string
        ditchCardId: string
        drawingsAmount: string
        invalidTime: string
        isReturn: 0 | 1
        predictDitchAmount: string
        surname: string
        name: string
    }): Promise<void> {
        return this.api.post('/accountCard/drawings', params)
    }

    /** paytrades 赎回列表 /ditchFinancePaytrades/redemptionList */
    redemptionList(params: {
        accountNo: string
        currencyCode: string
        ditchCardId: string
        endTime: string
        internalCardId: string
        pageNo: number
        pageSize: number
        startTime: string
        transactionId: string
        type: 1 | 2 | null  // 1 充值赎回，2 赎回手续费
        uuid: string
    }): Promise<{
        list: {
            accountNo: string
            amount: string
            createTime: string
            currencyCode: string
            ditchCardId: string
            frozenAmount: string
            id: string
            internalCardId: string
            newAmount: string
            newFrozenAmount: string
            note: string
            transactionId: string
            type: 1 | 2
            uuid: string
        }[]
    } & TableResultType> {
        return this.api.post('/ditchFinancePaytrades/redemptionList', params)
    }

    /** 交易类型下拉 /ditchAssetsDetails/messageTypeList */
    fetchTypeList(): Promise<string[]> {
        return this.api.get('/ditchAssetsDetails/messageTypeList')
    }
}

const residualApi = new FetchTestResidual()

/**
 * 兼容导出：合并 sysApi、fileApi 和剩余业务方法，
 * 使现有调用方 `import api from '@/api/fetchTest/index'` 不需要立即改动。
 */
export default {
    // /sys/* re-export
    sysUserLogin: sysApi.sysUserLogin.bind(sysApi),
    loginOut: sysApi.loginOut.bind(sysApi),
    loginInfo: sysApi.loginInfo.bind(sysApi),
    userInfo: sysApi.loginInfo.bind(sysApi),   // 旧别名兼容
    sysUserList: sysApi.sysUserList.bind(sysApi),
    sysUserAddOrUpdate: sysApi.sysUserAddOrUpdate.bind(sysApi),
    sysUserInfo: sysApi.sysUserInfo.bind(sysApi),
    sysRoleList: sysApi.sysRoleList.bind(sysApi),
    sysRoleMenuList: sysApi.sysRoleMenuList.bind(sysApi),
    sysUserMenuList: sysApi.menuList.bind(sysApi),  // 旧别名兼容
    menuList: sysApi.menuList.bind(sysApi),
    sysRoleAddUpdate: sysApi.sysRoleAddUpdate.bind(sysApi),
    sysInfoCheckMenuList: sysApi.sysInfoCheckMenuList.bind(sysApi),
    sysRoleInfo: sysApi.sysRoleInfo.bind(sysApi),
    fetchOperationLogList: sysApi.fetchOperationLogList.bind(sysApi),
    sysUserResetPassword: sysApi.sysUserResetPassword.bind(sysApi),
    setSysUserResetSecret: sysApi.setSysUserResetSecret.bind(sysApi),
    sysUserUpdatePassword: sysApi.sysUserUpdatePassword.bind(sysApi),
    setLoginPass: sysApi.setLoginPass.bind(sysApi),
    getSetLoginPwdMsgCode: sysApi.getSetLoginPwdMsgCode.bind(sysApi),
    checkCipher: sysApi.checkCipher.bind(sysApi),
    validateGoogle: sysApi.validateGoogle.bind(sysApi),

    // /file/* re-export
    uploadFile: fileApi.uploadFile.bind(fileApi),
    uploadBanner: fileApi.uploadBanner.bind(fileApi),
    userUploadFile: fileApi.userUploadFile.bind(fileApi),

    // 剩余待迁移
    sysAccountCardPredictDitchAmount: residualApi.sysAccountCardPredictDitchAmount.bind(residualApi),
    sysAccountCardDrawings: residualApi.sysAccountCardDrawings.bind(residualApi),
    redemptionList: residualApi.redemptionList.bind(residualApi),
    fetchTypeList: residualApi.fetchTypeList.bind(residualApi),
}