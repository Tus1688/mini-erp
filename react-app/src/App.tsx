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
import React, { Suspense, useEffect, useState } from 'react';
import { isAuthenticatedRequest } from './api/Authentication';
import Loading from './components/Loading';

const CustomerList = React.lazy(() => import('./routes/CustomerList'));
const StockList = React.lazy(() => import('./routes/StockList'));
const ProductionDraftList = React.lazy(
    () => import('./routes/ProductionDraftList')
);
const VariantList = React.lazy(() => import('./routes/VariantList'));
const BatchList = React.lazy(() => import('./routes/BatchList'));
const SOList = React.lazy(() => import('./routes/SOList'));
const TOPList = React.lazy(() => import('./routes/TOPList'));
const SoDraftList = React.lazy(() => import('./routes/SODraftList'));
const ProfileSettings = React.lazy(() => import('./routes/ProfileSettings'));
const UserList = React.lazy(() => import('./routes/UserList'));

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
                    element: <VariantList />,
                },
                {
                    path: '/batch-list',
                    element: <BatchList />,
                },
                {
                    path: '/stock-list',
                    element: <StockList />,
                },
                {
                    path: '/production-draft',
                    element: <ProductionDraftList />,
                },
                {
                    path: '/top-list',
                    element: <TOPList />,
                },
                {
                    path: '/so-list',
                    element: <SOList />,
                },
                {
                    path: '/so-draft-list',
                    element: <SoDraftList />,
                },
                {
                    path: '/profile-settings',
                    element: <ProfileSettings />,
                },
                {
                    path: '/users',
                    element: <UserList />
                }
            ],
        },
    ]);

    return (
        <EuiProvider colorMode={theme} theme={EuiThemeAmsterdam}>
            <Suspense fallback={<Loading />}>
                <RouterProvider router={router} />
            </Suspense>
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
