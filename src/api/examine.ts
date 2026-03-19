import type { AxiosInstance } from 'axios';

import http from '@/plugins/http';

interface ApprovalFlowUser {
    checkUserName: string;
}

interface EnterpriseTransferConfig {
    checkReqList: ApprovalFlowUser[];
}

class ExamineApi {
    private api: AxiosInstance;

    constructor() {
        const baseUrl = `${String(import.meta.env.VITE_APP_BASE_URL)}/examine`;
        this.api = http[baseUrl] || http.instance(baseUrl);
    }

    getEnterpriseTransferConfig(params: {
        coinId: string;
        amount: string;
    }): Promise<EnterpriseTransferConfig[]> {
        return this.api.get('/getEnterpriseTransferConfig', { params });
    }
}

export default new ExamineApi();
