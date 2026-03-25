import { Api } from '@/api/api'
import type { Pagination } from '@/interface/type'

class ShippingInformationApi extends Api {
    /** 收货信息列表 */
    getShippingInformationList(params: {
        id?: string | null
        pageNo: number
        pageSize: number
    }): Promise<
        {
            list: {
                addressLine1: string
                addressLine2: string
                id: string
                city: string
                country: string
                createTime: string
                email: string
                fullName: string
                phone: string
                phoneArea: string
                postCode: string
            }
        } & Pagination
    > {
        return this.api.get('/shippingInformation/list', { params })
    }
}

export default new ShippingInformationApi()
