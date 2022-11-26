import { NavigateFunction, Location } from 'react-router-dom';
import { getRefreshToken } from './Authentication';

export const fetchUsers = async ({
    location,
    navigate,
}: {
    location: Location;
    navigate: NavigateFunction;
}) => {
    let baseUrl = '/api/v1/auth/admin/users';
    const res = await fetch(baseUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: sessionStorage.getItem('token') || '',
        },
    });
    if (res.status === 200) {
        const data = await res.json();
        return data;
    }
    if (res.status === 403) {
        navigate('/login', { state: { from: location } });
        return;
    }
    if (res.status === 401) {
        const state = await getRefreshToken();
        if (!state) {
            navigate('/login', { state: { from: location } });
            return;
        }
        const retry = await fetch(baseUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: sessionStorage.getItem('token') || '',
            },
        });
        if (retry.status === 200) {
            const data = await retry.json();
            return data;
        }
        if (retry.status === 401 || retry.status === 403) {
            navigate('/login', { state: { from: location } });
            return;
        }
    }
};

export const updateUserRole = async ({
    location,
    navigate,
    username,
    fin_user,
    fin_admin,
    inv_user,
    inv_admin,
    sys_admin,
}: {
    location: Location;
    navigate: NavigateFunction;
    username: string;
    fin_user: boolean;
    fin_admin: boolean;
    inv_user: boolean;
    inv_admin: boolean;
    sys_admin: boolean;
}) => {
    let baseUrl = '/api/v1/auth/admin/update-role';
    let body = JSON.stringify({
        username: username,
        fin_user: fin_user,
        fin_admin: fin_admin,
        inv_user: inv_user,
        inv_admin: inv_admin,
        sys_admin: sys_admin,
    });
    const res = await fetch(baseUrl, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: sessionStorage.getItem('token') || '',
        },
        body: body,
    });
    if (res.status === 200 || res.status === 404) {
        const data = await res.json();
        return data;
    }
    if (res.status === 403) {
        navigate('/login', { state: { from: location } });
        return;
    }
    if (res.status === 401) {
        const state = await getRefreshToken();
        if (!state) {
            navigate('/login', { state: { from: location } });
            return;
        }
        const retry = await fetch(baseUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: sessionStorage.getItem('token') || '',
            },
            body: body,
        });
        if (retry.status === 200 || retry.status === 404) {
            const data = await retry.json();
            return data;
        }
        if (retry.status === 401 || retry.status === 403) {
            navigate('/login', { state: { from: location } });
            return;
        }
    }
};

export const toggleUserStatus = async ({
    location,
    navigate,
    username,
    active,
}: {
    location: Location;
    navigate: NavigateFunction;
    username: string;
    active: boolean;
}) => {
    let baseUrl = '/api/v1/auth/admin/toggle-active';
    let body = JSON.stringify({
        username: username,
        active: active,
    });
    const res = await fetch(baseUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: sessionStorage.getItem('token') || '',
        },
        body: body,
    });
    if (res.status === 200 || res.status === 404) {
        const data = await res.json();
        return data;
    }
    if (res.status === 403) {
        navigate('/login', { state: { from: location } });
        return;
    }
    if (res.status === 401) {
        const state = await getRefreshToken();
        if (!state) {
            navigate('/login', { state: { from: location } });
            return;
        }
        const retry = await fetch(baseUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: sessionStorage.getItem('token') || '',
            },
            body: body,
        });
        if (retry.status === 200 || retry.status === 404) {
            const data = await retry.json();
            return data;
        }
        if (retry.status === 401 || retry.status === 403) {
            navigate('/login', { state: { from: location } });
            return;
        }
    }
};

export const createUser = async ({
    location,
    navigate,
    username,
    password,
    fin_user,
    fin_admin,
    inv_user,
    inv_admin,
    sys_admin,
}: {
    location: Location;
    navigate: NavigateFunction;
    username: string;
    password: string;
    fin_user: boolean;
    fin_admin: boolean;
    inv_user: boolean;
    inv_admin: boolean;
    sys_admin: boolean;
}) => {
    let baseUrl = '/api/v1/auth/admin/register'
    let body = JSON.stringify({
        username: username,
        password: password,
        fin_user: fin_user,
        fin_admin: fin_admin,
        inv_user: inv_user,
        inv_admin: inv_admin,
        sys_admin: sys_admin,
    });
    const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: sessionStorage.getItem('token') || '',
        },
        body: body,
    });
    if (res.status === 200 || res.status === 409) {
        const data = await res.json();
        return data;
    }
    if (res.status === 403) {
        navigate('/login', { state: { from: location } });
        return;
    }
    if (res.status === 401) {
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
        if (retry.status === 200 || retry.status === 409) {
            const data = await retry.json();
            return data;
        }
        if (retry.status === 401 || retry.status === 403) {
            navigate('/login', { state: { from: location } });
            return;
        }
    }
};
