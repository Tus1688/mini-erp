import { useState } from "react";

export type Token = {
    token: string;
    error?: string;
}

export default function useToken(){
    const getToken = () => {
        return sessionStorage.getItem('token');
    }

    const [token, setToken] = useState<string | null>(getToken());

    const saveToken = (userToken: string) => {
        sessionStorage.setItem('token', userToken);
        setToken(userToken);
    }
    return {
        setToken: saveToken,
        token
    }
}