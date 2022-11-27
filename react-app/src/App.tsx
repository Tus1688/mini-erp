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
const Home = React.lazy(() => import('./routes/Home'));

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
                    element: (
                        <Suspense fallback={<Loading />}>
                            <Home />
                        </Suspense>
                    )
                },
                {
                    path: '/customer-list',
                    element: (
                        <Suspense fallback={<Loading />}>
                            <CustomerList />
                        </Suspense>
                    ),
                },
                {
                    path: '/variant-list',
                    element: (
                        <Suspense fallback={<Loading />}>
                            <VariantList />
                        </Suspense>
                    ),
                },
                {
                    path: '/batch-list',
                    element: (
                        <Suspense fallback={<Loading />}>
                            <BatchList />
                        </Suspense>
                    ),
                },
                {
                    path: '/stock-list',
                    element: (
                        <Suspense fallback={<Loading />}>
                            <StockList />
                        </Suspense>
                    ),
                },
                {
                    path: '/production-draft',
                    element: (
                        <Suspense fallback={<Loading />}>
                            <ProductionDraftList />
                        </Suspense>
                    ),
                },
                {
                    path: '/top-list',
                    element: (
                        <Suspense fallback={<Loading />}>
                            <TOPList />
                        </Suspense>
                    ),
                },
                {
                    path: '/so-list',
                    element: (
                        <Suspense fallback={<Loading />}>
                            <SOList />
                        </Suspense>
                    ),
                },
                {
                    path: '/so-draft-list',
                    element: (
                        <Suspense fallback={<Loading />}>
                            <SoDraftList />
                        </Suspense>
                    ),
                },
                {
                    path: '/profile-settings',
                    element: (
                        <Suspense fallback={<Loading />}>
                            <ProfileSettings />
                        </Suspense>
                    )
                },
                {
                    path: '/users',
                    element: (
                        <Suspense fallback={<Loading />}>
                            <UserList />
                        </Suspense>
                    )
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
