import {
    EuiButton,
    EuiButtonIcon,
    EuiConfirmModal,
    EuiDataGrid,
    EuiDataGridCellValueElementProps,
    EuiDataGridColumn,
    EuiDataGridControlColumn,
    EuiDescriptionList,
    EuiFlexGroup,
    EuiFlexItem,
    EuiFlyout,
    EuiFlyoutBody,
    EuiFlyoutHeader,
    EuiGlobalToastList,
    EuiPageTemplate,
    EuiPopover,
    EuiPopoverTitle,
    EuiPortal,
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
import FlyoutDescriptionList from '../components/FlyoutDescriptionList';
import useToast from '../hooks/useToast';
import { customerSpecific } from '../type/Customer';

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

const DeleteModal = ({
    id,
    toggleModal,
}: {
    id: number;
    toggleModal: (value: React.SetStateAction<boolean>) => void;
}) => {
    let location = useLocation();
    let navigate = useNavigate();

    const { addToast, getAllToasts, removeToast, getNewId } = useToast();

    const deleteCustomer = async (id: number) => {
        const res = await fetch(`api/v1/customer?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: sessionStorage.getItem('token') || '',
            },
        });
        if (res.status === 409) {
            let data = await res.json();

            addToast({
                id: getNewId(),
                title: 'Error',
                color: 'danger',
                text: (
                    <>
                        <p>{data.error}</p>
                    </>
                ),
            });
            return;
        }
        if (res.status === 200) {
            toggleModal(false);
            return;
        }
        if (res.status === 401) {
            const state = getRefreshToken();
            if (!state) {
                navigate('/login', { state: { from: location } });
                return;
            }
            const retry = await fetch(`api/v1/customer?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: sessionStorage.getItem('token') || '',
                },
            });
            if (retry.status === 200) {
                toggleModal(false);
                return;
            }
            if (retry.status === 409) {
                let data = await retry.json();

                addToast({
                    id: getNewId(),
                    title: 'Error',
                    color: 'danger',
                    text: (
                        <>
                            <p>{data.error}</p>
                        </>
                    ),
                });
                return;
            }
            if (retry.status === 401) {
                navigate('/login', { state: { from: location } });
                return;
            }
        }
    };

    return (
        <>
            <EuiConfirmModal
                title='Delete customer'
                onCancel={() => toggleModal(false)}
                onConfirm={() => deleteCustomer(id)}
                cancelButtonText='Cancel'
                confirmButtonText='Yes, delete it'
                buttonColor='danger'
                defaultFocusedButton='confirm'
            >
                <p>
                    You&rsquo;re about to delete customer
                    <br />
                    Are you sure you want to do this?
                </p>
            </EuiConfirmModal>
            <EuiGlobalToastList
                toasts={getAllToasts()}
                dismissToast={({ id }) => removeToast(id)}
                toastLifeTimeMs={6000}
            />
        </>
    );
};

const CustomerFlyout = ({
    id,
    toggleFlyout,
}: {
    id: number;
    toggleFlyout: (value: React.SetStateAction<boolean>) => void;
}) => {
    let location = useLocation();
    let navigate = useNavigate();
    const [data, setData] = useState<customerSpecific>();

    const fetchCustomerSpecific = async (
        id: number
    ): Promise<customerSpecific | undefined> => {
        let baseUrl = `/api/v1/customer?id=${id}`;
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
                navigate('/login', { state: { from: location.pathname } });
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

    useEffect(() => {
        fetchCustomerSpecific(id).then((data) => {
            setData(data);
        });
    }, [id]);

    return (
        <EuiPortal>
            <EuiFlyout ownFocus onClose={() => toggleFlyout(false)}>
                <EuiFlyoutHeader hasBorder>
                    <EuiTitle size='m'>
                        <h2>{data?.name}'s details</h2>
                    </EuiTitle>
                </EuiFlyoutHeader>
                <EuiFlyoutBody>
                    <EuiDescriptionList>
                        <FlyoutDescriptionList
                            title='ID'
                            description={data?.id}
                        />
                        <FlyoutDescriptionList
                            title='Name'
                            description={data?.name}
                        />
                        <FlyoutDescriptionList
                            title='Tax ID'
                            description={data?.tax_id}
                        />
                        <FlyoutDescriptionList
                            title='Address'
                            description={data?.address}
                        />
                        <FlyoutDescriptionList
                            title='City'
                            description={data?.city_name}
                        />
                        <FlyoutDescriptionList
                            title='Province'
                            description={data?.province_name}
                        />
                        <FlyoutDescriptionList
                            title='Country'
                            description={data?.country_name}
                        />
                    </EuiDescriptionList>
                </EuiFlyoutBody>
            </EuiFlyout>
        </EuiPortal>
    );
};

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
        lastId
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

    const fetchCustomerCount = async (): Promise<number | undefined>  => {
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
    }

    const FlyoutRowCell = (rowIndex: EuiDataGridCellValueElementProps) => {
        const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);

        return (
            <Fragment>
                <EuiButtonIcon
                    color='text'
                    iconType='eye'
                    iconSize='s'
                    aria-label='View details'
                    onClick={() => setIsFlyoutOpen(!isFlyoutOpen)}
                />
                {isFlyoutOpen ? (
                    <CustomerFlyout
                        id={rData[rowIndex.rowIndex as number].id as number}
                        toggleFlyout={setIsFlyoutOpen}
                    />
                ) : null}
            </Fragment>
        );
    };

    const RowCellRender = (rowIndex: EuiDataGridCellValueElementProps) => {
        const [isPopoverOpen, setIsPopoverOpen] = useState(false);
        const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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
                        <button onClick={() => {}}>
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
                    <DeleteModal
                        toggleModal={setDeleteModalOpen}
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
            rowCellRender: FlyoutRowCell,
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
            const last_id = rData.length > 0 ? rData[rData.length - 1].id as number: 0;
            const count = await fetchCustomerCount();
            const data = await fetchCustomer({pageIndex: pagination.pageIndex, pageSize: pagination.pageSize * balancer, lastId: last_id});
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
                balancer = pagination.pageIndex - fetchedPage[fetchedPage.length - 1];
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
                            })
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
