import {useState} from 'react'

export type toast = {
    title: string;
    text: JSX.Element;
    color?: "danger" | "primary" | "success" | "warning";
    iconType?: string;
    toastLifeTimeMs?: number;
    id: string;
}

export default function useToast() {
    const [toasts, setToasts] = useState<toast[]>([]);

    const getAllToasts = () => {
        return toasts;
    }

    const addToast = (toast: toast) => {
        // from current toast.id then +1 of the last toast in the array then concat those number with "toast-id"
        setToasts([...toasts, {...toast}]);
    }

    const removeToast = (removedToast: string) => {
        setToasts(toasts.filter(toast => toast.id !== removedToast));
    }

    const getNewId = () => {
        const lastToast = toasts[toasts.length - 1];
        const lastToastId = lastToast ? lastToast.id : "toast-id-0";
        const newId = parseInt(lastToastId.split("-")[2]) + 1;
        return `toast-id-${newId}`;
    }

    return {
        addToast,
        getAllToasts,
        removeToast,
        getNewId
    }
}