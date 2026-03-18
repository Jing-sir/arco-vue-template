export interface TableResultType {
    pageNo: number;
    pageSize: number;
    totalSize: number;
    totalPages: number;
    prevPage: number;
    nextPage: number;
}


export interface ChainRowType {
    id: number; // id
    chainName: string; // 链简称
    slip44: number; // slip44
    txUri: string;
    addressUri: string;
    chainAllName: string; // 链全称
    browser: string; // 区块浏览器
    rollBackState: number; // 回滚状态 1、是 2、否
    depositConfirmNum: number; // 充值确认数
    withdrawConfirmNum: number; // 提币确认数
    lastBlockHeight: number; // 当前高度
    parserBlockHeight: number; // 解析高度
    chainState: number; // 链状态 1、启用 2、禁用
}

export interface TabsType  {
    name: string;
    code: string;
    value?: string;
    role?: string;
}

export interface ColumnType<T = Record<string, unknown>> { // column type
    title: string;
    dataIndex?: string;
    key?: string;
    slots?: {
        customRender: string;
    };
    children?: Array<{ title: string; dataIndex: string; key: string; }>;
    className?: string;
    align?: string;
    width?: string | number;
    customRender?: (data: { index: number, text: string | number, record: T}) => void;
    fixed?: string;
    ellipsis?: boolean
}

// 搜索字段值类型
export type SearchFieldValue = string | number | null | undefined;

// 搜索选项基础接口
interface BaseSearchOption {
    label: string;
    optionsArr?: Array<{ value: string | null | number; label: string }> | ComputedRef<Array<{ value: string | null | number; label: string }>>;
    props?: Record<string, unknown>;
    timeFormat?: string;
}

// 输入框搜索选项
export interface InputSearchOption extends BaseSearchOption {
    type: 'input';
    modelKey: string;
    value?: string | null;
}

// 下拉选择搜索选项
export interface SelectSearchOption extends BaseSearchOption {
    type: 'select';
    modelKey: string;
    value?: string | number | null;
}

// 日期范围搜索选项 - 使用索引签名支持动态属性
export interface DateRangeSearchOption extends BaseSearchOption {
    type: 'date';
    modelKey: string[]; // 两个字段的数组
    [key: string]: SearchFieldValue | string[] | BaseSearchOption['label'] | BaseSearchOption['optionsArr'] | BaseSearchOption['props'] | BaseSearchOption['timeFormat'] | BaseSearchOption['type'];
}

// 单日期搜索选项
export interface DateSingleSearchOption extends BaseSearchOption {
    type: 'date-single';
    modelKey: string;
    value?: string | null;
}

// 联合类型
export type SearchOption = InputSearchOption | SelectSearchOption | DateRangeSearchOption | DateSingleSearchOption;

// 搜索参数类型
export type SearchParams = Record<string, SearchFieldValue>;
