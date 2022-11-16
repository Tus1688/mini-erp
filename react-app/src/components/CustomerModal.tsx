import {
    EuiButton,
    EuiDescriptionList,
    EuiModal,
    EuiModalBody,
    EuiModalFooter,
    EuiModalHeader,
    EuiModalHeaderTitle,
} from '@elastic/eui';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchCustomerSpecific } from '../api/Customer';
import { customerSpecific } from '../type/Customer';
import FlyoutDescriptionList from './FlyoutDescriptionList';

const CustomerModal = ({
    id,
    toggleModal,
}: {
    id: number;
    toggleModal: (value: React.SetStateAction<boolean>) => void;
}) => {
    let location = useLocation();
    let navigate = useNavigate();
    const [data, setData] = useState<customerSpecific>();

    useEffect(() => {
        fetchCustomerSpecific({
            id: id,
            navigate: navigate,
            location: location,
        }).then((data) => {
            setData(data);
        });
    }, [id, navigate, location]);

    return (
        <EuiModal onClose={() => toggleModal(false)}>
            <EuiModalHeader>
                <EuiModalHeaderTitle>
                    <h1>{data?.name}'s details</h1>
                </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
            <EuiDescriptionList>
                        <FlyoutDescriptionList
                            title='ID'
                            description={data?.id}
                        />
                        <FlyoutDescriptionList
                            title='Name'
                            description={data?.name}
                        />
                        <FlyoutDescriptionList
                            title='Tax ID'
                            description={data?.tax_id}
                        />
                        <FlyoutDescriptionList
                            title='Address'
                            description={data?.address}
                        />
                        <FlyoutDescriptionList
                            title='City'
                            description={data?.city_name}
                        />
                        <FlyoutDescriptionList
                            title='Province'
                            description={data?.province_name}
                        />
                        <FlyoutDescriptionList
                            title='Country'
                            description={data?.country_name}
                        />
                    </EuiDescriptionList>
            </EuiModalBody>
            <EuiModalFooter>
                <EuiButton onClick={() => toggleModal(false)}>Close</EuiButton>
            </EuiModalFooter>
        </EuiModal>
    );
};

export default CustomerModal;
