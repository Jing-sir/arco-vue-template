import { onBeforeMount, reactive, ref, toRaw } from 'vue';
import NProgress from 'nprogress';
import { ColumnType } from '@/interface/StateType';
import allToRaw from '@/utils/allToRaw';

export interface ResponseType {
    pageNo: number;
    pageSize: number;
    totalPages: number;
    totalSize: number;
}

type TableQuery = {
    pageNo: number;
    pageSize: number;
};

type IService<Response, Params extends Record<string, unknown>> = (
    params: Params & TableQuery
) => Promise<Response>;

interface IResponse<ListItem = unknown> extends ResponseType {
    list: ListItem[];
}

interface IOptions {
    columns?: ColumnType[];
    manual?: boolean;
}

export default function useFetchTableData<
    Response extends IResponse,
    Params extends Record<string, unknown> = Record<string, never>,
>(service: IService<Response, Params>, options: IOptions = {}) {
    const { columns = [], manual = false } = options;
    const filterKeys = toRaw(columns)
        .filter((item) => typeof item.dataIndex === 'string')
        .map((item) => item.dataIndex as string);
    const defaultColumns = ref<ColumnType[]>(columns);
    const pagination = reactive<{
        pageNo: number;
        pageSize: number;
        pageTotal: number;
    }>({
        pageNo: 1,
        pageSize: 10,
        pageTotal: 0,
    });

    const dataSource = ref<Response['list']>([] as unknown as Response['list']);
    const loading = ref<boolean>(false);

    const runAsync = async (params: Params = {} as Params): Promise<void> => {
        if (loading.value) return;
        NProgress.start();
        loading.value = true;
        const { pageNo, pageSize } = toRaw(pagination);

        const { list, totalSize } = await service({
            ...allToRaw(params),
            pageNo,
            pageSize,
        }).finally(() => {
            loading.value = false;
            NProgress.done();
        });

        dataSource.value = list;
        pagination.pageTotal = totalSize;
    };

    const resetAndLoad = (params: Params = {} as Params): void => {
        pagination.pageNo = 1;
        runAsync(params).then();
    };

    onBeforeMount(async () => {
        if (manual) return;
        await runAsync();
    });

    const filterColumns = (keys?: string[]): void => {
        if (!keys) {
            defaultColumns.value = columns;
        } else {
            defaultColumns.value = columns.filter(
                (item) => !item.dataIndex || keys.includes(item.dataIndex),
            );
        }
    };

    return {
        loading,
        runAsync,
        pagination,
        dataSource,
        resetAndLoad,
        filterKeys,
        columns: defaultColumns,
        filterColumns,
    };
}
