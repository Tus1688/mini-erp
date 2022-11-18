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
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    fetchProductionDraft,
    fetchProductionDraftCount,
} from '../api/ProductionDraft';
import ProductionDraftApprove from '../components/ProductionDraftApprove';
import ProductionDraftDelete from '../components/ProductionDraftDelete';

const columns: EuiDataGridColumn[] = [
    {
        id: 'id',
        initialWidth: 50,
        displayAsText: 'ID',
    },
    {
        id: 'variant_name',
        initialWidth: 300,
        displayAsText: 'Variant Name',
    },
    {
        id: 'batch_id',
        initialWidth: 200,
        displayAsText: 'Batch ID',
    },
    {
        id: 'quantity',
        initialWidth: 300,
        displayAsText: 'Quantity',
    },
    {
        id: 'created_at',
        displayAsText: 'Created At',
    },
];

const ProductionDraftList = () => {
    let navigate = useNavigate();
    let location = useLocation();
    const [rData, setData] = useState<Array<{ [key: string]: ReactNode }>>([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 20,
    });
    const [fetchedPage, setFetchedPage] = useState<number[]>([]);
    const [draftCount, setDraftCount] = useState<number>(0);

    const RowCellRender = (rowIndex: EuiDataGridCellValueElementProps) => {
        const [isPopoverOpen, setIsPopoverOpen] = useState(false);
        const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
        const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
        const [isInventoryAdmin, setIsInventoryAdmin] = useState(false);

        useEffect(() => {
            setIsInventoryAdmin(sessionStorage.getItem('inv_a') === 'true');
        }, []);

        return (
            <>
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
                    {!isInventoryAdmin ? (
                        <EuiText size='s' style={{ width: 150 }}>
                            <p>
                                Sorry, You are not authorized to perform this
                                action
                            </p>
                        </EuiText>
                    ) : (
                        <div style={{ width: 150 }}>
                            <button
                                onClick={() => {
                                    setIsApproveModalOpen(true);
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
                                            aria-label='Approve'
                                            iconType='check'
                                            color='text'
                                        />
                                    </EuiFlexItem>
                                    <EuiFlexItem>Approve</EuiFlexItem>
                                </EuiFlexGroup>
                            </button>
                            <EuiSpacer size='s' />
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(true);
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
                    )}
                </EuiPopover>
                {isDeleteModalOpen && (
                    <ProductionDraftDelete
                        toggleModal={setIsDeleteModalOpen}
                        id={rData[rowIndex.rowIndex as number].id as number}
                        setFetchedPage={setFetchedPage}
                        setPagination={setPagination}
                        setData={setData}
                    />
                )}
                {isApproveModalOpen && (
                    <ProductionDraftApprove
                        toggleModal={setIsApproveModalOpen}
                        id={rData[rowIndex.rowIndex as number].id as number}
                        setFetchedPage={setFetchedPage}
                        setPagination={setPagination}
                        setData={setData}
                    />
                )}
            </>
        );
    };

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
        let balancer: number;
        const fetchData = async (balancer: number) => {
            const last_id =
                rData.length > 0 ? (rData[rData.length - 1].id as number) : 0;
            const count = await fetchProductionDraftCount({
                location: location,
                navigate: navigate,
            });
            const data = await fetchProductionDraft({
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize * balancer,
                lastId: last_id,
                location: location,
                navigate: navigate,
            });
            if (data) {
                setData((rData) => [...rData, ...data]);
                if (count) {
                    setDraftCount(count);
                }
            }
        };
        if (!fetchedPage.includes(pagination.pageIndex)) {
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
    }, [pagination, fetchedPage, rData, location, navigate]);

    return (
        <>
            <EuiPageTemplate.Section style={{ height: 0 }}>
                <EuiFlexGroup justifyContent='spaceBetween'>
                    <EuiFlexItem grow={false}>
                        <EuiTitle size='l'>
                            <h1>Production Draft</h1>
                        </EuiTitle>
                        <EuiText>
                            <EuiTextColor color='subdued'>
                                <p>
                                    In this page you can delete / approve
                                    production draft.
                                </p>
                            </EuiTextColor>
                        </EuiText>
                    </EuiFlexItem>
                    <EuiButton
                        iconType='refresh'
                        iconSide='right'
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
                    aria-label='Production Draft List'
                    columns={columns}
                    columnVisibility={{
                        visibleColumns,
                        setVisibleColumns,
                    }}
                    height={550}
                    rowCount={draftCount}
                    renderCellValue={renderCellValue}
                    sorting={{ columns: sortingColumns, onSort }}
                    inMemory={{ level: 'sorting' }}
                    pagination={{
                        ...pagination,
                        onChangeItemsPerPage: onChangeItemsPerPage,
                        onChangePage: onChangePage,
                        pageSize: pagination.pageSize,
                        pageIndex: pagination.pageIndex,
                    }}
                    trailingControlColumns={trailingControlColumns}
                />
            </EuiPageTemplate.Section>
        </>
    );
};

export default ProductionDraftList;
