import { EuiDataGridColumn } from "@elastic/eui";
import { useState, ReactNode, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getRefreshToken } from "../api/Authentication";

const columns: EuiDataGridColumn[] = [
    {
        id: 'id',
        initialWidth: 50,
        displayAsText: 'ID',
    },
    {
        id: 'name',
        initialWidth: 250,
        displayAsText: 'Variant Name'
    },
    {
        id: 'description',
        displayAsText: 'Description',
    }
]

const VariantList = () => {
    let navigate = useNavigate();
    let location = useLocation();
    const [rData, setData] = useState<Array<{ [key: string]: ReactNode }>>([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 20,
    });
    const [fetchedPage, setFetchedPage] = useState<number[]>([]);
    const [variantCount, setVariantCount] = useState<number>(0);

    const fetchVariant = async ({
        pageIndex,
        pageSize,
        lastId,
    }: {
        pageIndex?: number;
        pageSize?: number;
        lastId?: number;
    }): Promise<Array<{ [key: string]: ReactNode }> | undefined> => {
        let baseUrl = '/api/v1/inventory/variant';
        // if there is pageINdex then append page= to the url also if there is pageSize then append page_size=
        if (pageIndex !== undefined && pageSize !== undefined) {
            // because the page index starts at 0 but the api starts at 1
            baseUrl += `?page=${pageIndex + 1}`;
            if (pageSize) {
                baseUrl += `&page_size=${pageSize}`;
            }
            if (lastId) {
                baseUrl += `&last_id=${lastId}`;
            }
        }
        const res = await fetch(baseUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: sessionStorage.getItem('token') || '',
            },
        });
        if (res.status === 200) {
            const data = await res.json();
            return data;
        }
        if (res.status === 401) {
            const state = await getRefreshToken();
            if (!state) {
                navigate('/login', { state: { from: location } });
                return;
            }
            // retry
            const retry = await fetch(baseUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: sessionStorage.getItem('token') || '',
                },
            });
            if (retry.status === 200) {
                const data = await retry.json();
                return data;
            }
            if (retry.status === 401) {
                navigate('/login', { state: { from: location.pathname } });
                return;
            }
        }
    };

    const fetchVariantCount = async (): Promise<number | undefined> => {
        let baseUrl = '/api/v1/inventory/variant-count';
        const res = await fetch(baseUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: sessionStorage.getItem('token') || '',
            },
        });
        if (res.status === 200) {
            const data = await res.json();
            return data.count;
        }
        if (res.status === 401) {
            const state = await getRefreshToken();
            if (!state) {
                navigate('/login', { state: { from: location } });
                return;
            }
            // retry
            const retry = await fetch(baseUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: sessionStorage.getItem('token') || '',
                },
            });
            if (retry.status === 200) {
                const data = await retry.json();
                return data.count;
            }
            if (retry.status === 401) {
                navigate('/login', { state: { from: location.pathname } });
                return;
            }
        }
    };

    const onChangeItemsPerPage = useCallback(
        (pageSize: number) =>
            setPagination((pagination) => ({
                ...pagination,
                pageSize,
                pageIndex: 0,
            })),
        [setPagination]
    );

    const onChangePage = useCallback(
        async (pageIndex: number) => {
            setPagination((pagination) => ({
                ...pagination,
                pageIndex,
            }));
        },
        [setPagination]
    );

    // Sorting
    const [sortingColumns, setSortingColumns] = useState([]);
    const onSort = useCallback(
        (sortingColumns: any) => {
            setSortingColumns(sortingColumns);
        },
        [setSortingColumns]
    );

    // Column visibility
    const [visibleColumns, setVisibleColumns] = useState(
        columns.map(({ id }) => id)
    );

    const renderCellValue = useMemo(() => {
        return ({
            rowIndex,
            columnId,
        }: {
            rowIndex: number;
            columnId: string;
        }) => {
            return rData.hasOwnProperty(rowIndex)
                ? rData[rowIndex][columnId]
                : null;
        };
    }, [rData]);

    useEffect(() => {
        // balancer for pagination,
        // if the last page is 1 and the use press page 3
        // balancer will set to 3 - 1 = 2
        let balancer: number;
        const fetchData = async (balancer: number) => {
            // const last_id is the last id of rData[rowIndex.rowIndex as number].id as number but if rData is empty then it is 0
            const last_id =
                rData.length > 0 ? (rData[rData.length - 1].id as number) : 0;
            const count = await fetchVariantCount();
            const data = await fetchVariant({
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize * balancer,
                lastId: last_id,
            });
            if (data) {
                setData((rData) => [...rData, ...data]);
                if (count) {
                    setVariantCount(count);
                }
            }
        };
        // check if the pagination.pageIndex is in the fetchedPage array so the data is not duplicated
        if (!fetchedPage.includes(pagination.pageIndex)) {
            // check the pagination.pageIndex is greater than the last page
            // then set the balancer to pagination.pageIndex - lastpage of the fetchedPage array
            if (pagination.pageIndex > fetchedPage[fetchedPage.length - 1]) {
                balancer =
                    pagination.pageIndex - fetchedPage[fetchedPage.length - 1];
            } else {
                balancer = 1;
            }
            fetchData(balancer);
            setFetchedPage((fetchedPage) => [
                ...fetchedPage,
                pagination.pageIndex,
            ]);
            console.log('fetching again');
        }
        console.log(rData);
        // eslint-disable-next-line
    }, [pagination, fetchedPage, rData]);
}