/**
 * 通用分页结果字段。
 * 旧的 userApi 模块会复用这组字段来约束列表接口返回值。
 */
export interface Pagination {
    pageNo: number
    pageSize: number
    totalPages: number
    totalSize: number
}

/**
 * 注销申请列表查询参数。
 * 由于历史页面传参较分散，这里保留可扩展字段避免影响旧调用方。
 */
export interface CancellationApplicationType {
    pageNo: number
    pageSize: number
    accountId?: string
    state?: 1 | 2 | 3 | ''
    startTime?: string
    endTime?: string
    [key: string]: unknown
}

/**
 * 注销申请列表项。
 * 当前项目对该结构使用较少，先提供核心字段并保留扩展能力。
 */
export interface CancellationApplicationItem {
    id: string
    accountId: string
    state: 1 | 2 | 3
    createTime: string
    updateTime?: string
    [key: string]: unknown
}

export type List = CancellationApplicationItem[]
