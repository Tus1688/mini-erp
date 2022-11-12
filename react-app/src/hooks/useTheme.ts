import { EuiThemeColorMode } from "@elastic/eui";
import { useState } from "react";

export default function useTheme() {
    const getTheme = ():EuiThemeColorMode => {
        // if sessionStorage theme is not set, use dark mode
        const theme = sessionStorage.getItem("theme") || "dark";
        return theme as EuiThemeColorMode;
    }

    const [theme, setTheme] = useState<EuiThemeColorMode>(getTheme());

    const toggleLightMode = () => {
        setTheme("light");
        sessionStorage.setItem("theme", "light");
    }

    const toggleDarkMode = () => {
        setTheme("dark");
        sessionStorage.setItem("theme", "dark");
    }
    return {
        toggleDarkMode,
        toggleLightMode,
        theme
    }
}