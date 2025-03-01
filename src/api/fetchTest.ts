import { TableResultType } from '@/interface/TableType';
import { Api } from './api';

class FetchTest extends Api {
    userLogin(params: { account: string, password: string, code: string }): Promise<any> {
        return this.api.post('/sys/manage/login', params);
    }

    // paytrades赎回列表
    redemptionList(params: {
        accountNo: string; // 账户号
        currencyCode: string; // 交易币种
        ditchCardId: string; // 渠道卡id
        endTime: string; // 结束时间
        internalCardId: string; // 内部卡id
        pageNo: number; // 页码
        pageSize: number; // 页面大小
        startTime: string; // 开始时间
        transactionId: string; // (交易关联) ID
        type: 1 | 2 | null; // 业务类型,可用值:充值赎回 赎回手续费
        uuid: string; // UUID(渠道交易id)
    }): Promise<{
        list: {
            accountNo: string; // 账户号
            amount: string; // 交易金额
            createTime: string; // 交易发生时间
            currencyCode: string; // 交易币种
            ditchCardId: string; // 内部卡id
            frozenAmount: string; // 冻结金额
            id: string; // id
            internalCardId: string; // 渠道卡id
            newAmount: string; // 变动后余额
            newFrozenAmount: string; // 操作后冻结金额
            note: string; // 备注
            transactionId: string; // (交易关联) ID
            type: 1 | 2; // 业务类型,可用值:充值赎回 赎回手续费
            uuid: string; // UUID(渠道交易id)
        }[]
    } & TableResultType> {
        return this.api.post('/ditchFinancePaytrades/redemptionList', params);
    }
}
export default new FetchTest();
