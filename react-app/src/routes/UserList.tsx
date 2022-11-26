import {
    EuiBasicTable,
    EuiBasicTableColumn,
    EuiButton,
    EuiButtonIcon,
    EuiFlexGroup,
    EuiFlexItem,
    EuiHealth,
    EuiIcon,
    EuiPageTemplate,
    EuiSpacer,
    EuiTabbedContentProps,
    EuiText,
    EuiTextColor,
    EuiTitle,
} from '@elastic/eui';
import { Action } from '@elastic/eui/src/components/basic_table/action_types';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchUsers } from '../api/Users';
import RoleEditTab from '../components/RoleEditTab';
import StatusEditTab from '../components/StatusEditTab';
import UserCreateModal from '../components/UserCreate';
import UserEditModal from '../components/UserEditModal';
import { Users } from '../type/Users';

const UserList = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [modalCreateOpen, setModalCreateOpen] = useState(false);
    const [rData, setData] = useState<Users[]>([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 15,
    });
    const [selectedItems, setSelectedItems] = useState<Users>();
    const [editModalOpen, setEditModalOpen] = useState(false);

    const onTableChange = ({
        page,
    }: {
        page: { index: number; size: number };
    }) => {
        const { index, size } = page;
        setPagination({
            pageIndex: index,
            pageSize: size,
        });
    };

    const pageItems = (pageIndex: number, pageSize: number) => {
        const start = pageIndex * pageSize;
        const end = start + pageSize;
        return rData.slice(start, end);
    };

    const actions: Action<any>[] = [
        {
            name: 'Popover',
            description: 'Manage user',
            type: 'icon',
            icon: 'boxesHorizontal',
            onClick: (items: Users) => {
                setSelectedItems(items);
                setEditModalOpen(true);
            },
        },
    ];

    const columns: EuiBasicTableColumn<Users>[] = [
        {
            field: 'username',
            name: 'Username',
        },
        {
            field: 'fin_user',
            name: 'Finance User',
            render: (fin_user: boolean) => {
                return fin_user ? (
                    <EuiHealth color='success'>Yes</EuiHealth>
                ) : (
                    <EuiHealth color='danger'>No</EuiHealth>
                );
            },
        },
        {
            field: 'fin_admin',
            name: 'Finance Admin',
            render: (fin_admin: boolean) => {
                return fin_admin ? (
                    <EuiHealth color='success'>Yes</EuiHealth>
                ) : (
                    <EuiHealth color='danger'>No</EuiHealth>
                );
            },
        },
        {
            field: 'inv_user',
            name: 'Inventory User',
            render: (inv_user: boolean) => {
                return inv_user ? (
                    <EuiHealth color='success'>Yes</EuiHealth>
                ) : (
                    <EuiHealth color='danger'>No</EuiHealth>
                );
            },
        },
        {
            field: 'inv_admin',
            name: 'Inventory Admin',
            render: (inv_admin: boolean) => {
                return inv_admin ? (
                    <EuiHealth color='success'>Yes</EuiHealth>
                ) : (
                    <EuiHealth color='danger'>No</EuiHealth>
                );
            },
        },
        {
            field: 'sys_admin',
            name: 'System Admin',
            render: (sys_admin: boolean) => {
                return sys_admin ? (
                    <EuiHealth color='success'>Yes</EuiHealth>
                ) : (
                    <EuiHealth color='danger'>No</EuiHealth>
                );
            },
        },
        {
            field: 'active',
            name: 'Status',
            render: (active: boolean) => {
                return active ? (
                    <EuiHealth color='success'>Active</EuiHealth>
                ) : (
                    <EuiHealth color='danger'>Inactive</EuiHealth>
                );
            },
        },
        {
            actions,
            width: '40px',
        },
    ];

    const tabs: EuiTabbedContentProps['tabs'] = [
        {
            id: 'role',
            name: 'Edit role',
            prepend: <EuiIcon type='user' size='m' />,
            content: (
                <RoleEditTab
                    data={selectedItems}
                    toggleModal={setEditModalOpen}
                    setData={setData}
                />
            ),
        },
        {
            id: 'status',
            name: 'Edit status',
            prepend: <EuiIcon type='controlsHorizontal' size='m' />,
            content: (
                <StatusEditTab
                    data={selectedItems}
                    toggleModal={setEditModalOpen}
                    setData={setData}
                />
            )
        },
    ];

    useEffect(() => {
        console.log('useEffect called');
        fetchUsers({
            location: location,
            navigate: navigate,
        }).then((data) => {
            setData(data);
            console.log(data);
        });
    }, [location, navigate]);

    return (
        <>
            <EuiPageTemplate.Section>
                <EuiFlexGroup justifyContent='spaceBetween'>
                    <EuiFlexItem grow={false}>
                        <EuiTitle size='l'>
                            <h1>User List</h1>
                        </EuiTitle>
                        <EuiText>
                            <EuiTextColor color='subdued'>
                                <p>
                                    In this page you can see, add, edit and
                                    delete users.
                                </p>
                            </EuiTextColor>
                        </EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                        <EuiFlexGroup direction='row'>
                            <EuiButton
                                color='success'
                                iconType='plusInCircleFilled'
                                iconSide='right'
                                onClick={() =>
                                    setModalCreateOpen(!modalCreateOpen)
                                }
                            >
                                Create
                            </EuiButton>
                            <EuiButtonIcon
                                aria-label='refresh button'
                                iconType='refresh'
                                onClick={() => {
                                    // refresh the data
                                    fetchUsers({
                                        location: location,
                                        navigate: navigate,
                                    }).then((data) => {
                                        setData(data);
                                        console.log(data);
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
                <EuiBasicTable
                    items={pageItems(pagination.pageIndex, pagination.pageSize)}
                    columns={columns}
                    pagination={{
                        pageIndex: pagination.pageIndex,
                        pageSize: pagination.pageSize,
                        totalItemCount: rData.length,
                        pageSizeOptions: [10, 15, 20, 50],
                        showPerPageOptions: true,
                    }}
                    onChange={onTableChange}
                    noItemsMessage='No users found'
                />
            </EuiPageTemplate.Section>
            {editModalOpen && (
                <UserEditModal toggleModal={setEditModalOpen} tabs={tabs} />
            )}
            {modalCreateOpen && (
                <UserCreateModal
                    toggleModal={setModalCreateOpen}
                    setData={setData}
                />
            )}
        </>
    );
};
export default UserList;
