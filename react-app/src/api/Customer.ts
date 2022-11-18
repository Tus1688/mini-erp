import { Location, NavigateFunction } from 'react-router-dom';
import { customerSpecific } from '../type/Customer';
import { getRefreshToken } from './Authentication';

export const fetchCustomerSpecific = async ({
    id,
    navigate,
    location,
}: {
    id: number;
    navigate: NavigateFunction;
    location: Location;
}): Promise<customerSpecific | undefined> => {
    let baseUrl = `/api/v1/customer?id=${id}`;
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

export const patchCustomerSpecific = async ({
    id,
    name,
    tax_id,
    address,
    city_name,
    province_name,
    country_name,
    navigate,
    location,
}: {
    id: number;
    name: string;
    tax_id: string;
    address: string;
    city_name: string;
    province_name: string;
    country_name: string;
    navigate: NavigateFunction;
    location: Location;
}) => {
    let baseUrl = '/api/v1/customer';
    const res = await fetch(baseUrl, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: sessionStorage.getItem('token') || '',
        },
        body: JSON.stringify({
            id: id,
            name: name,
            tax_id: tax_id,
            address: address,
            city_name: city_name,
            province_name: province_name,
            country_name: country_name
        })
    })
    if (res.status === 200 || res.status === 409) {
        const data = await res.json();
        return data;
    }
    if (res.status === 404) {
        return {error: 'Customer Not Found, somebody else might have deleted it!'}
    }
    if (res.status === 401) {
        const state = await getRefreshToken();
        if (!state) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
        // retry
        const retry = await fetch(baseUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: sessionStorage.getItem('token') || '',
            },
            body: JSON.stringify({
                id: id,
                tax_id: tax_id,
                address: address,
                city_name: city_name,
                province_name: province_name,
                country_name: country_name
            })
        })
        if (retry.status === 200 || retry.status === 409) {
            const data = await retry.json();
            return data;
        }
        if (retry.status === 404) {
            return {error: 'Customer Not Found, somebody else might have deleted it!'}
        }
        if (retry.status === 401) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
    }
}

export const createCustomer = async ({
    name,
    tax_id,
    address,
    city_name,
    province_name,
    country_name,
    navigate,
    location,
}: {
    name: string;
    tax_id: string;
    address: string;
    city_name: string;
    province_name: string;
    country_name: string;
    navigate: NavigateFunction;
    location: Location;
}) => {
    let baseUrl = '/api/v1/customer';
    const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: sessionStorage.getItem('token') || '',
        },
        body: JSON.stringify({
            name: name,
            tax_id: tax_id,
            address: address,
            city_name: city_name,
            province_name: province_name,
            country_name: country_name
        })
    })
    if (res.status === 201 || res.status === 409) {
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
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: sessionStorage.getItem('token') || '',
            },
            body: JSON.stringify({
                name: name,
                tax_id: tax_id,
                address: address,
                city_name: city_name,
                province_name: province_name,
                country_name: country_name
            })
        })
        if (retry.status === 201 || retry.status === 409) {
            const data = await retry.json();
            return data;
        }
        if (retry.status === 401) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
    }
}