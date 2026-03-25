import { Api } from '../api';
import type { Pagination } from '../../interface/type';

interface SysUserCheckCipherParams {
    password: string
    userId: string
}

interface SysUserCheckCipherAnd2FAParams extends SysUserCheckCipherParams {
    facode: string
}

interface SysUserQrcodeResponse {
    qrcode: string
    secret: string
}

interface SysUserCheckGoogleCodeAndParams {
    code: string
}

interface SysUserCheckGoogleCodeParams {
    googleCode: string
}

class User extends Api {
    fetchReferralReferralList(params: {
        // 邀请返佣列表
        inviteAccountId?: string; // 风控类型
        parentAccountId?: string; // 渠道ID
        uid?: string;
        depositType?: number | string;
        invitationCode: string;
        cardDepositOrderNo: string;
        pageNo: number;
        pageSize: number;
    }) {
        // 风控列表
        interface _Response extends Pagination {
            list: {
                cardDepositOrderNo: string; // 关联订单号
                createTime: string; // 返佣时间
                depositAmount: string; // 充值数量
                depositType: string; // 类型 1、开卡 2、充值 3、开卡减免 4、首次开卡减免
                earningAmount: string; // 返佣/减免数量
                id: string; //
                invitationCode: string; // 邀请码
                inviteAccountId: string; // UID
                parentAccountId: string; // 上级 ID
                rebateRatio: string; // 返佣比例
            };
        }

        return this.api.get('/referral/referralList', { params }).then((result: any) => result as _Response);
    }

    //  导出
    fetchExcelWriterReferralList(params: {
        // 邀请返佣列表
        inviteAccountId?: string; // 风控类型
        parentAccountId?: string; // 渠道ID
        uid?: string;
        depositType?: number | string;
        invitationCode: string;
        cardDepositOrderNo: string;
        pageNo: number;
        pageSize: number;
    }): Promise<any> {
        return this.api.get('/referral/excelWriterReferralList', { params, responseType: 'blob' });
    }

    fetchBannerAdd(params: {
        // 创建BANNER
        accountId: string; // 账号id
        createTime: string; // 创建时间
        rangeType: string; // 1、全局 2、用户
        scale: string; // 返佣百分比
        scaleType: string; // 1、开卡 2、充值 3、开卡减免
    }) {
        return this.api.post('/banner/add', params);
    }

    fetchBannerDelete(id: number) {
        return this.api.get(`/banner/delete?id=${id}`);
    }

    cardOpenFirstConfigAdd(params: {
        // 新增首次开卡减免
        accountId: string; // 账号id
        beginTime: string; // 开始时间
        endTime: string; // 结束时间
        maxAmount: string; // 最大金额
        minAmount: string; // 最小金额
    }) {
        return this.api.post('/cardOpenFirstConfig/add', params);
    }

    cardOpenFirstConfigUpdate(params: {
        // 新增首次开卡减免
        accountId: string; // 账号id
        beginTime: string; // 开始时间
        endTime: string; // 结束时间
        maxAmount: string; // 最大金额
        minAmount: string; // 最小金额
        id: string;
    }) {
        return this.api.post('/cardOpenFirstConfig/update', params);
    }

    fetchTransactionSetTradePwd(params: {
        // 设置提币钱包密码
        againTradePwd: string; // 确认交易密码
        newTradePwd: string; // 交易密码
        walletSiteId: string | null;
    }) {
        return this.api.post('/transaction/setTradePwd', params);
    }

    fetchTransactionUpdatePaymentPwd(params: {
        // 修改交易密码
        againTradePwd: string; // 确认交易密码
        newTradePwd: string; // 交易密码
        oldTradePwd: string; // 原交易密码
    }) {
        return this.api.post('/transaction/updatePaymentPwd', params);
    }

    fetchTransactionResetPaymentPwd(params: {
        // 重置交易密码
        againTradePwd: string; // 确认交易密码
        newTradePwd: string; // 交易密码
        walletSiteId: string | null;
    }) {
        return this.api.post('/transaction/resetPaymentPwd', params);
    }

    fetchAccountCardManualDeposit(params: {
        // 创建BANNER
        cardDepositId: string; // 充值开卡ID
    }) {
        return this.api.post('/accountCard/manualDeposit', params);
    }

    fetchAccountCardManualOpenCard(params: {
        // 手动开卡
        accountId: string; // 账号id
        amount: string; // 开充值金额
        cardNo: string; // 卡号
        coinId: string; // 币种ID
        cvv2: string; // cvv2
        ditchCardId: string; // 渠道卡ID,开卡时传入
        invalidTime: string; // 过期时间:格式=2025-08-19
        receiptAmount: string; // 到账金额
    }) {
        return this.api.post('/accountCard/manualOpenCard', params);
    }

    fetchBannerUpdate(params: {
        // 编辑BANNER
        accountId: string; // 账号id
        createTime: string; // 创建时间
        id: string; //
        rangeType: string; // 1、全局 2、用户
        scale: string; // 返佣百分比
        scaleType: string; // 1、开卡 2、充值 3、开卡减免
    }) {
        return this.api.post('/banner/update', params);
    }

    fetchReferralCreateReferralConfig(params: {
        // 创建返佣配置
        accountId?: string; // 账号id，全局类型可以不用传
        rangeType: 1 | 2; // 1、全局 2、用户
        scale: string; // 返佣百分比
        scaleType: 1 | 2 | 3; // 1、开卡 2、充值 3、开卡减免
    }) {
        return this.api.post('/referral/createReferralConfig', params);
    }

    fetchReferralUpdateReferralConfig(params: {
        // 修改返佣配置
        accountId?: string; // 账号id，全局类型可以不用传
        scale: string; // 返佣百分比
        scaleType: 1 | 2 | 3; // 1、开卡 2、充值 3、开卡减免
        id?: string; // id
    }) {
        // 资产-冻结
        return this.api.post('/referral/updateReferralConfig', params);
    }

    fetchSysUserCheckCipher(params: SysUserCheckCipherParams): Promise<boolean> {
        // 校验登录密码后进入绑定 2FA 的下一步
        return this.api.post('/sys/user/checkCipher', params);
    }

    fetchSysUserCheckCipherAnd2FA(params: SysUserCheckCipherAnd2FAParams): Promise<boolean> {
        // 更换 2FA 时需要同时校验登录密码和当前 2FA 验证码
        return this.api.post('/sys/user/checkCipherAnd2FA', params);
    }

    fetchReferralReferralConfigList(params: {
        // 邀请返佣配置列表
        scaleType: string | null; //
        rangeType: string | null; //
        accountId: number | string;
        pageNo: number;
        pageSize: number;
    }) {
        // 风控列表
        interface _Response extends Pagination {
            list: {
                accountId: string; // 账号id
                createTime: string; // 创建时间
                id: string; //
                rangeType: string; // 1、全局 2、用户
                scale: string; // 返佣百分比
                scaleType: string; // 1、开卡 2、充值 3、开卡减免
            };
        }

        return this.api.get('/referral/referralConfigList', { params }).then((result: any) => result as _Response);
    }

    fetchBannerList(params: {
        // banner列表
        state: string | null; // 状态
        pageNo: number;
        pageSize: number;
    }) {
        // 风控列表
        interface _Response extends Pagination {
            list: {
                language: string; // 语言：zh-CN en-US
                platform: string; // 平台：1=web,2=pc
                id: string; //
                state: string; // 1启用，2禁用
                updateTime: string; // 修改时间
                uri: string; // URI
                small: string;
            };
        }

        return this.api.post('/banner/list', params).then((result: any) => result as _Response);
    }

    shippingInformationLst(params: {
        // banner列表
        id?: string | null; //
        pageNo: number;
        pageSize: number;
    }) {
        // 风控列表
        interface _Response extends Pagination {
            list: {
                addressLine1: string; // 地址1
                addressLine2: string; // 地址2
                id: string; //
                city: string; // 城市
                country: string; // 国家
                createTime: string; // 时间
                email: string; // 邮箱
                fullName: string; // 全称
                phone: string; // 手机
                phoneArea: string; // 电话区号
                postCode: string; // 邮编
            };
        }

        return this.api.get('/shippingInformation/list', { params }).then((result: any) => result as _Response);
    }

    cardOpenFirstConfigList(params: {
        // 首次开卡减免列表
        accountId?: string | null; // 账号ID
        pageNo: number;
        pageSize: number;
    }) {
        // 列表
        interface _Response extends Pagination {
            list: {
                account: string; // 账号
                accountId: string; // 账号ID
                id: string; //
                beginTime: string; // 开始时间
                createTime: string; // 创建时间
                endTime: string; // 结束时间
                maxAmount: string; // 最大金额
                fullName: string; // 全称
                minAmount: string; // 最小金额
                updateTime: string; // 修改时间
            };
        }

        return this.api.get('cardOpenFirstConfig/list', { params }).then((result: any) => result as _Response);
    }

    fetchBannerUpdateState(params: {
        // 编辑状态
        id: string;
        state: 1 | 2 | ''; // 状态：1=启用,2=禁用
    }) {
        return this.api.get('/banner/updateState', { params });
    }

    fetchSysUserQrcode(): Promise<SysUserQrcodeResponse> {
        return this.api.get('/sys/user/qrcode');
    }

    fetchSysUserCheckGoogleCodeAnd(params: SysUserCheckGoogleCodeAndParams): Promise<boolean> {
        // 校验新 2FA 验证码并完成绑定
        return this.api.get('/sys/user/checkGoogleCodeAnd', { params });
    }
    // 登录验证Google
    fetchSysUserCheckGoogleCode(params: SysUserCheckGoogleCodeParams): Promise<boolean> {
        // 登录或设置流程中的 2FA 验证
        return this.api.post('/sys/validateGoogle', params);
    }
}

export default new User();
