import {
    EuiButton,
    EuiButtonEmpty,
    EuiFieldText,
    EuiFlexGroup,
    EuiForm,
    EuiFormRow,
    EuiSpacer,
    EuiSwitch,
} from '@elastic/eui';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { updateUserRole } from '../api/Users';
import { Users } from '../type/Users';

const RoleEditTab = ({
    data,
    toggleModal,
}: {
    data: Users | undefined;
    toggleModal: (value: React.SetStateAction<boolean>) => void;
}) => {
    let navigate = useNavigate();
    let location = useLocation();
    const [finUser, setFinUser] = useState<boolean>(data?.fin_user || false);
    const [finAdmin, setFinAdmin] = useState<boolean>(data?.fin_admin || false);
    const [invUser, setInvUser] = useState<boolean>(data?.inv_user || false);
    const [invAdmin, setInvAdmin] = useState<boolean>(data?.inv_admin || false);
    const [sysAdmin, setSysAdmin] = useState<boolean>(data?.sys_admin || false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(finUser, finAdmin, invUser, invAdmin, sysAdmin);
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
            
        })
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
        </>
    );
};

export default RoleEditTab;
