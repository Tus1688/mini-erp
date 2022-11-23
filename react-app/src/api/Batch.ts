import { NavigateFunction, Location } from 'react-router-dom';
import { getRefreshToken } from './Authentication';

export const createBatch = async ({
    expiredDate,
    navigate,
    location,
}: {
    expiredDate: string;
    navigate: NavigateFunction;
    location: Location;
}) => {
    let baseUrl = '/api/v1/inventory/batch';
    const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: sessionStorage.getItem('token') || '',
        },
        body: JSON.stringify({
            expired_date: expiredDate,
        }),
    });
    if (res.status === 201) {
        const data = await res.json();
        return data;
    }
    if (res.status === 403 ) {
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
            body: JSON.stringify({
                expired_date: expiredDate,
            }),
        });
        if (retry.status === 201) {
            const data = await retry.json();
            return data;
        }
        if (retry.status === 401 || retry.status === 403) {
            navigate('/login', { state: { from: location } });
            return;
        }
    }
};

export const fetchBatchSpecific = async ({
    id,
    location,
    navigate,
}: {
    id: number;
    location: Location;
    navigate: NavigateFunction;
}) => {
    let baseUrl = `/api/v1/inventory/batch?id=${id}`;
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
    if (res.status === 403 ) {
        navigate('/login', { state: { from: location } });
        return;
    }
    if (res.status === 404) {
        return {
            error: 'Batch not found, somebody else might have deleted it!',
        };
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
        if (retry.status === 404) {
            return {
                error: 'Batch not found, somebody else might have deleted it!',
            };
        }
        if (retry.status === 401 || retry.status === 403) {
            navigate('/login', { state: { from: location } });
            return;
        }
    }
};

export const patchBatch = async ({
    id,
    expiredDate,
    location,
    navigate,
}: {
    id: number;
    expiredDate: string;
    location: Location;
    navigate: NavigateFunction;
}) => {
    let baseUrl = '/api/v1/inventory/batch';
    const res = await fetch(baseUrl, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: sessionStorage.getItem('token') || '',
        },
        body: JSON.stringify({
            id: id,
            expired_date: expiredDate,
        }),
    });
    if (res.status === 200) {
        const data = await res.json();
        return data;
    }
    if (res.status === 403 ) {
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
            body: JSON.stringify({
                id: id,
                expired_date: expiredDate,
            }),
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

export const fetchBatchSearch = async ({
    search,
    location,
    navigate,
}: {
    search: string;
    location: Location;
    navigate: NavigateFunction;
}) => {
    let baseUrl = `/api/v1/inventory/batch?search=${search}`;
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
    if (res.status === 403 ) {
        navigate('/login', { state: { from: location } });
        return;
    }
    if (res.status === 404) {
        return {
            error: 'Batch not found, somebody else might have deleted it!',
        };
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
        if (retry.status === 404) {
            return {
                error: 'Batch not found, somebody else might have deleted it!',
            };
        }
        if (retry.status === 401 || retry.status === 403) {
            navigate('/login', { state: { from: location } });
            return;
        }
    }
};
