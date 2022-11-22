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
import StockList from './routes/StockList';
import ProductionDraftList from './routes/ProductionDraftList';
import VariantList from './routes/VariantList';
import BatchList from './routes/BatchList';
import SOList from './routes/SOList';
import TOPList from './routes/TOPList';
import SoDraftList from './routes/SODraftList';

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
                    path: '/variant-list',
                    element: <VariantList />
                },
                {
                    path: '/batch-list',
                    element: <BatchList />
                },
                {
                    path: '/stock-list',
                    element: <StockList />
                },
                {
                    path: '/production-draft',
                    element: <ProductionDraftList />
                },
                {
                    path: '/top-list',
                    element: <TOPList />
                },
                {
                    path: '/so-list',
                    element: <SOList />
                },
                {
                    path: '/so-draft-list',
                    element: <SoDraftList />
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
