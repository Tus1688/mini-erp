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

const SalesInvoiceDraftDelete = ({
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

    const deleteSODraft = async (id: number) => {
        let baseUrl = `/api/v1/finance/sales-invoice-draft?id=${id}`;
        const res = await fetch(baseUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: sessionStorage.getItem('token') || '',
            },
        });
        if (res.status === 404) {
            let data = await res.json();

            addToast({
                id: getNewId(),
                title: 'Error',
                color: 'danger',
                text: (
                    <>
                        <p>{data.error}<br /> Somebody must have delete/approve it</p>
                    </>
                )
            })
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
            const retry = await fetch(baseUrl, {
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
            if (retry.status === 404) {
                let data = await res.json();

                addToast({
                    id: getNewId(),
                    title: 'Error',
                    color: 'danger',
                    text: (
                        <>
                            <p>{data.error}<br /> Somebody must have delete/approve it</p>
                        </>
                    )
                })
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
                    <h2>Delete sales invoice draft</h2>
                </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
                <EuiText>
                    <p>
                        You&rsquo;re about to delete sales invoice draft
                        <br />
                        Are you sure you want to do this?
                    </p>
                </EuiText>
            </EuiModalBody>
            <EuiModalFooter>
                <EuiButtonEmpty onClick={() => toggleModal(false)}>
                    Cancel
                </EuiButtonEmpty>
                <EuiButton onClick={() => deleteSODraft(id)} fill color='danger'>
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

export default SalesInvoiceDraftDelete;
