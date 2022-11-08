import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout';

function App() {
    const router = createBrowserRouter([
        {
            path: '/',
            element: (
               <Layout>
                    <h1>hello world</h1>
               </Layout> 
            )
        }
    ]);
    return (
        <RouterProvider router={router} />
    );
}

export default App;
