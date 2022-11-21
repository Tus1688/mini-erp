import { Location, NavigateFunction } from 'react-router-dom';
import { salesInvoiceSpecific } from '../type/SalesInvoice';
import { getRefreshToken } from './Authentication';

export const fetchSalesInvoiceSpecific = async ({
    id,
    navigate,
    location,
}: {
    id: number;
    navigate: NavigateFunction;
    location: Location;
}): Promise<salesInvoiceSpecific | undefined> => {
    let baseUrl = `/api/v1/finance/sales-invoice?id=${id}`;
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
        if (retry.status === 401) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
    }
};
