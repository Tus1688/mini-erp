import {
    EuiPortal,
    EuiFlyout,
    EuiFlyoutHeader,
    EuiTitle,
    EuiFlyoutBody,
    EuiDescriptionList,
} from '@elastic/eui';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchCustomerSpecific } from '../api/Customer';
import { customerSpecific } from '../type/Customer';
import FlyoutDescriptionList from './FlyoutDescriptionList';

const CustomerFlyout = ({
    id,
    toggleFlyout,
}: {
    id: number;
    toggleFlyout: (value: React.SetStateAction<boolean>) => void;
}) => {
    let location = useLocation();
    let navigate = useNavigate();
    const [data, setData] = useState<customerSpecific>();

    useEffect(() => {
        fetchCustomerSpecific({id: id, navigate: navigate, location: location}).then((data) => {
            setData(data);
        });
    }, [id, navigate, location]);

    return (
        <EuiPortal>
            <EuiFlyout ownFocus onClose={() => toggleFlyout(false)}>
                <EuiFlyoutHeader hasBorder>
                    <EuiTitle size='m'>
                        <h2>{data?.name}'s details</h2>
                    </EuiTitle>
                </EuiFlyoutHeader>
                <EuiFlyoutBody>
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
                </EuiFlyoutBody>
            </EuiFlyout>
        </EuiPortal>
    );
};

export default CustomerFlyout;
