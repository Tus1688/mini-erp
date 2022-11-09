import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout';
import Customers from './pages/Customers';

function App() {
    const router = createBrowserRouter([
        {
            path: '/',
            element: (
               <Layout />
            ),
            children: [
                {
                    path: '/',
                    element: <div>Hello this is home</div>
                },
                {
                    path: '/customers',
                    element: <Customers />
                },
                {
                    path: '/inventory',
                    element: <div>Hello this is inventory</div>
                }, 
                {
                    path: '/finance',
                    element: <div>Hello this is finance</div>
                },
                {
                    path: '/settings',
                    element: <div>Hello this is settings</div>
                }
            ]
        }
    ]);
    return (
        <RouterProvider router={router} />
    );
}

export default App;
