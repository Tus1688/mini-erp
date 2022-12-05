import {
    EuiButton,
    EuiButtonEmpty,
    EuiModal,
    EuiModalBody,
    EuiModalFooter,
    EuiModalHeader,
    EuiModalHeaderTitle,
    EuiText,
} from '@elastic/eui';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getRefreshToken } from '../api/Authentication';

const ProductionDraftApprove = ({
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
    const [errorModal, setErrorModal] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const approveProductionDraft = async (id: number) => {
        let baseUrl = `/api/v1/inventory/production?id=${id}`;
        const res = await fetch(baseUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: sessionStorage.getItem('token') || '',
            },
        });
        if (res.status === 404) {
            let data = await res.json();
            setErrorMessage(data.error);
            setErrorModal(true);
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
            if (retry.status === 404) {
                let data = await retry.json();
                setErrorMessage(data.error);
                setErrorModal(true);
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
                    <h2>Approve production draft</h2>
                </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
                <EuiText>
                    <p>
                        You&rsquo;re about to approve production draft
                        <br />
                        Are you sure you want to do this?
                    </p>
                </EuiText>
            </EuiModalBody>
            <EuiModalFooter>
                <EuiButtonEmpty onClick={() => toggleModal(false)}>
                    Cancel
                </EuiButtonEmpty>
                <EuiButton onClick={() => approveProductionDraft(id)} fill color='success'>
                    Yes, approve
                </EuiButton>
            </EuiModalFooter>
            {errorModal && (
                <EuiModal onClose={() => setErrorModal(false)}>
                    <EuiModalHeader>
                        <EuiModalHeaderTitle>Error</EuiModalHeaderTitle>
                    </EuiModalHeader>
                    <EuiModalBody>{errorMessage}</EuiModalBody>
                    <EuiModalFooter>
                        <EuiButton
                            onClick={() => {
                                setErrorModal(false);
                                toggleModal(false);
                                setData([]);
                                setFetchedPage([]);
                                setPagination({
                                    pageIndex: 0,
                                    pageSize: 20,
                                });
                            }}
                            color='danger'
                        >
                            I understand
                        </EuiButton>
                    </EuiModalFooter>
                </EuiModal>
            )}
        </EuiModal>
    );
};

export default ProductionDraftApprove;
