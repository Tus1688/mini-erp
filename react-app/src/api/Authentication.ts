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
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('state');
    }
    if (response.status === 401) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('state');
        alert('Any act of unauthorized access will be reported to the local authorities, stop now!');
    }
}