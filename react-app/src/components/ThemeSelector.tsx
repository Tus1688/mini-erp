import React from 'react';
import useTheme from '../hooks/useTheme';

/**
 * The theme components only imports it's theme CSS-file. These components are lazy
 * loaded, to enable "code splitting" (in order to avoid the themes being bundled together)
 */
const ThemeDark = React.lazy(() => import('../themes/ThemeDark'));
const ThemeLight = React.lazy(() => import('../themes/ThemeLight'));

const ThemeSelector = ({ children }: any) => {
    const {theme} = useTheme();
    const currentTheme = theme;

    return (
    <>
        {/* Conditionally render theme, based on the current client context */}
        <React.Suspense>
            {currentTheme === "dark" && <ThemeDark />}
            {currentTheme === "light" && <ThemeLight />}
        </React.Suspense>
        {/* Render children immediately! */}
        {children}
    </>
)};

export default ThemeSelector;
