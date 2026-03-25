import type { TableResultType } from '@/interface/TableType';
import { Api } from '../api';

class FetchTest extends Api {
    fetchUserAssetListOfSkyee(params: {
        // 退款数据
        pageNo: number; //
        pageSize: number; // 页面大小
        accountId: string; // 账号ID
        cardNumber: string; // 卡号
    }): Promise<
        {
            list: {
                accountId: string; // 用户ID
                amount: number; // 总退款金额
                cardNumber: string; // Skyee卡号
                consumeFee: number; // 消费手续费
                createTime: string; // 销卡退款时间
                depositFee: number; // 充值手续费
                id: string; // ID
                openFee: number; // 开卡费
                reductionDepositFee: number; // 充值减免
                reductionFee: number; // 开卡减免
                showBalance: number; // 显示卡余额
                symbol: string; // 资产类型
            }[];
        } & TableResultType
    > {
        return this.api.post('/userAsset/userAssetListOfSkyee', params);
    }

    excelWriterUserAssetListOfSkyee(params: {
        // 导出退款数据
        pageNo: number; //
        pageSize: number; // 页面大小
        accountId: string; // 账号ID
        cardNumber: string; // 卡号
    }) {
        return this.api.post('/userAsset/excelWriterUserAssetListOfSkyee', params, { responseType: 'blob' });
    }

    fetchUserAssetList(params: {
        pageNo: number; // pageNo.默认值:1
        pageSize: number; // pageSize.默认值:10
        coinId?: string; // 资产类型：币种id
        endBalance?: string; // 结束金额
        endFrozenBalance?: string; // 结束提现冻结金额
        endManualFrozenBalance?: string; // 结束风控冻结金额
        showMinusAccount?: null | 1 | 2; // 是否展示用户负资产 1:展示 2:不展示
        startBalance?: string; // 开始金额
        startFrozenBalance?: string; // 开始提现冻结金额
        startManualFrozenBalance?: string; // 开始风控冻结金额
        userId: string; // 用户ID
    }): Promise<
        {
            list: {
                balance: string; // 可用资产
                frozenBalance: string; // 提币冻结数量
                id: string; // Id
                manualFrozenBalance: string; // 手动冻结数量
                showMinusAccount: number; // 是否展示负资产 1:展示 2:不展示
                symbol: string; // 资产类型
                userId: string; // 用户id
            }[];
        } & TableResultType
    > {
        return this.api.post('/userAsset/newUserAssetList', params);
    }

    fetchgetUserAssetListAmountTotal(params: {
        pageNo: number; // 1
        pageSize: number; // 10
        coinId: string; // 资产类型：币种id
        endBalance: string; // 结束金额
        endFrozenBalance: string; // 结束提现冻结金额
        endManualFrozenBalance: string; // 结束风控冻结金额
        showMinusAccount: null | 1 | 2; // 是否展示用户负资产 1:展示 2:不展示
        startBalance: string; // 开始金额
        startFrozenBalance: string; // 开始提现冻结金额
        startManualFrozenBalance: string; // 开始风控冻结金额
        userId: string; // 用户ID;
    }): Promise<{
        availableAmountTotal: string; // 可用总金额
        riskAmountTotal: string; // 风控冻结金额
        withdrawalAmountTotal: string; // 提现冻结金额
    }> {
        return this.api.post('/userAsset/getUserAssetListAmountTotal', params);
    }

    // 用户资产 冻结
    fetchUserfreezeData(params: {
        userId: string; // 用户ID
        coinId: string; // 币种id
        pageNo: number;
        pageSize: number;
        endBalance: string; // 结束金额
        startBalance: string; // 开始金额
        startFrozen: string; // 开始冻结
        endFrozen: string; // 结束冻结
        startFrozenBalance: string; // 开始提现冻结金额
        endFrozenBalance: string; // 结束提现冻结金额
        startManualFrozenBalance: string; // 开始提现冻结金额
        endManualFrozenBalance: string; // 结束风控冻结金额
    }): Promise<any> {
        return this.api.post('/userAsset/manualFreeze', params);
    }

    // 用户资产 解冻
    fetchUserThawData(params: {
        userId: string; // 用户ID
        coinId: string; // 币种id
        pageNo: number;
        pageSize: number;
        endBalance: string; // 结束金额
        startBalance: string; // 开始金额
        startFrozen: string; // 开始冻结
        endFrozen: string; // 结束冻结
    }): Promise<any> {
        return this.api.post('/userAsset/manualUnfreeze', params);
    }

    fetchgetUpdateUserAssetStatus(params: { id: string; showMinusAccount: 1 | 2 }) {
        return this.api.post('/userAsset/updateUserAssetStatus', params);
    }

    fetchUserAssetListSnapshot(): Promise<any> {
        // 用户资产快照
        return this.api.get('/userAsset/snapshot');
    }

    fetchUAssetUserAssetSnapshotList(params: {
        // 用户资产快照列表
        pageNo: number; // 页数
        pageSize: number; // 条数
        endTime: string; // 结束时间
        startTime: string; // 开始时间
        type: number; // 类型：1=自动，2=手动
        userId: string; // 用户ID
    }): Promise<
        {
            list: {
                balance: string; // 可用资产
                createTime: string; // 快照时间
                frozenBalance: string; // 冻结数量
                id: string; // Id
                remarks: string; // 备注
                symbol: string; // 资产类型
                type: number; // 类型:1=自动，2=手动
                typeName: number; // 类型名称:1=自动，2=手动
                userId: string; // 用户id
            }[];
        } & TableResultType
    > {
        return this.api.get('/userAsset/userAssetSnapshotList', { params });
    }

    fetchgetUserAssetSnapshotAmountTotalt(params: {
        // 用户资产快照 金额
        endTime: string; // 结束时间
        startTime: string; // 开始时间
        type: number; // 类型：1=自动，2=手动
        userId: string; // 用户ID
    }): Promise<{
        availableAmountTotal: string; // 可用总金额
        freezeAmountTotal: string; // 冻结金额
    }> {
        return this.api.get('/userAsset/getUserAssetSnapshotAmountTotal', { params });
    }

    fetchUserAssetListExcel(params: {
        // 用户资产列表
        coinId?: string; // 资产类型：币种id
        endBalance?: string; // 结束金额
        endFrozenBalance?: string; // 结束提现冻结金额
        endManualFrozenBalance?: string; // 结束风控冻结金额
        pageNo: number;
        pageSize: number;
        startBalance?: string; // 开始金额
        startFrozenBalance?: string; // 开始提现冻结金额
        startManualFrozenBalance?: string; // 开始风控冻结金额
        userId?: string; // 用户ID
    }): Promise<any> {
        return this.api.post('/userAsset/userAssetList/excelWriter', params, { responseType: 'blob' });
    }

    fetchUserAssetUserAssetSnapshotListExcelWriter(params: {
        // 用户资产快照导出
        type?: null | 1 | 2; //
        startTime?: string; // 开始时间
        endTime?: string; // 结束时间
        userId?: string; // 用户id
    }): Promise<any> {
        return this.api.get('/userAsset/userAssetSnapshotList/excelWriter', { params, responseType: 'blob' });
    }
}

export default new FetchTest();
