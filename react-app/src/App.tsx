import {
    EuiProvider,
    EuiThemeAmsterdam,
} from '@elastic/eui';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from './components/Root';
import '@elastic/eui/dist/eui_theme_dark.css';
import  useTheme  from './hooks/useTheme';

export default function App() {
    const { theme } = useTheme();

    const router = createBrowserRouter([
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
