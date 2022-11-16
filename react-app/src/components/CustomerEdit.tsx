import {
    EuiComboBox,
    EuiFieldText,
    EuiForm,
    EuiFormRow,
    EuiModal,
    EuiModalBody,
    EuiModalHeader,
    EuiModalHeaderTitle,
} from '@elastic/eui';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchCustomerSpecific } from '../api/Customer';


const CustomerEditModal = ({
    id,
    toggleModal,
}: {
    id: number;
    toggleModal: (value: React.SetStateAction<boolean>) => void;
}) => {
    let location = useLocation();
    let navigate = useNavigate();
    const [customerName, setCustomerName] = useState<string>();
    const [cityOption, setCityOption] = useState([{id: '1', label: 'value'}]);
    const [citySelected, setCitySelected] = useState();
    const [CityPopover, setCityPopover] = useState(false);

    useEffect(() => {
        fetchCustomerSpecific({id: id, navigate: navigate, location: location}).then((data) => {
            if (data) {
                setCustomerName(data.name);
            }
        })
    }, [id, navigate, location]);

    return (
        <EuiModal onClose={() => toggleModal(false)}>
            <EuiModalHeader>
                <EuiModalHeaderTitle>
                    <h1>Customer Edit</h1>
                </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
                <EuiForm id='Customer Edit Form' component='form'>
                    <EuiFormRow label='Customer Name'>
                        <EuiFieldText
                            name='Customer Name'
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                        />
                    </EuiFormRow>
                    <EuiFormRow label='City'>
                        <EuiComboBox
                            placeholder='Select a city'
                            options={cityOption}
                            singleSelection={{ asPlainText: true }}
                            />
                    </EuiFormRow>
                </EuiForm>
            </EuiModalBody>
        </EuiModal>
    );
};

export default CustomerEditModal;
