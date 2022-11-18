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
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchVariantSpecific, patchVariant } from '../api/Variant';
import useToast from '../hooks/useToast';

const VariantEditModal = ({
    id,
    toggleModal,
}: {
    id: number;
    toggleModal: (value: React.SetStateAction<boolean>) => void;
}) => {
    let location = useLocation();
    let navigate = useNavigate();
    const [variantName, setVariantName] = useState<string>();
    const [description, setDescription] = useState<string>();
    const { addToast, getAllToasts, removeToast, getNewId } = useToast();

    useEffect(() => {
        fetchVariantSpecific({
            id: id,
            navigate: navigate,
            location: location,
        }).then((data) => {
            if (data) {
                setVariantName(data.name);
                setDescription(data.description);
            }
        });
    }, [id, location, navigate]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await patchVariant({
            id: id,
            name: variantName ? variantName : '',
            description: description ? description : '',
            navigate: navigate,
            location: location,
        }).then((data) => {
            if (data.message) {
                addToast({
                    id: getNewId(),
                    title: 'Updated variant',
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
        });
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
                    id='Variant Edit Form'
                    component='form'
                    onSubmit={(e) => handleSubmit(e)}
                >
                    <EuiFormRow label='Variant Name'>
                        <EuiFieldText
                            name='Variant Name'
                            value={variantName}
                            onChange={(e) => setVariantName(e.target.value)}
                            maxLength={30}
                        />
                    </EuiFormRow>
                    <EuiFormRow label='Description'>
                        <EuiFieldText
                            name='Description'
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={100}
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
        </EuiModal>
    );
};


export default VariantEditModal;