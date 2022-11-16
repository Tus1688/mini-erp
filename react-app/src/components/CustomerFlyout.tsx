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
import { getRefreshToken } from '../api/Authentication';
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

    const fetchCustomerSpecific = async (
        id: number
    ): Promise<customerSpecific | undefined> => {
        let baseUrl = `/api/v1/customer?id=${id}`;
        console.log(baseUrl);
        const res = await fetch(baseUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: sessionStorage.getItem('token') || '',
            },
        });
        if (res.status === 200) {
            const data = await res.json();
            return data;
        }
        if (res.status === 401) {
            const state = await getRefreshToken();
            if (!state) {
                navigate('/login', { state: { from: location.pathname } });
                return;
            }
            // retry
            const retry = await fetch(baseUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: sessionStorage.getItem('token') || '',
                },
            });
            if (retry.status === 200) {
                const data = await retry.json();
                return data;
            }
            if (retry.status === 401) {
                navigate('/login', { state: { from: location.pathname } });
                return;
            }
        }
    };

    useEffect(() => {
        fetchCustomerSpecific(id).then((data) => {
            setData(data);
        });
    }, [id]);

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
