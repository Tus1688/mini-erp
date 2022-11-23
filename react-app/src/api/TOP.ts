import { Location, NavigateFunction } from 'react-router-dom';
import { getRefreshToken } from './Authentication';

export const createTOP = async ({
    name,
    dueDate,
    location,
    navigate,
}: {
    name: string;
    dueDate: number;
    location: Location;
    navigate: NavigateFunction;
}) => {
    let baseUrl = '/api/v1/finance/term-of-payment';
    let body = JSON.stringify({
        name: name,
        due_date: dueDate,
    });
    const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: sessionStorage.getItem('token') || '',
        },
        body: body,
    });
    if (res.status === 201 || res.status === 409) {
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
            body: body,
        });
        if (retry.status === 201 || retry.status === 409) {
            const data = await retry.json();
            return data;
        }
        if (retry.status === 401 || retry.status === 403) {
            navigate('/login', { state: { from: location } });
            return;
        }
    }
};

type topProps = {
    id: number;
    name: string;
    due_date: number;
};

export const fetchTOPSpecific = async ({
    id,
    location,
    navigate,
}: {
    id: number;
    location: Location;
    navigate: NavigateFunction;
}): Promise<topProps | undefined> => {
    let baseUrl = `/api/v1/finance/term-of-payment?id=${id}`;
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

export const patchTOP = async ({
    id,
    name,
    dueDate,
    location,
    navigate,
}: {
    id: number;
    name: string;
    dueDate: number;
    location: Location;
    navigate: NavigateFunction;
}) => {
    let baseUrl = '/api/v1/finance/term-of-payment';
    let body = JSON.stringify({
        id: id,
        name: name,
        due_date: dueDate,
    });
    const res = await fetch(baseUrl, {
        method: 'PATCH',
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
    if (res.status === 403 ) {
        navigate('/login', { state: { from: location } });
        return;
    }
    if (res.status === 404) {
        return { error: 'TOP not found, somebody else might have deleted it!' };
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
        if (retry.status === 200 || retry.status === 409) {
            const data = await retry.json();
            return data;
        }
        if (retry.status === 404) {
            return {
                error: 'TOP not found, somebody else might have deleted it!',
            };
        }
        if (retry.status === 401 || retry.status === 403) {
            navigate('/login', { state: { from: location } });
            return;
        }
    }
};
