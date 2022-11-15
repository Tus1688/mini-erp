import { EuiProvider, EuiThemeAmsterdam } from '@elastic/eui';
import {
    createBrowserRouter,
    Navigate,
    RouterProvider,
    useLocation,
} from 'react-router-dom';
import Root from './components/Root';
import useTheme from './hooks/useTheme';
import Login from './routes/Login';
import useToken from './hooks/useToken';
import React, { useEffect, useState } from 'react';
import { isAuthenticatedRequest } from './api/Authentication';
import CustomerList from './routes/CustomerList';
import GeoList from './routes/GeoList';
import StockList from './routes/StockList';

export default function App() {
    const { theme } = useTheme();
    const { setToken } = useToken();

    const router = createBrowserRouter([
        {
            path: '/login',
            element: <Login setToken={setToken} />,
        },
        {
            path: '/',
            element: (
                <RequireAuth>
                    <Root />
                </RequireAuth>
            ),
            children: [
                {
                    path: '/',
                    element: <div>this is home</div>,
                },
                {
                    path: '/customer-list',
                    element: <CustomerList />,
                },
                {
                    path: '/geo',
                    element: <GeoList />,
                },
                {
                    path: '/stock-list',
                    element: <StockList />
                },
                {
                    path: '/finance',
                    element: <div>finance</div>,
                },
                {
                    path: '/settings',
                    element: <div>settings</div>,
                },
            ],
        },
    ]);

    return (
        <EuiProvider colorMode={theme} theme={EuiThemeAmsterdam}>
            <RouterProvider router={router} />
        </EuiProvider>
    );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
    let location = useLocation();
    const [isLoggedIn, setLoggedIn] = useState<boolean | null>(null);

    const updateLoginState = async () => {
        setLoggedIn(await isAuthenticatedRequest());
    };

    useEffect(() => {
        updateLoginState();
    }, []);

    switch (isLoggedIn) {
        case null:
            return <div>Loading...</div>;
        case true:
            return <>{children}</>;
        case false:
            return <Navigate to='/login' state={{ from: location }} replace />;
    }
}
