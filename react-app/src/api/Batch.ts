import { NavigateFunction, Location } from "react-router-dom";
import { getRefreshToken } from "./Authentication";

export const createBatch = async({
    expiredDate,
    navigate,
    location
}: {
    expiredDate: string;
    navigate: NavigateFunction
    location: Location
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
        })
    })
    if (res.status === 201) {
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
            body: JSON.stringify({
                expired_date: expiredDate,
            })
        })
        if (retry.status === 201) {
            const data = await retry.json();
            return data;
        }
        if (retry.status === 401) {
            navigate('/login', { state: { from: location } });
            return;
        }
    }
}