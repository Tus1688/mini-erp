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
    EuiModalHeader,
    EuiModalHeaderTitle,
    EuiSpacer,
} from '@elastic/eui';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useToast from '../hooks/useToast';
import { createTOP } from '../api/TOP';

const TOPCreateModal = ({
    toggleModal,
    setFetchedPage,
    setPagination,
    setData,
}: {
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
    const [name, setName] = useState<string>();
    const [dueDate, setDueDate] = useState<number>();
    const { addToast, getAllToasts, removeToast, getNewId } = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await createTOP({
            name: name || '',
            dueDate: dueDate || 0,
            navigate: navigate,
            location: location,
        }).then((data) => {
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
            toggleModal(false);
            setFetchedPage([]);
            setData([]);
            setPagination({
                pageIndex: 0,
                pageSize: 20,
            });
        });
    };

    return (
        <EuiModal onClose={() => toggleModal(false)}>
            <EuiModalHeader>
                <EuiModalHeaderTitle>
                    <h1>Term Of Payment Create</h1>
                </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
                <EuiForm
                    id='Batch Create Form'
                    component='form'
                    onSubmit={(e) => handleSubmit(e)}
                >
                    <EuiFormRow
                        label='Term Of Payment Name'
                        helpText='maximum 50 characters'
                    >
                        <EuiFieldText
                            name='Term Of Payment Name'
                            placeholder='Net 30'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={50}
                        />
                    </EuiFormRow>
                    <EuiFormRow
                        label='Term Of Payment Due Date'
                        helpText='number of days'
                    >
                        <EuiFieldNumber
                            placeholder='30'
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.valueAsNumber)}
                        />
                    </EuiFormRow>
                    <EuiSpacer size='l' />
                    <EuiFlexGroup justifyContent='flexEnd'>
                        <EuiButtonEmpty
                            color='danger'
                            onClick={() => toggleModal(false)}
                        >
                            cancel
                        </EuiButtonEmpty>
                        <EuiButton color='success' type='submit'>
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
        </EuiModal>
    );
};

export default TOPCreateModal;
