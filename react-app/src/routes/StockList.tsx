import {
    EuiDataGrid,
    EuiDataGridColumn,
    EuiPageTemplate,
    EuiText,
    EuiTextColor,
    EuiTitle,
} from '@elastic/eui';
import {
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRefreshToken } from '../api/Authentication';

const columns: EuiDataGridColumn[] = [
    {
        id: 'variant_name',
        initialWidth: 300,
        displayAsText: 'Variant Name',
    },
    {
        id: 'batch_id',
        displayAsText: 'Batch ID',
        initialWidth: 200
    },
    {
        id: 'quantity',
        displayAsText: 'Quantity',
    },
    {
        id: 'expired_date',
        displayAsText: 'Expired Date',
    },
];

const StockList = () => {
    let navigate = useNavigate();
    let location = useLocation();
    const [rData, setData] = useState<Array<{ [key: string]: ReactNode }>>([]);
    const [paginationCity, setPaginationCity] = useState({
        pageIndex: 0,
        pageSize: 20,
    });
    const [fetchedPageCity, setFetchedPageCity] = useState<number[]>([]);

    const fetchStock = async (): Promise<Array<{ [key: string]: ReactNode }> | undefined> => {
        let baseUrl = '/api/v1/inventory/stock';
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
                navigate('/login', { state: { from: location.pathname }, replace: true });
                return
            }

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
                navigate('/login', { state: { from: location.pathname }, replace: true });
                return
            }
        }
    }

    const onChangeItemsPerPage = useCallback(
        (pageSize: number) =>
            setPaginationCity((pagination) => ({
                ...pagination,
                pageSize,
                pageIndex: 0,
            })),
        [setPaginationCity]
    );

    const onChangePage = useCallback(
        async (pageIndex: number) => {
            setPaginationCity((pagination) => ({
                ...pagination,
                pageIndex,
            }));
        },
        [setPaginationCity]
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
            const data = await fetchStock();
            if (data) {
                setData((rData) => [...rData, ...data]);
            }
        };
        // check if the pagination.pageIndex is in the fetchedPage array so the data is not duplicated
        if (!fetchedPageCity.includes(paginationCity.pageIndex)) {
            fetchData();
            setFetchedPageCity((fetchedPage) => [
                ...fetchedPage,
                paginationCity.pageIndex,
            ]);
            console.log('fetching again');
        }
        console.log(rData);
    }, [paginationCity, fetchedPageCity, rData]);

    return (
        <>
            <EuiPageTemplate.Section style={{ height: 0 }}>
                <EuiTitle size='l'>
                    <h1>Inventory List</h1>
                </EuiTitle>
                <EuiText>
                    <EuiTextColor color='subdued'>
                        <p>
                            In this page you only can see
                            sum of Inventory List
                        </p>
                    </EuiTextColor>
                </EuiText>
            </EuiPageTemplate.Section>
            <EuiPageTemplate.Section>
                <EuiDataGrid
                    aria-label='City List'
                    columns={columns}
                    columnVisibility={{
                        visibleColumns,
                        setVisibleColumns,
                    }}
                    height={550}
                    rowCount={rData.length}
                    renderCellValue={renderCellValue}
                    sorting={{ columns: sortingColumns, onSort }}
                    inMemory={{ level: 'sorting' }}
                    pagination={{
                        ...paginationCity,
                        pageSizeOptions: [10, 20, 50],
                        onChangeItemsPerPage: onChangeItemsPerPage,
                        onChangePage: onChangePage,
                        pageSize: paginationCity.pageSize,
                        pageIndex: paginationCity.pageIndex,
                    }}
                />
            </EuiPageTemplate.Section>
        </>
    );
};

export default StockList;
