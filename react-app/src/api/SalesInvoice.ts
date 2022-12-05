import { Location, NavigateFunction } from 'react-router-dom';
import {
    BestCustomer,
    salesInvoiceOnCreate,
    salesInvoiceSpecific,
    weeklyRevenue,
} from '../type/SalesInvoice';
import { getRefreshToken } from './Authentication';

// combine draft and approved invoices @draft = boolean (true = draft, false = approved)
export const fetchSalesInvoiceSpecific = async ({
    id,
    navigate,
    location,
    draft,
}: {
    id: number;
    navigate: NavigateFunction;
    location: Location;
    draft: boolean;
}): Promise<salesInvoiceSpecific | undefined> => {
    let baseUrl;
    if (!draft) {
        baseUrl = `/api/v1/finance/sales-invoice?id=${id}`;
    } else {
        baseUrl = `/api/v1/finance/sales-invoice-draft?id=${id}`;
    }

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
        if (retry.status === 200 || retry.status === 404) {
            const data = await retry.json();
            return data;
        }
        if (retry.status === 401 || retry.status === 403) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
    }
};

export const createSalesInvoice = async ({
    data,
    navigate,
    location,
}: {
    data: salesInvoiceOnCreate;
    navigate: NavigateFunction;
    location: Location;
}) => {
    let baseUrl = '/api/v1/finance/sales-invoice-draft';
    let body = JSON.stringify(data);
    const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: sessionStorage.getItem('token') || '',
        },
        body: body,
    });
    if (res.status === 201 || res.status === 404 || res.status === 409) {
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
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: sessionStorage.getItem('token') || '',
            },
            body: body,
        });
        if (
            retry.status === 201 ||
            retry.status === 404 ||
            retry.status === 409
        ) {
            const data = await retry.json();
            return data;
        }
        if (retry.status === 401 || retry.status === 403) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
    }
};

export const fetchSOCount = async ({
    location,
    navigate,
}: {
    location: Location;
    navigate: NavigateFunction;
}): Promise<number | undefined> => {
    let baseUrl = '/api/v1/finance/sales-invoice-count';
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

export const fetchSODraftCount = async ({
    location,
    navigate,
}: {
    location: Location;
    navigate: NavigateFunction;
}): Promise<number | undefined> => {
    let baseUrl = '/api/v1/finance/sales-invoice-draft-count';
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

export const fetchWeeklyRevenue = async ({
    location,
    navigate,
}: {
    location: Location;
    navigate: NavigateFunction;
}): Promise<weeklyRevenue[] | undefined> => {
    let baseUrl = '/api/v1/finance/weekly-revenue';
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

export const fetchBestCustomerSalesInvoice = async ({
    location,
    navigate,
}: {
    location: Location;
    navigate: NavigateFunction;
}): Promise<BestCustomer[] | undefined> => {
    let baseUrl = '/api/v1/finance/best-customer';
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
