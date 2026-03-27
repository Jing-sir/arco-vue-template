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
 * 与老项目 `/account/closeAccountList` 入参保持一致，避免迁移后筛选行为偏差。
 */
export interface CancellationApplicationType {
    pageNo: number
    pageSize: number
    accountId?: string
    userEmail?: string
    checkCloseState?: 1 | 2 | 3 | ''
    state?: 1 | 2 | 3 | ''
    startTime?: string
    endTime?: string
}

/**
 * 注销申请列表项。
 * 兼容老项目返回结构：核心展示字段显式声明，其它扩展字段继续允许透传。
 */
export interface CancellationApplicationItem extends Record<string, unknown> {
    id: string
    accountId?: string
    phone?: string
    globalCode?: string
    email?: string
    createTime?: string
    cancelTime?: string
    updateTime?: string
    closeAccountCheck?: 1 | 2 | 3 | ''
    state?: 1 | 2 | 3
}

export type List = CancellationApplicationItem[]
