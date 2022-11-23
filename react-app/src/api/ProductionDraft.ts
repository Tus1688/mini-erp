import { ReactNode } from 'react';
import { Location, NavigateFunction } from 'react-router-dom';
import { getRefreshToken } from './Authentication';

export const fetchProductionDraftCount = async ({
    location,
    navigate,
}: {
    location: Location;
    navigate: NavigateFunction;
}): Promise<number | undefined> => {
    let baseUrl = '/api/v1/inventory/production-count';
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
    if (res.status === 403 ) {
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
            return data.count;
        }
        if (retry.status === 401 || retry.status === 403) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
    }
};

export const fetchProductionDraft = async ({
    pageIndex,
    pageSize,
    lastId,
    location,
    navigate,
}: {
    pageIndex: number;
    pageSize: number;
    lastId: number;
    location: Location;
    navigate: NavigateFunction;
}): Promise<Array<{ [key: string]: ReactNode }> | undefined> => {
    let baseUrl = '/api/v1/inventory/production';
    if (pageIndex !== undefined && pageSize !== undefined) {
        baseUrl += `?page=${pageIndex + 1}&page_size=${pageSize}`;
        if (lastId) {
            baseUrl += `&last_id=${lastId}`;
        }
    }
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

export const createProdutionDraft = async ({
    variantId,
    batchId,
    quantity,
    location,
    navigate,
}: {
    variantId: number;
    batchId: number;
    quantity: number;
    location: Location;
    navigate: NavigateFunction;
}) => {
    let baseUrl = '/api/v1/inventory/production';
    let body = JSON.stringify({
        batch_id: batchId,
        variant_id: variantId,
        quantity: quantity,
    });
    const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: sessionStorage.getItem('token') || '',
        },
        body: body,
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
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
        // retry
        const retry = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: sessionStorage.getItem('token') || '',
            },
            body: body,
        });
        if (retry.status === 201) {
            const data = await retry.json();
            return data;
        }
        if (retry.status === 401 || retry.status === 403) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
    }
};
