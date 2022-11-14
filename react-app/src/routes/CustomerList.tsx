import {
    EuiDataGrid,
    EuiDataGridColumn,
    EuiPageTemplate,
    EuiText,
    EuiTextColor,
    EuiTitle,
} from '@elastic/eui';
import React, {
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { getRefreshToken } from '../api/Authentication';

const columns: EuiDataGridColumn[] = [
    {
        id: 'id',
    },
    {
        id: 'name',
    },
    {
        id: 'tax_id',
    },
    {
        id: 'address',
    },
];

const fetchCustomer = async ({
    pageIndex,
    pageSize,
}: {
    pageIndex?: number;
    pageSize?: number;
}): Promise<Array<{ [key: string]: ReactNode }> | undefined> => {
    let baseUrl = '/api/v1/customer';
    // if there is pageINdex then append page= to the url also if there is pageSize then append page_size=
    if (pageIndex !== undefined && pageSize !== undefined) {
        // because the page index starts at 0 but the api starts at 1
        baseUrl += `?page=${pageIndex + 1}`;
        if (pageSize) {
            baseUrl += `&page_size=${pageSize}`;
        }
    }
    console.log(baseUrl);
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
            window.location.href = '/login';
            return;
        }
    }
};

const CustomerList = () => {
    const [rData, setData] = useState<Array<{ [key: string]: ReactNode }>>([
    ]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [fetchedPage, setFetchedPage] = useState<number[]>([]);

    const onChangeItemsPerPage = useCallback(
        (pageSize: number) =>
            // fetch the data again with the new page size
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
        const fetchData = async () => {
            const data = await fetchCustomer(pagination);
            if (data) {
                // make sure that the data is not duplicated
                setData((rData) => [...rData, ...data]);
            }
        };
        // check if the pagination.pageIndex is in the fetchedPage array
        if (!fetchedPage.includes(pagination.pageIndex)) {
            fetchData();
            setFetchedPage((fetchedPage) => [
                ...fetchedPage,
                pagination.pageIndex,
            ]);
            console.log('fetching again');
        }
        console.log(rData)
    }, [pagination, fetchedPage, rData]);

    return (
        <>
            <EuiPageTemplate.Section style={{ height: 0 }}>
                <EuiTitle size='l'>
                    <h1>Customer List</h1>
                </EuiTitle>
                <EuiText>
                    <EuiTextColor color='subdued'>
                        <p>
                            In this page you can see, add, edit and delete
                            customers.
                        </p>
                    </EuiTextColor>
                </EuiText>
            </EuiPageTemplate.Section>
            <EuiPageTemplate.Section>
                <EuiDataGrid
                    aria-label='Customer List'
                    columns={columns}
                    columnVisibility={{
                        visibleColumns,
                        setVisibleColumns,
                    }}
                    height={550}
                    rowCount={20}
                    renderCellValue={renderCellValue}
                    sorting={{ columns: sortingColumns, onSort }}
                    inMemory={{ level: 'sorting' }}
                    pagination={{
                        ...pagination,
                        pageSizeOptions: [10, 20, 50],
                        onChangeItemsPerPage: onChangeItemsPerPage,
                        onChangePage: onChangePage,
                        pageSize: pagination.pageSize,
                        pageIndex: pagination.pageIndex,
                    }}
                />
            </EuiPageTemplate.Section>
        </>
    );
};

export default CustomerList;
