import {
    EuiButtonIcon,
    EuiDataGrid,
    EuiDataGridCellValueElementProps,
    EuiDataGridColumn,
    EuiDataGridControlColumn,
    EuiDescriptionList,
    EuiDescriptionListDescription,
    EuiDescriptionListTitle,
    EuiFlexGroup,
    EuiFlexItem,
    EuiFlyout,
    EuiFlyoutBody,
    EuiFlyoutHeader,
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

const trailingControlColumns: EuiDataGridControlColumn[] = [
    {
        id: 'actions',
        width: 40,
        headerCellRender: () => null,
        rowCellRender: function RowCellRender() {
            const [isPopoverOpen, setIsPopoverOpen] = useState(false);
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
                            <button onClick={() => {}}>
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
                </div>
            );
        },
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

    const FlyoutRowCell = (rowIndex: EuiDataGridCellValueElementProps) => {
        let flyout;
        const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
        if (isFlyoutOpen) {
            const rowData = rData[rowIndex.rowIndex as number];
            console.log(rowData.id);


            const details = Object.entries(rowData).map(([key, value]) => {
                return (
                    <Fragment>
                        <EuiDescriptionListTitle>{key}</EuiDescriptionListTitle>
                        <EuiDescriptionListDescription>
                            {value}
                        </EuiDescriptionListDescription>
                    </Fragment>
                );
            });

            flyout = (
                <EuiPortal>
                    <EuiFlyout
                        ownFocus
                        onClose={() => setIsFlyoutOpen(!isFlyoutOpen)}
                    >
                        <EuiFlyoutHeader hasBorder>
                            <EuiTitle size='m'>
                                <h2>{rowData.name}</h2>
                            </EuiTitle>
                        </EuiFlyoutHeader>
                        <EuiFlyoutBody>
                            <EuiDescriptionList>{details}</EuiDescriptionList>
                        </EuiFlyoutBody>
                    </EuiFlyout>
                </EuiPortal>
            );
        }

        return (
            <Fragment>
                <EuiButtonIcon
                    color='text'
                    iconType='eye'
                    iconSize='s'
                    aria-label='View details'
                    onClick={() => setIsFlyoutOpen(!isFlyoutOpen)}
                />
                {flyout}
            </Fragment>
        );
    };
    const leadingControlColumns:EuiDataGridControlColumn[] = [
        {
            id: 'view',
            width: 36,
            headerCellRender: () => null,
            rowCellRender: FlyoutRowCell
        }
    ]

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
        const fetchData = async () => {
            const data = await fetchCustomer(pagination);
            if (data) {
                setData((rData) => [...rData, ...data]);
            }
        };
        // check if the pagination.pageIndex is in the fetchedPage array so the data is not duplicated
        if (!fetchedPage.includes(pagination.pageIndex)) {
            fetchData();
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
                    leadingControlColumns={leadingControlColumns}
                    trailingControlColumns={trailingControlColumns}
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
