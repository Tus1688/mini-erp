import {
    EuiButton,
    EuiFieldPassword,
    EuiFlexGroup,
    EuiForm,
    EuiFormRow,
    EuiGlobalToastList,
    EuiPageTemplate,
    EuiSpacer,
    EuiText,
    EuiTextColor,
    EuiTitle,
} from '@elastic/eui';
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logoutRequest, resetPassword } from '../api/Authentication';
import useToast from '../hooks/useToast';

const ProfileSettings = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [password, setPassword] = useState<string>();
    const [newPassword, setNewPassword] = useState<string>();
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>();
    const [showError, setShowError] = useState<boolean>(false);
    const [dualPassword] = useState<boolean>(true);
    const [dualNewPassword] = useState<boolean>(true);
    const [dualConfirmNewPassword] = useState<boolean>(true);
    const { addToast, getAllToasts, removeToast, getNewId } = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // check whether all field is filled
        if (password && newPassword && confirmNewPassword) {
            await resetPassword({
                currentPassword: password,
                newPassword: newPassword,
                location: location,
                navigate: navigate,
            }).then((data) => {
                if (data.message) {
                    logoutRequest();
                    navigate('/login');
                }
                addToast({
                    id: getNewId(),
                    title: 'Error',
                    color: 'danger',
                    text: (
                        <>
                            <p>{data.error}</p>
                        </>
                    ),
                });
            });
        }
    };

    useEffect(() => {
        if (confirmNewPassword !== newPassword) {
            setShowError(true);
        } else {
            setShowError(false);
        }
    }, [newPassword, confirmNewPassword]);
    return (
        <>
            <EuiPageTemplate.Section>
                <EuiTitle size='l'>
                    <h1>Profile Settings</h1>
                </EuiTitle>
                <EuiText>
                    <EuiTextColor color='subdued'>
                        <p>In this page you can edit your credentials</p>
                    </EuiTextColor>
                </EuiText>
                <EuiSpacer size='m' />
                <EuiFlexGroup direction='row' gutterSize='m'>
                    <EuiForm component='form' onSubmit={(e) => handleSubmit(e)}>
                        <EuiFormRow
                            label='Current Password'
                            helpText='enter your current password'
                        >
                            <EuiFieldPassword
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type={dualPassword ? 'dual' : undefined}
                            />
                        </EuiFormRow>
                        <EuiFormRow
                            label='New Password'
                            helpText='enter new password'
                            error='new password does not match'
                            isInvalid={showError}
                        >
                            <EuiFieldPassword
                                value={newPassword}
                                isInvalid={showError}
                                onChange={(e) => setNewPassword(e.target.value)}
                                type={dualNewPassword ? 'dual' : undefined}
                            />
                        </EuiFormRow>
                        <EuiFormRow
                            label='Confirm New Password'
                            helpText='enter new password'
                            error='new password does not match'
                            isInvalid={showError}
                        >
                            <EuiFieldPassword
                                value={confirmNewPassword}
                                isInvalid={showError}
                                onChange={(e) =>
                                    setConfirmNewPassword(e.target.value)
                                }
                                type={
                                    dualConfirmNewPassword ? 'dual' : undefined
                                }
                            />
                        </EuiFormRow>
                        <EuiSpacer size='l' />
                        <EuiFlexGroup justifyContent='flexEnd'>
                            <EuiButton color='success' type='submit'>
                                Submit
                            </EuiButton>
                        </EuiFlexGroup>
                    </EuiForm>
                </EuiFlexGroup>
            </EuiPageTemplate.Section>
            <EuiGlobalToastList
                toasts={getAllToasts()}
                dismissToast={({ id }) => removeToast(id)}
                toastLifeTimeMs={6000}
            />
        </>
    );
};

export default ProfileSettings;
