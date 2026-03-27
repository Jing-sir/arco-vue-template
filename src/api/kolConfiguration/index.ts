import { Api } from '@/api/api'
import type { Pagination } from '@/interface/type'

interface KolInfluencerRow extends Record<string, unknown> {
    id: string
    accountId: string
    userTypeName?: string
    invitationCode?: string
    surname?: string
    name?: string
    labelName?: string
    authStateName?: string
    advancedAuthStateName?: string
    email?: string
    globalCode?: string
    phone?: string
    state: 1 | 2 | 3
    stateName?: string
    createTime?: string
    updateTime?: string
}

class KolConfigurationApi extends Api {
    /**
     * 用户管理 - KOL 列表。
     * 沿用旧项目接口协议，避免迁移期改动后端入参与分页字段。
     */
    fetchGetKolInfluencerList(params: Record<string, unknown>): Promise<{ list: KolInfluencerRow[] } & Pagination> {
        return this.api.post('/kolInfluencer/list', params)
    }

    /**
     * KOL 状态切换（启用/禁用/取消身份）。
     */
    fetchEnableKolInfluencer(params: { id: string; state: 1 | 2 | 3 }): Promise<boolean> {
        return this.api.get('/kolInfluencer/enable', { params })
    }

    /**
     * 校验 UID 是否可作为 KOL 添加。
     */
    fetchGetKolInfluencerExistUser(params: { accountId: string }): Promise<boolean> {
        return this.api.get('/kolInfluencer/existUser', { params })
    }

    /**
     * 新增 KOL 用户。
     */
    fetchGetKolInfluencerAdd(params: {
        accountId: string
        email: string
        globalCode: string
        phone: string
    }): Promise<boolean> {
        return this.api.post('/kolInfluencer/add', params)
    }
}

export default new KolConfigurationApi()
