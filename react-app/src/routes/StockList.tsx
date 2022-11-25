import {
    EuiButtonIcon,
    EuiDataGrid,
    EuiDataGridColumn,
    EuiFlexGroup,
    EuiFlexItem,
    EuiGlobalToastList,
    EuiPageTemplate,
    EuiSpacer,
    EuiText,
    EuiTextColor,
    EuiTitle,
} from '@elastic/eui';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRefreshToken } from '../api/Authentication';
import useToast from '../hooks/useToast';

const columns: EuiDataGridColumn[] = [
    {
        id: 'variant_name',
        initialWidth: 300,
        displayAsText: 'Variant Name',
    },
    {
        id: 'batch_id',
        displayAsText: 'Batch ID',
        initialWidth: 200,
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
    const [alreadyFetched, setAlreadyFetched] = useState<boolean>(false);
    const { addToast, getAllToasts, getNewId, removeToast } = useToast();

    const fetchStock = async (): Promise<
        Array<{ [key: string]: ReactNode }> | undefined
    > => {
        let baseUrl = '/api/v1/inventory/stock';
        let time1 = performance.now();
        const res = await fetch(baseUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: sessionStorage.getItem('token') || '',
            },
        });
        if (res.status === 200) {
            let time2 = performance.now();
            const data = await res.json();
            addToast({
                id: getNewId(),
                title: 'Fully loaded',
                color: 'primary',
                text: <p>Took {(time2 - time1).toPrecision(2)}ms</p>,
            });
            return data;
        }
        if (res.status === 403 ) {
            navigate('/login', { state: { from: location } });
            return;
        }
        if (res.status === 401) {
            const state = await getRefreshToken();
            if (!state) {
                navigate('/login', {
                    state: { from: location.pathname },
                    replace: true,
                });
                return;
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
                let time2 = performance.now();
                addToast({
                    id: getNewId(),
                    title: 'Fully loaded',
                    color: 'primary',
                    text: <p>Took {(time2 - time1).toPrecision(2)}ms</p>,
                });
                return data;
            }
            if (retry.status === 401 || retry.status === 403) {
                navigate('/login', {
                    state: { from: location.pathname },
                    replace: true,
                });
                return;
            }
        }
    };

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
                // setData(data); data.expired_date map to localestring and data.quantity with thousand separator
                setData(
                    data.map((item: any) => {
                        return {
                            ...item,
                            expired_date: new Date(
                                item.expired_date
                            ).toLocaleDateString(),
                            // quantity: item.quantity.toLocaleString('id-ID'),
                            // we cant use toLocaleString because we can't sort it
                        };
                    })
                );
            }
        };
        if (!alreadyFetched) {
            fetchData();
            setFetchedPageCity((fetchedPage) => [
                ...fetchedPage,
                paginationCity.pageIndex,
            ]);
            setAlreadyFetched(true);
            console.log('fetching again');
        } // eslint-disable-next-line
    }, [paginationCity, fetchedPageCity, rData, alreadyFetched]);

    return (
        <>
            <EuiPageTemplate.Section>
                <EuiFlexGroup justifyContent='spaceBetween'>
                    <EuiFlexItem grow={false}>
                        <EuiTitle size='l'>
                            <h1>Inventory List</h1>
                        </EuiTitle>
                        <EuiText>
                            <EuiTextColor color='subdued'>
                                <p>
                                    In this page you only can see sum of
                                    Inventory List
                                </p>
                            </EuiTextColor>
                        </EuiText>
                    </EuiFlexItem>
                    <EuiButtonIcon
                        aria-label='refresh button'
                        iconType='refresh'
                        onClick={() => {
                            setAlreadyFetched(false);
                        }}
                        color='primary'
                        display='base'
                        size='m'
                    />
                </EuiFlexGroup>
                <EuiSpacer size='s' />
                <EuiDataGrid
                    aria-label='City List'
                    columns={columns}
                    columnVisibility={{
                        visibleColumns,
                        setVisibleColumns,
                    }}
                    height='calc(100vh - 270px)'
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
                <EuiGlobalToastList
                    toasts={getAllToasts()}
                    dismissToast={({ id }) => removeToast(id)}
                    toastLifeTimeMs={6000}
                />
            </EuiPageTemplate.Section>
        </>
    );
};

export default StockList;
