import { NavigateFunction, Location } from 'react-router-dom';

export const isAuthenticatedRequest = async (): Promise<boolean> => {
    const state = sessionStorage.getItem('state');
    if (state === 'true') {
        return true;
    }
    const token = sessionStorage.getItem('token');
    if (token) {
        const response = await fetch('/api/v1/auth/util/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
        });
        if (response.ok) {
            sessionStorage.setItem('state', 'true');
            return true;
        }
    }
    return false;
};

export const logoutRequest = async (): Promise<void> => {
    const response = await fetch('/api/v1/auth/util/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: sessionStorage.getItem('token') || '',
        },
    });
    if (response.ok) {
        sessionStorage.clear();
    }
    if (response.status === 401) {
        sessionStorage.clear();
        alert(
            'Any act of unauthorized access will be reported to the local authorities, stop now!'
        );
    }
};

export const getRefreshToken = async (): Promise<boolean> => {
    const response = await fetch('/api/v1/auth/util/refresh-token', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: sessionStorage.getItem('token') || '',
        },
    });
    if (response.ok) {
        // set the new token to the session storage
        const data = await response.json();
        sessionStorage.setItem('token', data.token);
        return true;
    }
    sessionStorage.clear();
    return false;
};

export const resetPassword = async ({
    currentPassword,
    newPassword,
    navigate,
    location,
}: {
    currentPassword: string;
    newPassword: string;
    navigate: NavigateFunction;
    location: Location;
}) => {
    let baseUrl = '/api/v1/auth/user/changepw';
    let body = JSON.stringify({
        password: currentPassword,
        new_password: newPassword,
    });
    const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: sessionStorage.getItem('token') || '',
        },
        body: body,
    });
    const data = await res.json();
    if (res.status === 200 || res.status === 400) {
        return data;
    }
    if (data.error === 'Invalid credentials' || res.status === 500) {
        return data;
    }
    if (res.status === 403) {
        navigate('/login', { state: { from: location } });
        return;
    }
    if (data.error === 'token expired') {
        const state = await getRefreshToken();
        if (!state) {
            navigate('/login', { state: { from: location } });
            return;
        }
        const retry = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: sessionStorage.getItem('token') || '',
            },
            body: body,
        });
        if (retry.status === 403) {
            navigate('/login', { state: { from: location } });
            return;
        }
        const retry_data = await retry.json();
        if (retry.status === 200 || retry.status === 400) {
            return retry_data;
        }
        if (
            retry_data.error === 'Invalid credentials' ||
            retry.status === 500
        ) {
            return retry_data;
        }
    }
};
