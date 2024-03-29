import {
    EuiButton,
    EuiButtonEmpty,
    EuiFieldText,
    EuiFlexGroup,
    EuiForm,
    EuiFormRow,
    EuiModal,
    EuiModalBody,
    EuiModalFooter,
    EuiModalHeader,
    EuiModalHeaderTitle,
    EuiSpacer,
    EuiSwitch,
} from '@elastic/eui';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchUsers } from '../api/Users';
import { updateUserRole } from '../api/Users';
import { Users } from '../type/Users';

const RoleEditTab = ({
    data,
    toggleModal,
    setData,
}: {
    data: Users | undefined;
    toggleModal: (value: React.SetStateAction<boolean>) => void;
    setData: (value: React.SetStateAction<Users[]>) => void;
}) => {
    let navigate = useNavigate();
    let location = useLocation();
    const [finUser, setFinUser] = useState<boolean>(data?.fin_user || false);
    const [finAdmin, setFinAdmin] = useState<boolean>(data?.fin_admin || false);
    const [invUser, setInvUser] = useState<boolean>(data?.inv_user || false);
    const [invAdmin, setInvAdmin] = useState<boolean>(data?.inv_admin || false);
    const [sysAdmin, setSysAdmin] = useState<boolean>(data?.sys_admin || false);
    const [errorModal, setErrorModal] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await updateUserRole({
            username: data?.username || '',
            fin_user: finUser,
            fin_admin: finAdmin,
            inv_user: invUser,
            inv_admin: invAdmin,
            sys_admin: sysAdmin,
            navigate: navigate,
            location: location,
        }).then((data) => {
            if (data.error) {
                setErrorMessage(data.error);
                setErrorModal(true);
                return;
            }
            // close modal & refresh the table
            toggleModal(false);
            fetchUsers({
                navigate: navigate,
                location: location,
            }).then((data) => {
                setData(data);
            });
        });
    };
    return (
        <>
            <EuiSpacer size='l' />
            {data && (
                <EuiForm onSubmit={(e) => handleSubmit(e)} component='form'>
                    <EuiFormRow label='Username'>
                        <EuiFieldText
                            name='username'
                            value={data.username}
                            disabled
                        />
                    </EuiFormRow>
                    <EuiFormRow>
                        <EuiSwitch
                            label='Finance user'
                            checked={finUser}
                            onChange={(e) => setFinUser(e.target.checked)}
                        />
                    </EuiFormRow>
                    <EuiFormRow>
                        <EuiSwitch
                            label='Finance admin'
                            checked={finAdmin}
                            onChange={(e) => setFinAdmin(e.target.checked)}
                        />
                    </EuiFormRow>
                    <EuiFormRow>
                        <EuiSwitch
                            label='Inventory user'
                            checked={invUser}
                            onChange={(e) => setInvUser(e.target.checked)}
                        />
                    </EuiFormRow>
                    <EuiFormRow>
                        <EuiSwitch
                            label='Inventory admin'
                            checked={invAdmin}
                            onChange={(e) => setInvAdmin(e.target.checked)}
                        />
                    </EuiFormRow>
                    <EuiFormRow>
                        <EuiSwitch
                            label='System admin'
                            checked={sysAdmin}
                            onChange={(e) => setSysAdmin(e.target.checked)}
                        />
                    </EuiFormRow>
                    <EuiFlexGroup justifyContent='flexEnd'>
                        <EuiButtonEmpty onClick={() => toggleModal(false)}>
                            cancel
                        </EuiButtonEmpty>
                        <EuiButton color='primary' type='submit'>
                            Submit
                        </EuiButton>
                    </EuiFlexGroup>
                </EuiForm>
            )}
            {errorModal && (
                <EuiModal onClose={() => setErrorModal(false)}>
                    <EuiModalHeader>
                        <EuiModalHeaderTitle>Error</EuiModalHeaderTitle>
                    </EuiModalHeader>
                    <EuiModalBody>{errorMessage}</EuiModalBody>
                    <EuiModalFooter>
                        <EuiButton
                            onClick={() => {
                                setErrorModal(false);
                                // close modal & refresh the table
                                toggleModal(false);
                                fetchUsers({
                                    navigate: navigate,
                                    location: location,
                                }).then((data) => {
                                    setData(data);
                                });
                            }}
                            color='danger'
                        >
                            I understand
                        </EuiButton>
                    </EuiModalFooter>
                </EuiModal>
            )}
        </>
    );
};

export default RoleEditTab;
