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
import { fetchUsers, toggleUserStatus } from '../api/Users';
import { Users } from '../type/Users';

const StatusEditTab = ({
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
    const [active, setActive] = useState<boolean>(data?.active || false);
    const [errorModal, setErrorModal] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await toggleUserStatus({
            username: data?.username || '',
            active: active,
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
                            label='Active'
                            checked={active}
                            onChange={(e) => setActive(e.target.checked)}
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

export default StatusEditTab;
