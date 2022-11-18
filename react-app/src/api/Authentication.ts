export const isAuthenticatedRequest = async(): Promise<boolean> => {
    const state = sessionStorage.getItem('state');
    if (state === "true") {
        return true;
    }
    const token = sessionStorage.getItem('token');
    if (token) {
        const response = await fetch('/api/v1/auth/util/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        });
        if (response.ok) {
            sessionStorage.setItem('state', 'true');
            return true;
        }
    }
    return false;
}

export const logoutRequest = async(): Promise<void> => {
    const response = await fetch('/api/v1/auth/util/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': sessionStorage.getItem('token') || ''
        }
    });
    if (response.ok) {
        sessionStorage.clear();
    }
    if (response.status === 401) {
        sessionStorage.clear();
        alert('Any act of unauthorized access will be reported to the local authorities, stop now!');
    }
}

export const getRefreshToken = async(): Promise<boolean> => {
    const response = await fetch('/api/v1/auth/util/refresh-token', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': sessionStorage.getItem('token') || ''
        },
    })
    if (response.ok) {
        // set the new token to the session storage
        const data = await response.json();
        sessionStorage.setItem('token', data.token);
        return true;
    }
    sessionStorage.clear();
    return false
}