/**
 * 状态值统一输入类型：
 * - 兼容后端 number / string / boolean
 * - 允许空值走兜底展示
 */
export type StatusValue = string | number | boolean | null | undefined

/**
 * 状态语义色：
 * - success: 正向状态
 * - warning: 待处理/中间态
 * - danger: 失败/禁用等风险态
 * - muted: 中性态
 */
export type StatusTone = 'success' | 'warning' | 'danger' | 'muted'

/**
 * 单个状态项描述：
 * - label 存中文 key，由组件侧统一走 i18n
 * - tone 只描述语义，不绑定具体颜色实现
 */
export interface StatusMeta {
    label: string
    tone: StatusTone
}

export type StatusPreset =
    | 'account'
    | 'success'
    | 'boolean'
    | 'flashShowState'
    | 'flashSwitchState'
    | 'flashTradeStatus'
    | 'reviewState'
    | 'reviewResult'
    | 'authState'
    | 'kolState'
    | 'whitelistState'
    | 'whitelistLevel'
    | 'userState'
    | 'cancellationCheckState'
    | 'cancellationUserState'

const ACCOUNT_STATUS_MAP: Record<string, StatusMeta> = {
    '1': { label: '启用', tone: 'success' },
    '2': { label: '禁用', tone: 'danger' },
    '3': { label: '冻结', tone: 'warning' },
}

const SUCCESS_STATUS_MAP: Record<string, StatusMeta> = {
    true: { label: '成功', tone: 'success' },
    false: { label: '失败', tone: 'danger' },
    '1': { label: '成功', tone: 'success' },
    '0': { label: '失败', tone: 'danger' },
}

const BOOLEAN_STATUS_MAP: Record<string, StatusMeta> = {
    true: { label: '是', tone: 'danger' },
    false: { label: '否', tone: 'muted' },
    '1': { label: '是', tone: 'danger' },
    '0': { label: '否', tone: 'muted' },
    '2': { label: '否', tone: 'muted' },
}

/**
 * 闪兑列表：展示开关（是否在行情区/交易区显示）
 * 兼容后端 1/2 与 1/0 两种返回结构。
 */
const FLASH_SHOW_STATE_MAP: Record<string, StatusMeta> = {
    '1': { label: '是', tone: 'success' },
    '2': { label: '否', tone: 'danger' },
    '0': { label: '否', tone: 'danger' },
    是: { label: '是', tone: 'success' },
    否: { label: '否', tone: 'danger' },
}

/**
 * 闪兑列表：开关状态（开启/关闭）
 * 兼容后端 1/2 与 1/0 两种返回结构。
 */
const FLASH_SWITCH_STATE_MAP: Record<string, StatusMeta> = {
    '1': { label: '开启', tone: 'success' },
    '2': { label: '关闭', tone: 'danger' },
    '0': { label: '关闭', tone: 'danger' },
    开启: { label: '开启', tone: 'success' },
    关闭: { label: '关闭', tone: 'danger' },
}

/**
 * 闪兑列表：交易对状态（上架/下架）
 * 兼容后端 1/2 与 1/0 两种返回结构。
 */
const FLASH_TRADE_STATUS_MAP: Record<string, StatusMeta> = {
    '1': { label: '上架', tone: 'success' },
    '2': { label: '下架', tone: 'danger' },
    '0': { label: '下架', tone: 'danger' },
    上架: { label: '上架', tone: 'success' },
    下架: { label: '下架', tone: 'danger' },
}

const REVIEW_STATE_MAP: Record<string, StatusMeta> = {
    '1': { label: '已审核', tone: 'success' },
    '2': { label: '待审核', tone: 'warning' },
}

const REVIEW_RESULT_MAP: Record<string, StatusMeta> = {
    '1': { label: '通过', tone: 'success' },
    '2': { label: '拒绝', tone: 'danger' },
}

/**
 * 认证状态映射（用户/KOL 通用）：
 * - 兼容数字态 0/1/2/3
 * - 兼容风控字符串 WAIT/GREEN/RED
 * - 兼容后端已翻译文案
 */
const AUTH_STATE_MAP: Record<string, StatusMeta> = {
    '0': { label: '未认证', tone: 'warning' },
    '1': { label: '认证中', tone: 'warning' },
    '2': { label: '成功', tone: 'success' },
    '3': { label: '失败', tone: 'danger' },
    WAIT: { label: '待处理', tone: 'warning' },
    GREEN: { label: '成功', tone: 'success' },
    RED: { label: '失败', tone: 'danger' },
    未认证: { label: '未认证', tone: 'warning' },
    认证中: { label: '认证中', tone: 'warning' },
    待处理: { label: '待处理', tone: 'warning' },
    待定: { label: '待定', tone: 'warning' },
    成功: { label: '成功', tone: 'success' },
    失败: { label: '失败', tone: 'danger' },
    完成: { label: '完成', tone: 'success' },
    初始化: { label: '初始化', tone: 'muted' },
}

const KOL_STATE_MAP: Record<string, StatusMeta> = {
    '1': { label: '正常', tone: 'success' },
    '2': { label: '已禁用', tone: 'danger' },
    '3': { label: '已取消身份', tone: 'muted' },
    正常: { label: '正常', tone: 'success' },
    已禁用: { label: '已禁用', tone: 'danger' },
    已取消身份: { label: '已取消身份', tone: 'muted' },
    禁用: { label: '禁用', tone: 'danger' },
    取消身份: { label: '取消身份', tone: 'muted' },
}

/**
 * 白名单状态统一展示：
 * - 兼容数值态 0/1
 * - 统一输出“已启用/已禁用”
 */
const WHITELIST_STATE_MAP: Record<string, StatusMeta> = {
    '0': { label: '已禁用', tone: 'danger' },
    '1': { label: '已启用', tone: 'success' },
    禁用: { label: '已禁用', tone: 'danger' },
    启用: { label: '已启用', tone: 'success' },
    已禁用: { label: '已禁用', tone: 'danger' },
    已启用: { label: '已启用', tone: 'success' },
}

const WHITELIST_LEVEL_MAP: Record<string, StatusMeta> = {
    '0': { label: '未认证', tone: 'muted' },
    '1': { label: '初级认证', tone: 'warning' },
    '2': { label: '高级认证', tone: 'success' },
    未认证: { label: '未认证', tone: 'muted' },
    初级认证: { label: '初级认证', tone: 'warning' },
    高级认证: { label: '高级认证', tone: 'success' },
}

const USER_STATE_MAP: Record<string, StatusMeta> = {
    '1': { label: '正常', tone: 'success' },
    '2': { label: '冻结', tone: 'danger' },
    '3': { label: '已注销', tone: 'muted' },
    正常: { label: '正常', tone: 'success' },
    冻结: { label: '冻结', tone: 'danger' },
    已注销: { label: '已注销', tone: 'muted' },
    注销: { label: '已注销', tone: 'muted' },
}

const CANCELLATION_CHECK_STATE_MAP: Record<string, StatusMeta> = {
    '1': { label: '待审核', tone: 'warning' },
    '2': { label: '审核通过', tone: 'success' },
    '3': { label: '审核拒绝', tone: 'danger' },
    待审核: { label: '待审核', tone: 'warning' },
    审核通过: { label: '审核通过', tone: 'success' },
    审核拒绝: { label: '审核拒绝', tone: 'danger' },
}

const CANCELLATION_USER_STATE_MAP: Record<string, StatusMeta> = {
    '1': { label: '正常', tone: 'success' },
    '2': { label: '冻结', tone: 'warning' },
    '3': { label: '注销', tone: 'danger' },
    正常: { label: '正常', tone: 'success' },
    冻结: { label: '冻结', tone: 'warning' },
    注销: { label: '注销', tone: 'danger' },
    已注销: { label: '注销', tone: 'danger' },
}

/**
 * 语义色到主题 token 的映射。
 * 组件层只关心语义色，不关心具体色值来源。
 */
export const STATUS_TONE_COLOR_MAP: Record<StatusTone, string> = {
    success: 'var(--app-status-success)',
    warning: 'var(--app-status-warning)',
    danger: 'var(--app-status-danger)',
    muted: 'var(--app-text-muted)',
}

/**
 * 所有 preset 的统一映射入口。
 * 页面侧新增状态类型时，优先扩展这里而不是在页面散落条件判断。
 */
export const STATUS_PRESET_MAP: Record<StatusPreset, Record<string, StatusMeta>> = {
    account: ACCOUNT_STATUS_MAP,
    success: SUCCESS_STATUS_MAP,
    boolean: BOOLEAN_STATUS_MAP,
    flashShowState: FLASH_SHOW_STATE_MAP,
    flashSwitchState: FLASH_SWITCH_STATE_MAP,
    flashTradeStatus: FLASH_TRADE_STATUS_MAP,
    reviewState: REVIEW_STATE_MAP,
    reviewResult: REVIEW_RESULT_MAP,
    authState: AUTH_STATE_MAP,
    kolState: KOL_STATE_MAP,
    whitelistState: WHITELIST_STATE_MAP,
    whitelistLevel: WHITELIST_LEVEL_MAP,
    userState: USER_STATE_MAP,
    cancellationCheckState: CANCELLATION_CHECK_STATE_MAP,
    cancellationUserState: CANCELLATION_USER_STATE_MAP,
}

/**
 * 标准化状态值：
 * - 空值统一转空字符串，走组件 fallback
 * - 布尔值统一转字符串键，匹配映射表
 * - 字符串做 trim，避免后端意外空格导致匹配失败
 */
export const normalizeStatusValue = (value: StatusValue): string => {
    if (typeof value === 'boolean') return String(value)
    if (value === null || typeof value === 'undefined' || value === '') return ''
    return String(value).trim()
}
