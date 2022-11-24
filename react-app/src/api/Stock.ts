import { Location, NavigateFunction } from 'react-router-dom';
import { getRefreshToken } from './Authentication';

export const fetchStockSearch = async ({
    search,
    location,
    navigate,
}: {
    search: string;
    location: Location;
    navigate: NavigateFunction;
}) => {
    let baseUrl = `/api/v1/inventory/stock?search=${search}`;
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