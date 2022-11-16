import {
    EuiForm,
    EuiFormRow,
    EuiModal,
    EuiModalBody,
    EuiModalHeader,
    EuiModalHeaderTitle,
    EuiText,
} from '@elastic/eui';

const CustomerEditModal = ({
    id,
    toggleModal,
}: {
    id: number;
    toggleModal: (value: React.SetStateAction<boolean>) => void;
}) => {
    return (
        <EuiModal onClose={() => toggleModal(false)}>
            <EuiModalHeader>
                <EuiModalHeaderTitle>
                    <h1>Customer Edit</h1>
                </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
                <EuiForm id="Customer Edit Form" component='form'>
                    <EuiFormRow>
                        
                    </EuiFormRow>
                </EuiForm>
            </EuiModalBody>
        </EuiModal>
    );
};

export default CustomerEditModal;
