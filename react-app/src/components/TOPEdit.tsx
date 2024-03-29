import {
    EuiButton,
    EuiButtonEmpty,
    EuiFieldNumber,
    EuiFieldText,
    EuiFlexGroup,
    EuiForm,
    EuiFormRow,
    EuiGlobalToastList,
    EuiModal,
    EuiModalBody,
    EuiModalFooter,
    EuiModalHeader,
    EuiModalHeaderTitle,
    EuiSpacer,
} from '@elastic/eui';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchTOPSpecific, patchTOP } from '../api/TOP';
import useToast from '../hooks/useToast';

const TOPEditModal = ({
    id,
    toggleModal,
    setFetchedPage,
    setPagination,
    setData, // from parent
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
    const [topName, setTopName] = useState<string>();
    const [dueDate, setDueDate] = useState<number>();
    const [errorModal, setErrorModal] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const { addToast, getAllToasts, removeToast, getNewId } = useToast();

    useEffect(() => {
        fetchTOPSpecific({
            id: id,
            navigate: navigate,
            location: location
        }).then((data) => {
            if (data) {
                if (data.error) {
                    setErrorModal(true);
                    setErrorMessage(data.error);
                    return;
                }
                setTopName(data.name);
                setDueDate(data.due_date);
            }
        })
    }, [id,location,navigate]) 

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        await patchTOP({
            id: id,
            name: topName || '',
            dueDate: dueDate || 0,
            navigate: navigate,
            location: location
        }).then((data) => {
            if (data.message) {
                addToast({
                    id: getNewId(),
                    title: 'Updated Term of Payment',
                    color: 'success',
                    text: (
                        <>
                            <p>{data.message}</p>
                        </>
                    ),
                });
                return;
            }
            if (data.error) {
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
        })
    };

    return (
        <EuiModal onClose={() => toggleModal(false)}>
            <EuiModalHeader>
                <EuiModalHeaderTitle>
                    <h1>Variant Edit</h1>
                </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
                <EuiForm
                    id='Term Of Payment Edit Form'
                    component='form'
                    onSubmit={(e) => handleSubmit(e)}
                >
                    <EuiFormRow label='Term Of Payment Name'>
                        <EuiFieldText
                            name='Term Of Payment Name'
                            value={topName}
                            onChange={(e) => setTopName(e.target.value)}
                            maxLength={50}
                        />
                    </EuiFormRow>
                    <EuiFormRow label='Term Of Payment Due Date'>
                        <EuiFieldNumber
                            name='Due Date'
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.valueAsNumber)}
                            />
                    </EuiFormRow>
                    <EuiSpacer size='l' />
                    <EuiFlexGroup justifyContent='flexEnd'>
                        <EuiButtonEmpty onClick={() => toggleModal(false)}>
                            cancel
                        </EuiButtonEmpty>
                        <EuiButton color='primary' type='submit'>
                            Submit
                        </EuiButton>
                    </EuiFlexGroup>
                    <EuiSpacer size='m' />
                </EuiForm>
            </EuiModalBody>
            <EuiGlobalToastList
                toasts={getAllToasts()}
                dismissToast={({ id }) => removeToast(id)}
                toastLifeTimeMs={5000}
            />
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


export default TOPEditModal;