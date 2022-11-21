import {
    EuiButton,
    EuiFieldPassword,
    EuiFieldText,
    EuiForm,
    EuiFormRow,
    EuiGlobalToastList,
    EuiPageTemplate,
    EuiSpacer,
    EuiText,
    EuiTextAlign,
    EuiTextColor,
    EuiTitle,
} from '@elastic/eui';
import React, { Fragment } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useToast from '../hooks/useToast';

const loginUser = async (credentials: {
    username: string;
    password: string;
}) => {
    const res = await fetch('api/v1/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    if (res.status === 200) {
        return res.json();
    }
    if (res.status === 401) {
        return { error: 'Invalid username or password' };
    }
    if (res.status === 404 || res.status === 504) {
        return { error: 'Auth server is not running' };
    }
    if (res.status === 403) {
        const retry = await fetch('api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });
        if (retry.status === 200) {
            return retry.json();
        }
        if (retry.status === 401) {
            return { error: 'Invalid username or password' };
        }
    }
};

type LoginProps = {
    token: string;
    inv_u: boolean;
    inv_a: boolean;
    fin_u: boolean;
    fin_a: boolean;
    sys_a: boolean;
    error?: string | undefined;
}

const Login = ({ setToken }: { setToken: (userToken: string) => void }) => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const { addToast, getAllToasts, removeToast, getNewId } = useToast();

    let navigate = useNavigate();
    let location = useLocation();

    let from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const token: LoginProps = await loginUser({
            username,
            password,
        });
        if (token.error !== undefined) {
            addToast({
                title: 'Uh-Oh Login failed',
                color: 'danger',
                text: (
                    <Fragment>
                        <p>
                            {token.error}
                            <br />
                            maybe contact your administrator for help?
                        </p>
                    </Fragment>
                ),
                id: getNewId(),
            });
            return;
        }
        setToken(token.token);
        sessionStorage.setItem("inv_u", token.inv_u.toString());
        sessionStorage.setItem("inv_a", token.inv_a.toString());
        sessionStorage.setItem("fin_u", token.fin_u.toString());
        sessionStorage.setItem("fin_a", token.fin_a.toString());
        sessionStorage.setItem("sys_a", token.sys_a.toString());
        navigate(from, { replace: true });
    };

    return (
        <EuiPageTemplate>
            <EuiPageTemplate.Section alignment='center'>
                <EuiTitle size='l'>
                    <EuiTextAlign textAlign='center'>
                        Protected Page!
                    </EuiTextAlign>
                </EuiTitle>
                <EuiSpacer size='xs' />
                <EuiText>
                    <EuiTextAlign textAlign='center'>
                        <EuiTextColor color='subdued'>
                            You need to login to view this page
                        </EuiTextColor>
                    </EuiTextAlign>
                </EuiText>
                <EuiSpacer />
                {/* prevent no data to be submitted */}
                <EuiForm component='form' onSubmit={(e) => handleSubmit(e)}>
                    <EuiFormRow label='username'>
                        <EuiFieldText
                            name='username'
                            placeholder='Enter Username here'
                            onChange={(e) => setUsername(e.target.value)}
                            icon={{ type: 'user', side: 'left' }}
                            value={username}
                        />
                    </EuiFormRow>
                    <EuiFormRow label='password'>
                        <EuiFieldPassword
                            placeholder='Enter Password here'
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                        />
                    </EuiFormRow>
                    <EuiButton type='submit' fullWidth>
                        Login
                    </EuiButton>
                </EuiForm>
            </EuiPageTemplate.Section>
            <EuiGlobalToastList
                toasts={getAllToasts()}
                dismissToast={({ id }) => removeToast(id)}
                toastLifeTimeMs={6000}
            />
        </EuiPageTemplate>
    );
};

export default Login;
