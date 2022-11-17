import {
    EuiButton,
    EuiButtonIcon,
    EuiDataGrid,
    EuiDataGridCellValueElementProps,
    EuiDataGridColumn,
    EuiDataGridControlColumn,
    EuiFlexGroup,
    EuiFlexItem,
    EuiPageTemplate,
    EuiPopover,
    EuiPopoverTitle,
    EuiSpacer,
    EuiText,
    EuiTextColor,
    EuiTitle,
} from '@elastic/eui';
import React, {
    Fragment,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getRefreshToken } from '../api/Authentication';
import CustomerDeleteModal from '../components/CustomerDelete';
import CustomerEditModal from '../components/CustomerEdit';
import CustomerModal from '../components/CustomerModal';

const columns: EuiDataGridColumn[] = [
    {
        id: 'id',
        initialWidth: 50,
        displayAsText: 'ID',
    },
    {
        id: 'name',
        initialWidth: 250,
        displayAsText: 'Name',
    },
    {
        id: 'tax_id',
        initialWidth: 200,
        displayAsText: 'Tax ID',
    },
    {
        id: 'address',
        displayAsText: 'Address',
    },
];

const CustomerList = () => {
    let navigate = useNavigate();
    let location = useLocation();
    const [rData, setData] = useState<Array<{ [key: string]: ReactNode }>>([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 20,
    });
    const [fetchedPage, setFetchedPage] = useState<number[]>([]);
    const [customerCount, setCustomerCount] = useState<number>(20);

    const fetchCustomer = async ({
        pageIndex,
        pageSize,
        lastId,
    }: {
        pageIndex?: number;
        pageSize?: number;
        lastId?: number;
    }): Promise<Array<{ [key: string]: ReactNode }> | undefined> => {
        let baseUrl = '/api/v1/customer';
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

    const fetchCustomerCount = async (): Promise<number | undefined> => {
        let baseUrl = '/api/v1/customer-count';
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
                    <CustomerModal
                        id={rData[rowIndex.rowIndex as number].id as number}
                        toggleModal={setIsModalOpen}
                        />
                ) : null}
            </Fragment>
        );
    };

    const RowCellRender = (rowIndex: EuiDataGridCellValueElementProps) => {
        const [isPopoverOpen, setIsPopoverOpen] = useState(false);
        const [deleteModalOpen, setDeleteModalOpen] = useState(false);
        const [editModalOpen, setEditModalOpen] = useState(false);

        return (
            <div>
                <EuiPopover
                    isOpen={isPopoverOpen}
                    anchorPosition='upCenter'
                    panelPaddingSize='s'
                    button={
                        <EuiButtonIcon
                            aria-label='show actions'
                            iconType='boxesHorizontal'
                            color='text'
                            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                        />
                    }
                    closePopover={() => setIsPopoverOpen(false)}
                >
                    <EuiPopoverTitle>Actions</EuiPopoverTitle>
                    <div style={{ width: 150 }}>
                        {/* get selected id */}
                        <button
                            onClick={() => {
                                setEditModalOpen(!editModalOpen);
                                setIsPopoverOpen(false);
                            }}
                        >
                            <EuiFlexGroup
                                alignItems='center'
                                component='span'
                                gutterSize='s'
                            >
                                <EuiFlexItem grow={false}>
                                    <EuiButtonIcon
                                        aria-label='edit'
                                        iconType='indexEdit'
                                        color='text'
                                    />
                                </EuiFlexItem>
                                <EuiFlexItem>Edit</EuiFlexItem>
                            </EuiFlexGroup>
                        </button>
                        <EuiSpacer size='s' />
                        <button
                            onClick={() => {
                                setDeleteModalOpen(!deleteModalOpen);
                                setIsPopoverOpen(false);
                            }}
                        >
                            <EuiFlexGroup
                                alignItems='center'
                                component='span'
                                gutterSize='s'
                            >
                                <EuiFlexItem grow={false}>
                                    <EuiButtonIcon
                                        aria-label='delete'
                                        iconType='trash'
                                        color='text'
                                    />
                                </EuiFlexItem>
                                <EuiFlexItem>Delete</EuiFlexItem>
                            </EuiFlexGroup>
                        </button>
                    </div>
                </EuiPopover>
                {deleteModalOpen ? (
                    <CustomerDeleteModal
                        toggleModal={setDeleteModalOpen}
                        id={rData[rowIndex.rowIndex as number].id as number}
                        setFetchedPage={setFetchedPage}
                        setPagination={setPagination}
                        setData={setData}
                    />
                ) : null}
                {editModalOpen ? (
                    <CustomerEditModal
                        toggleModal={setEditModalOpen}
                        id={rData[rowIndex.rowIndex as number].id as number}
                    />
                ) : null}
            </div>
        );
    };

    const leadingControlColumns: EuiDataGridControlColumn[] = [
        {
            id: 'view',
            width: 36,
            headerCellRender: () => null,
            rowCellRender: EyeRowCell,
        },
    ];

    const trailingControlColumns: EuiDataGridControlColumn[] = [
        {
            id: 'actions',
            width: 40,
            headerCellRender: () => null,
            rowCellRender: RowCellRender,
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
            const count = await fetchCustomerCount();
            const data = await fetchCustomer({
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize * balancer,
                lastId: last_id,
            });
            if (data) {
                setData((rData) => [...rData, ...data]);
                if (count) {
                    setCustomerCount(count);
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
    }, [pagination, fetchedPage, rData]);

    return (
        <>
            <EuiPageTemplate.Section style={{ height: 0 }}>
                <EuiFlexGroup justifyContent='spaceBetween'>
                    <EuiFlexItem grow={false}>
                        <EuiTitle size='l'>
                            <h1>Customer List</h1>
                        </EuiTitle>
                        <EuiText>
                            <EuiTextColor color='subdued'>
                                <p>
                                    In this page you can see, add, edit and
                                    delete customers.
                                </p>
                            </EuiTextColor>
                        </EuiText>
                    </EuiFlexItem>
                    <EuiButton
                        iconType={'refresh'}
                        iconSide='right'
                        // onclick setfetchedpage to empty array
                        onClick={() => {
                            setFetchedPage([]);
                            setData([]);
                            setPagination({
                                pageIndex: 0,
                                pageSize: 20,
                            });
                        }}
                    >
                        Refresh
                    </EuiButton>
                </EuiFlexGroup>
            </EuiPageTemplate.Section>
            <EuiPageTemplate.Section>
                <EuiDataGrid
                    aria-label='Customer List'
                    leadingControlColumns={leadingControlColumns}
                    trailingControlColumns={trailingControlColumns}
                    columns={columns}
                    columnVisibility={{
                        visibleColumns,
                        setVisibleColumns,
                    }}
                    height={550}
                    rowCount={customerCount}
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

export default CustomerList;