import {
    EuiProvider,
    EuiThemeAmsterdam,
    EuiThemeColorMode,
} from "@elastic/eui";
import { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./components/Root";

export default function App() {
    const [color, setColorMode] = useState<EuiThemeColorMode>("dark");
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Root />,
            children: [
                {
                    path: "/customers",
                    element: <div>customers</div>,
                },
                {
                    path: "/inventory",
                    element: <div>inventory</div>,
                },
                {
                    path: "/finance",
                    element: <div>finance</div>,
                },
                {
                    path: "/settings",
                    element: <div>settings</div>,
                },
            ],
        },
    ]);

    return (
        <EuiProvider colorMode={color} theme={EuiThemeAmsterdam}>
            <RouterProvider router={router} />
        </EuiProvider>
    );
}
