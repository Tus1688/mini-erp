import {
    EuiFieldPassword,
    EuiFieldText,
    EuiPageBody,
    EuiPageTemplate,
    EuiSpacer,
    EuiTextAlign,
    EuiTextColor,
    EuiTitle,
    useEuiTheme,
} from "@elastic/eui";
import { colorPalette } from "@elastic/eui/src/services/color/color_palette";
import { css } from "@emotion/css";
import { ThemeContext } from "@emotion/react";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Token } from "../hooks/useToken";

const loginUser = async (credentials: {
    username: string;
    password: string;
}) => {
    const res = await fetch("api/v1/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    });
    if (res.status === 200) {
        return res.json();
    }
    if (res.status === 401) {
        return res.json();
    }
    if (res.status === 403) {
        const retry = await fetch("api/v1/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        });
        if (retry.status === 200) {
            return retry.json();
        }
        if (retry.status === 401) {
            return { error: "Invalid username or password" };
        }
    }
};

const Login = ({ setToken }: { setToken: (userToken: string) => void }) => {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [invalidCreds, setInvalidCreds] = React.useState(false);
    const { euiTheme } = useEuiTheme();
    let navigate = useNavigate();
    let location = useLocation();

    let from = location.state?.from?.pathname || "/";

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const token: Token = await loginUser({
            username,
            password,
        });
        if (token.error !== undefined) {
            alert(token.error);
            return;
        }
        setToken(token.token);
        navigate(from, { replace: true });
    };
    const formStyles = css`
        background-color: ${euiTheme.colors.success};
    `;

    return (
        <EuiPageTemplate>
            <EuiPageTemplate.Section
                alignment='center'
                style={{ marginBottom: "10rem" }}
            >
                <EuiTitle size='l'>
                    <EuiTextAlign textAlign='center'>
                        <h1>Login</h1>
                    </EuiTextAlign>
                </EuiTitle>
                <EuiSpacer size='l' />
                <EuiFieldText
                    placeholder='Enter your username here'
                    icon={{ type: "user", side: "left" }}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <EuiSpacer size='xs' />
                <EuiFieldPassword
                    placeholder='Enter your password here'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </EuiPageTemplate.Section>
        </EuiPageTemplate>
    );
};

export default Login;
