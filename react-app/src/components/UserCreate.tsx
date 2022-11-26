import {
    EuiButton,
    EuiButtonEmpty,
    EuiFieldPassword,
    EuiFieldText,
    EuiFlexGroup,
    EuiForm,
    EuiFormRow,
    EuiGlobalToastList,
    EuiModal,
    EuiModalBody,
    EuiModalHeader,
    EuiModalHeaderTitle,
    EuiSpacer,
    EuiSwitch,
} from '@elastic/eui';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createUser, fetchUsers } from '../api/Users';
import useToast from '../hooks/useToast';
import { Users } from '../type/Users';

const UserCreateModal = ({
    toggleModal,
    setData,
}: {
    toggleModal: (value: React.SetStateAction<boolean>) => void;
    setData: (value: React.SetStateAction<Users[]>) => void;
}) => {
    let navigate = useNavigate();
    let location = useLocation();
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [dual] = useState<boolean>(true);
    const [finUser, setFinUser] = useState<boolean>(false);
    const [finAdmin, setFinAdmin] = useState<boolean>(false);
    const [invUser, setInvUser] = useState<boolean>(false);
    const [invAdmin, setInvAdmin] = useState<boolean>(false);
    const [sysAdmin, setSysAdmin] = useState<boolean>(false);

    const { addToast, getAllToasts, removeToast, getNewId } = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await createUser({
            username: username,
            password: password,
            fin_user: finUser,
            fin_admin: finAdmin,
            inv_user: invUser,
            inv_admin: invAdmin,
            sys_admin: sysAdmin,
            navigate: navigate,
            location: location,
        }).then((data) => {
            if (data.error) {
                addToast({
                    id: getNewId(),
                    title: 'Error',
                    color: 'danger',
                    text: <p>{data.error}</p>,
                });
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
        <EuiModal onClose={() => toggleModal(false)}>
            <EuiModalHeader>
                <EuiModalHeaderTitle>Create User</EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
                <EuiForm
                    id='userCreateForm'
                    component='form'
                    onSubmit={(e) => handleSubmit(e)}
                >
                    <EuiFormRow
                        label='Username'
                        helpText='maximum 20 characters'
                    >
                        <EuiFieldText
                            name='username'
                            // disable saved login autocomplete on browser
                            autoComplete='username'
                            icon={{ type: 'user', side: 'left' }}
                            placeholder='user1'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            maxLength={20}
                        />
                    </EuiFormRow>
                    <EuiFormRow
                        label='Password'
                        helpText='minimum 8 characters'
                    >
                        <EuiFieldPassword
                            name='password'
                            placeholder='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={8}
                            type={dual ? 'dual' : undefined}
                        />
                    </EuiFormRow>
                    <EuiSpacer size='l' />
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
                    <EuiSpacer size='l' />
                    <EuiFlexGroup justifyContent='flexEnd'>
                        <EuiButtonEmpty onClick={() => toggleModal(false)}>
                            cancel
                        </EuiButtonEmpty>
                        <EuiButton color='success' type='submit'>
                            Create
                        </EuiButton>
                    </EuiFlexGroup>
                    <EuiSpacer size='m' />
                </EuiForm>
            </EuiModalBody>
            <EuiGlobalToastList
                toasts={getAllToasts()}
                dismissToast={({ id }) => removeToast(id)}
                toastLifeTimeMs={5000}
            />
        </EuiModal>
    );
};

export default UserCreateModal;
