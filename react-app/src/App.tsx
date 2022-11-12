import {
    EuiProvider,
    EuiThemeAmsterdam,
} from '@elastic/eui';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from './components/Root';
import  useTheme  from './hooks/useTheme';
import Login from './routes/Login';
import useToken from './hooks/useToken';

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
            element: <Root />,
            children: [
                {
                    path: '/customers',
                    element: <div>customers</div>,
                },
                {
                    path: '/inventory',
                    element: <div>inventory</div>,
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
