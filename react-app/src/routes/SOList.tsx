import {
    EuiPageTemplate,
    EuiFlexGroup,
    EuiFlexItem,
    EuiTitle,
    EuiText,
    EuiTextColor,
    EuiButtonIcon,
    EuiDataGrid,
    EuiDataGridCellValueElementProps,
    EuiDataGridControlColumn,
    EuiDataGridColumn,
    EuiSpacer,
} from '@elastic/eui';
import {
    useState,
    ReactNode,
    Fragment,
    useCallback,
    useEffect,
    useMemo,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRefreshToken } from '../api/Authentication';
import SalesInvoiceModal from '../components/SalesInvoiceModal';

const columns: EuiDataGridColumn[] = [
    {
        id: 'id',
        initialWidth: 50,
        displayAsText: 'ID',
    },
    {
        id: 'customer_name',
        initialWidth: 250,
        displayAsText: 'Customer Name',
    },
    {
        id: 'top_name',
        initialWidth: 150,
        displayAsText: 'Term Of Payment',
    },
    {
        id: 'date',
        initialWidth: 200,
        displayAsText: 'Date',
    },
    {
        id: 'created_by',
        initialWidth: 150,
        displayAsText: 'Created By',
    },
    {
        id: 'total',
        displayAsText: 'Total',
    },
];

const SOList = () => {
    let navigate = useNavigate();
    let location = useLocation();
    const [rData, setData] = useState<Array<{ [key: string]: ReactNode }>>([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 20,
    });
    const [fetchedPage, setFetchedPage] = useState<number[]>([]);
    const [SOCount, setSOCount] = useState<number>(0);

    const fetchSO = async ({
        pageIndex,
        pageSize,
        lastId,
    }: {
        pageIndex?: number;
        pageSize?: number;
        lastId?: number;
    }): Promise<Array<{ [key: string]: ReactNode }> | undefined> => {
        let baseUrl = '/api/v1/finance/sales-invoice';
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
        if (res.status === 403) {
            navigate('/login', { state: { from: location } });
            return;
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
            if (retry.status === 401 || retry.status === 403) {
                navigate('/login', { state: { from: location.pathname } });
                return;
            }
        }
    };

    const fetchSOCount = async (): Promise<number | undefined> => {
        let baseUrl = '/api/v1/finance/sales-invoice-count';
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
        if (res.status === 403) {
            navigate('/login', { state: { from: location } });
            return;
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
            if (retry.status === 401 || retry.status === 403) {
                navigate('/login', { state: { from: location.pathname } });
                return;
            }
        }
    };

    const EyeRowCell = (rowIndex: EuiDataGridCellValueElementProps) => {
        const [isModalOpen, setIsModalOpen] = useState(false);

        return (
            <Fragment>
                <EuiButtonIcon
                    color='text'
                    iconType='eye'
                    iconSize='s'
                    aria-label='View details'
                    onClick={() => setIsModalOpen(!isModalOpen)}
                />
                {isModalOpen ? (
                    <SalesInvoiceModal
                        id={rData[rowIndex.rowIndex as number].id as number}
                        toggleModal={setIsModalOpen}
                    />
                ) : null}
            </Fragment>
        );
    };

    const trailingControlColumns: EuiDataGridControlColumn[] = [
        {
            id: 'view',
            width: 36,
            headerCellRender: () => null,
            rowCellRender: EyeRowCell,
        },
    ];

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
    const [sortingColumns, setSortingColumns] = useState<
        { id: string; direction: 'desc' | 'asc' }[]
    >([{ id: 'id', direction: 'asc' }]);
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
            const count = await fetchSOCount();
            const data = await fetchSO({
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize * balancer,
                lastId: last_id,
            });
            if (data) {
                // setData((rData) => [...rData, ...data]) and data.date map it to local string
                setData((rData) => [
                    ...rData,
                    ...data.map((d: any) => ({
                        ...d,
                        date: new Date(d.date).toLocaleDateString(),
                        total: 'Rp. ' + d.total.toLocaleString('id-ID'),
                    })),
                ]);
                if (count) {
                    setSOCount(count);
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

    return (
        <>
            <EuiPageTemplate.Section>
                <EuiFlexGroup justifyContent='spaceBetween'>
                    <EuiFlexItem grow={false}>
                        <EuiTitle size='l'>
                            <h1>Sales Invoices List</h1>
                        </EuiTitle>
                        <EuiText>
                            <EuiTextColor color='subdued'>
                                <p>
                                    In this page you can see, and print all the
                                    Sales Invoices.
                                </p>
                            </EuiTextColor>
                        </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                        <EuiFlexGroup direction='row'>
                            <EuiButtonIcon
                                aria-label='refresh button'
                                iconType='refresh'
                                onClick={() => {
                                    setFetchedPage([]);
                                    setData([]);
                                    setPagination({
                                        pageIndex: 0,
                                        pageSize: 20,
                                    });
                                }}
                                color='primary'
                                display='base'
                                size='m'
                            />
                        </EuiFlexGroup>
                    </EuiFlexItem>
                </EuiFlexGroup>
                <EuiSpacer size='s' />
                <EuiDataGrid
                    aria-label='Customer List'
                    trailingControlColumns={trailingControlColumns}
                    columns={columns}
                    columnVisibility={{
                        visibleColumns,
                        setVisibleColumns,
                    }}
                    height='calc(100vh - 270px)'
                    rowCount={SOCount}
                    renderCellValue={renderCellValue}
                    sorting={{ columns: sortingColumns, onSort }}
                    inMemory={{ level: 'sorting' }}
                    pagination={{
                        ...pagination,
                        // pageSizeOptions: [10, 20, 50],
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

export default SOList;
