/**
 * @deprecated 此文件是旧版接口入口，已被 fetchTest/index.ts 取代。
 *
 * - userLogin    → 对应新版 sysApi.sysUserLogin（src/api/sys.ts）
 * - redemptionList → 对应新版 fetchTest/index.ts 中的 redemptionList（待迁移至 /ditchFinancePaytrades 模块）
 *
 * 如果你的代码仍在 import 此文件，请迁移到上述新位置。
 * 待确认无调用方后删除此文件。
 */

import { Api } from './api'
import type { TableResultType } from '@/interface/TableType'

class FetchTestLegacy extends Api {
    /** @deprecated 请改用 src/api/sys.ts 的 sysUserLogin */
    userLogin(params: { account: string; password: string; code: string }): Promise<unknown> {
        return this.api.post('/sys/manage/login', params)
    }

    /** @deprecated 请改用 fetchTest/index.ts 的 redemptionList */
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
        type: 1 | 2 | null
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
}

export default new FetchTestLegacy()