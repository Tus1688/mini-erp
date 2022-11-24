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

const SalesInvoiceDraftApprove = ({
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

    const approveSODraft = async (id: number) => {
        let baseUrl = `/api/v1/finance/sales-invoice-draft?id=${id}`;
        const res = await fetch(baseUrl, {
            method: 'PUT',
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
        if (res.status === 500) {
            let data = await res.json();
            addToast({
                id: getNewId(),
                title: 'Error',
                color: 'danger',
                text: (
                    <>
                        <p>Uh-oh, {data.error}</p>
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
        if (res.status === 403 ) {
            navigate('/login', { state: { from: location } });
            return;
        }
        if (res.status === 401) {
            const state = await getRefreshToken();
            if (!state) {
                navigate('/login', { state: { from: location } });
                return;
            }
            const retry = await fetch(baseUrl, {
                method: 'PUT',
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
            if (retry.status === 500) {
                let data = await retry.json();
                addToast({
                    id: getNewId(),
                    title: 'Error',
                    color: 'danger',
                    text: (
                        <>
                            <p>Uh-oh, {data.error}</p>
                        </>
                    )
                })

            }
            if (retry.status === 404) {
                let data = await retry.json();

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
            if (retry.status === 401 || retry.status === 403) {
                navigate('/login', { state: { from: location } });
                return;
            }
        }
    };

    return (
        <EuiModal onClose={() => toggleModal(false)}>
            <EuiModalHeader>
                <EuiModalHeaderTitle>
                    <h2>Approve sales invoice draft</h2>
                </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
                <EuiText>
                    <p>
                        You&rsquo;re about to approve sales invoice draft
                        <br />
                        Are you sure you want to do this?
                    </p>
                </EuiText>
            </EuiModalBody>
            <EuiModalFooter>
                <EuiButtonEmpty onClick={() => toggleModal(false)}>
                    Cancel
                </EuiButtonEmpty>
                <EuiButton onClick={() => approveSODraft(id)} fill color='success'>
                    Yes, approve
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

export default SalesInvoiceDraftApprove;