import {
    EuiButton,
    EuiButtonEmpty,
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
import { createVariant } from '../api/Variant';
import useToast from '../hooks/useToast';

const VariantCreateModal = ({
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
    const [variantName, setVariantName] = useState<string>();
    const [description, setDescription] = useState<string>();
    const { addToast, getAllToasts, removeToast, getNewId } = useToast();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await createVariant({
            name: variantName ? variantName : '',
            description: description ? description : '',
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
                    <h1>Variant Create</h1>
                </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
                <EuiForm
                    id='Variant Create Form'
                    component='form'
                    onSubmit={(e) => handleSubmit(e)}
                >
                    <EuiFormRow
                        label='Variant name'
                        helpText='maximum 30 characters'
                    >
                        <EuiFieldText
                            name='Variant name'
                            placeholder='Rawon'
                            value={variantName}
                            onChange={(e) => setVariantName(e.target.value)}
                            maxLength={30}
                        />
                    </EuiFormRow>
                    <EuiFormRow
                        label='Variant description'
                        helpText='maximum 100 characters'
                    >
                        <EuiFieldText
                            name='Variant description'
                            placeholder='Rawon is a traditional Indonesian cuisine'
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={100}
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

export default VariantCreateModal;
