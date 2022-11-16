import { EuiConfirmModal, EuiGlobalToastList } from '@elastic/eui';
import { useLocation, useNavigate } from 'react-router-dom';
import { getRefreshToken } from '../api/Authentication';
import useToast from '../hooks/useToast';

const CustomerDeleteModal = ({
    id,
    toggleModal,
}: {
    id: number;
    toggleModal: (value: React.SetStateAction<boolean>) => void;
}) => {
    let location = useLocation();
    let navigate = useNavigate();

    const { addToast, getAllToasts, removeToast, getNewId } = useToast();

    const deleteCustomer = async (id: number) => {
        const res = await fetch(`api/v1/customer?id=${id}`, {
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
            return;
        }
        if (res.status === 401) {
            const state = getRefreshToken();
            if (!state) {
                navigate('/login', { state: { from: location } });
                return;
            }
            const retry = await fetch(`api/v1/customer?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: sessionStorage.getItem('token') || '',
                },
            });
            if (retry.status === 200) {
                toggleModal(false);
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
        <>
            <EuiConfirmModal
                title='Delete customer'
                onCancel={() => toggleModal(false)}
                onConfirm={() => deleteCustomer(id)}
                cancelButtonText='Cancel'
                confirmButtonText='Yes, delete it'
                buttonColor='danger'
                defaultFocusedButton='confirm'
            >
                <p>
                    You&rsquo;re about to delete customer
                    <br />
                    Are you sure you want to do this?
                </p>
            </EuiConfirmModal>
            <EuiGlobalToastList
                toasts={getAllToasts()}
                dismissToast={({ id }) => removeToast(id)}
                toastLifeTimeMs={6000}
            />
        </>
    );
};

export default CustomerDeleteModal;
