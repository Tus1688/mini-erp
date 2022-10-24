import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';

const App: React.FC = () => {
    const router = createBrowserRouter([
        {
            path: '/',
            element: <div>home page</div>,
            errorElement: <h1>error 404</h1>
        }
    ]);

    return (
        <RouterProvider router={router} />
    );
}

export default App;
