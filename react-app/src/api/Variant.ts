import { Location, NavigateFunction } from 'react-router-dom';
import { getRefreshToken } from './Authentication';

type variantProps = {
    id: number;
    name: string;
    description: string;
    error: string;
};

export const fetchVariantSpecific = async ({
    id,
    location,
    navigate,
}: {
    id: number;
    location: Location;
    navigate: NavigateFunction;
}): Promise<variantProps | undefined> => {
    let baseUrl = `/api/v1/inventory/variant?id=${id}`;
    const res = await fetch(baseUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: sessionStorage.getItem('token') || '',
        },
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
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: sessionStorage.getItem('token') || '',
            },
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
export const patchVariant = async ({
    id,
    name,
    description,
    navigate,
    location,
}: {
    id: number;
    name: string;
    description: string;
    navigate: NavigateFunction;
    location: Location;
}) => {
    let baseUrl = '/api/v1/inventory/variant';
    const res = await fetch(baseUrl, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: sessionStorage.getItem('token') || '',
        },
        body: JSON.stringify({
            id: id,
            name: name,
            description: description,
        }),
    });
    if (res.status === 200 || res.status === 409) {
        const data = await res.json();
        return data;
    }
    if (res.status === 403) {
        navigate('/login', { state: { from: location } });
        return;
    }
    if (res.status === 404) {
        return {
            error: 'Variant not found, somebody else might have deleted it!',
        };
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
                name: name,
                description: description,
            }),
        });
        if (retry.status === 200 || retry.status === 409) {
            const data = await retry.json();
            return data;
        }
        if (retry.status === 404) {
            return {
                error: 'Variant not found, somebody else might have deleted it!',
            };
        }
        if (retry.status === 401 || retry.status === 403) {
            navigate('/login', { state: { from: location } });
            return;
        }
    }
};

export const createVariant = async ({
    name,
    description,
    navigate,
    location,
}: {
    name: string;
    description: string;
    navigate: NavigateFunction;
    location: Location;
}) => {
    let baseUrl = '/api/v1/inventory/variant';
    const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: sessionStorage.getItem('token') || '',
        },
        body: JSON.stringify({
            name: name,
            description: description,
        }),
    });
    if (res.status === 201 || res.status === 409) {
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
            body: JSON.stringify({
                name: name,
                description: description,
            }),
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

export const fetchVariantSearch = async ({
    search,
    location,
    navigate,
}: {
    search: string;
    location: Location;
    navigate: NavigateFunction;
}) => {
    let baseUrl = `/api/v1/inventory/variant?search=${search}`;
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
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
        // retry
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
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
    }
};

export const fetchVariantCount = async ({
    location,
    navigate,
}: {
    location: Location;
    navigate: NavigateFunction;
}): Promise<number | undefined> => {
    let baseUrl = '/api/v1/inventory/variant-count';
    const res = await fetch(baseUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: sessionStorage.getItem('token') || '',
        },
    });
    if (res.status === 200) {
        const data = await res.json();
        return data.count;
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
        // retry
        const retry = await fetch(baseUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: sessionStorage.getItem('token') || '',
            },
        });
        if (retry.status === 200) {
            const data = await retry.json();
            return data.count;
        }
        if (retry.status === 401 || retry.status === 403) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
    }
};
