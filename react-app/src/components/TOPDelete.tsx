import {
    EuiButton,
    EuiButtonEmpty,
    EuiGlobalToastList,
    EuiModal,
    EuiModalBody,
    EuiModalFooter,
    EuiModalHeader,
    EuiModalHeaderTitle,
    EuiText,
} from '@elastic/eui';
import { useLocation, useNavigate } from 'react-router-dom';
import { getRefreshToken } from '../api/Authentication';
import useToast from '../hooks/useToast';

const TOPDeleteModal = ({
    id,
    toggleModal,
    setFetchedPage,
    setPagination,
    setData,
}: {
    id: number;
    toggleModal: (value: React.SetStateAction<boolean>) => void;
    setFetchedPage: React.Dispatch<React.SetStateAction<number[]>>;
    setPagination: React.Dispatch<
        React.SetStateAction<{
            pageIndex: number;
            pageSize: number;
        }>
    >;
    setData: React.Dispatch<
        React.SetStateAction<
            {
                [key: string]: React.ReactNode;
            }[]
        >
    >;
}) => {
    let location = useLocation();
    let navigate = useNavigate();

    const { addToast, getAllToasts, removeToast, getNewId } = useToast();

    const deleteTOP = async (id: number) => {
        const res = await fetch(`api/v1/finance/term-of-payment?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: sessionStorage.getItem('token') || '',
            },
        });
        if (res.status === 409) {
            let data = await res.json();

            addToast({
                id: getNewId(),
                title: 'Error',
                color: 'danger',
                text: (
                    <>
                        <p>{data.error}</p>
                    </>
                ),
            });
            return;
        }
        if (res.status === 200) {
            toggleModal(false);
            setFetchedPage([]);
            setData([]);
            setPagination({
                pageIndex: 0,
                pageSize: 20,
            });
            return;
        }
        if (res.status === 401) {
            const state = await getRefreshToken();
            if (!state) {
                navigate('/login', { state: { from: location } });
                return;
            }
            const retry = await fetch(`api/v1/finance/term-of-payment?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: sessionStorage.getItem('token') || '',
                },
            });
            if (retry.status === 200) {
                toggleModal(false);
                setFetchedPage([]);
                setData([]);
                setPagination({
                    pageIndex: 0,
                    pageSize: 20,
                });
                return;
            }
            if (retry.status === 409) {
                let data = await retry.json();

                addToast({
                    id: getNewId(),
                    title: 'Error',
                    color: 'danger',
                    text: (
                        <>
                            <p>{data.error}</p>
                        </>
                    ),
                });
                return;
            }
            if (retry.status === 401) {
                navigate('/login', { state: { from: location } });
                return;
            }
        }
    };

    return (
        <EuiModal onClose={() => toggleModal(false)}>
            <EuiModalHeader>
                <EuiModalHeaderTitle>
                    <h2>Delete Term Of Payment</h2>
                </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
                <EuiText>
                    <p>
                        You&rsquo;re about to delete Term Of Payment
                        <br />
                        Are you sure you want to do this?
                    </p>
                </EuiText>
            </EuiModalBody>
            <EuiModalFooter>
                <EuiButtonEmpty onClick={() => toggleModal(false)}>
                    Cancel
                </EuiButtonEmpty>
                <EuiButton
                    onClick={() => deleteTOP(id)}
                    fill
                    color='danger'
                >
                    Yes, delete it!
                </EuiButton>
            </EuiModalFooter>
            <EuiGlobalToastList
                toasts={getAllToasts()}
                dismissToast={({ id }) => removeToast(id)}
                toastLifeTimeMs={6000}
            />
        </EuiModal>
    );
};

export default TOPDeleteModal;
