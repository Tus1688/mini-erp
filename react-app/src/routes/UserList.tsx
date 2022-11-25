import { EuiButton, EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiPageTemplate, EuiSpacer, EuiText, EuiTextColor, EuiTitle } from '@elastic/eui';
import { useState } from 'react';

const UserList = () => {
    const [modalCreateOpen, setModalCreateOpen] = useState(false);
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
                                // onClick={() => {
                                //     setFetchedPage([]);
                                //     setData([]);
                                //     setPagination({
                                //         pageIndex: 0,
                                //         pageSize: 20,
                                //     });
                                // }}
                                color='primary'
                                display='base'
                                size='m'
                            />
                        </EuiFlexGroup>
                    </EuiFlexItem>
                </EuiFlexGroup>
                <EuiSpacer size='s' />
            </EuiPageTemplate.Section>
        </>
    );
};
export default UserList;
