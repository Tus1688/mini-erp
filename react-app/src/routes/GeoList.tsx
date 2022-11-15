import {
    EuiButtonIcon,
    EuiDataGrid,
    EuiDataGridColumn,
    EuiDataGridControlColumn,
    EuiFlexGroup,
    EuiFlexItem,
    EuiPageTemplate,
    EuiPopover,
    EuiPopoverTitle,
    EuiPortal,
    EuiSpacer,
    EuiText,
    EuiTextColor,
    EuiTitle,
} from '@elastic/eui';
import {
    Fragment,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRefreshToken } from '../api/Authentication';

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

const columns: EuiDataGridColumn[] = [
    {
        id: 'id',
        initialWidth: 50,
        displayAsText: 'ID',
    },
    {
        id: 'city_name',
        displayAsText: 'City Name',
    },
    {
        id: 'province_name',
        displayAsText: 'Province Name',
    },
    {
        id: 'country_name',
        displayAsText: 'Country Name',
    }
]

const GeoList = () => {
    let navigate = useNavigate();
    let location = useLocation();
    const [rData, setData] = useState<Array<{ [key: string]: ReactNode }>>([]);
    const [paginationCity, setPaginationCity] = useState({
        pageIndex: 0,
        pageSize: 20,
    });
    const [fetchedPageCity, setFetchedPageCity] = useState<number[]>([]);

    const fetchCity = async ({
        pageIndex,
        pageSize,
    }: {
        pageIndex?: number;
        pageSize?: number;
    }): Promise<Array < { [key: string]: ReactNode } > | undefined> => {
        let baseUrl = '/api/v1/geo/city';
        if (pageIndex !== undefined && pageSize !== undefined) {
            baseUrl += `?page=${pageIndex + 1}&page_size=${pageSize}`;
        }
        console.log(baseUrl);
        const res = await fetch(baseUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: sessionStorage.getItem('token') || '',
            }
        });
        if (res.status === 200) {
            const data = await res.json();
            return data;
        }
        if (res.status === 401) {
            const state = await getRefreshToken();
            if(!state) {
                navigate('/login', { state: { from: location.pathname }, replace: true });
                return;
            }
            const retry = await fetch(baseUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: sessionStorage.getItem('token') || '',
                }
            });
            if (retry.status === 200) {
                const data = await retry.json();
                return data;
            }
            if (retry.status === 401) {
                navigate('/login', { state: { from: location.pathname }, replace: true });
                return;
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
            const data = await fetchCity(paginationCity);
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
                    <h1>Location List</h1>
                </EuiTitle>
                <EuiText>
                    <EuiTextColor color='subdued'>
                        <p>
                            In this page you can see, add, edit and delete a Location List
                        </p>
                    </EuiTextColor>
                </EuiText>
            </EuiPageTemplate.Section>
            <EuiPageTemplate.Section>
                <EuiDataGrid
                    aria-label='City List'
                    trailingControlColumns={trailingControlColumns}
                    columns={columns}
                    columnVisibility={{
                        visibleColumns,
                        setVisibleColumns,
                    }}
                    height={550}
                    rowCount={18}
                    renderCellValue={renderCellValue}
                    sorting={{ columns: sortingColumns, onSort }}
                    inMemory={{ level: 'sorting' }}
                    pagination={{
                        ...paginationCity,
                        // pageSizeOptions: [10, 20, 50],
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

export default GeoList;
