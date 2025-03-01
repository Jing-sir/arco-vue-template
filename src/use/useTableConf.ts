import { getCurrentInstance, reactive, ref, watch } from 'vue';
import { PagingDefaultConf } from '@/utils/constant';
import { throttleFunc } from '@/utils/common';

export default function useTableConf(fetchTableDataCallback: () => void) {
    const isLoading = ref(false);
    const paginationConfig = reactive({ ...PagingDefaultConf }); // 分页信息

    const onSizeChange = (val: number): void => { // 切换每页数量
        paginationConfig.current = val;
        fetchTableDataCallback();
    };

    const onPageSizeChange = (val: number): void => {
        paginationConfig.pageSize = val;
        fetchTableDataCallback();
    }

    const onSearch = () => {
        paginationConfig.current = 1;
        throttledSearch();
    };

    const updatePagination = (pageNo: number, pageSize: number, totalSize: number) => {
        paginationConfig.current = pageNo;
        paginationConfig.pageSize = pageSize;
        paginationConfig.total = totalSize;
    };

    // 使用截流函数创建一个截流后的搜索函数
    const throttledSearch = throttleFunc(() => {
        if (typeof fetchTableDataCallback === 'function') {
            fetchTableDataCallback();
        }
    },  800);

    return {
        onSearch,
        isLoading,
        onSizeChange,
        onPageSizeChange,
        updatePagination,
        paginationConfig,
    };
}
