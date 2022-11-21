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
        body: body
    });
    if (res.status === 201 || res.status === 409)  {
        const data = await res.json();
        return data;
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
            body: body
        });
        if (retry.status === 201 || retry.status === 409) {
            const data = await retry.json();
            return data;
        }
        if (retry.status === 401) {
            navigate('/login', { state: { from: location } });
            return;
        }
    }
};
