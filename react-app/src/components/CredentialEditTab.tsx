import {
    EuiButton,
    EuiButtonEmpty,
    EuiFieldPassword,
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
} from '@elastic/eui';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { credentialEditUser, fetchUsers } from '../api/Users';
import { Users } from '../type/Users';

const CredentialEditTab = ({
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
    const [password, setPassword] = useState<string>('');
    const [errorModal, setErrorModal] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [dual] = useState(true);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await credentialEditUser({
            username: data?.username || '',
            password: password,
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
                    <EuiFormRow
                        label='New Password'
                        helpText='minimum 8 characters'
                    >
                        <EuiFieldPassword
                            name='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type={dual ? 'dual' : undefined}
                            minLength={8}
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

export default CredentialEditTab;
