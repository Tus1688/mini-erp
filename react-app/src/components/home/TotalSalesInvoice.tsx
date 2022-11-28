import {
    EuiButtonEmpty,
    EuiPanel,
    EuiSpacer,
    EuiTextAlign,
    EuiTitle,
} from '@elastic/eui';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchSOCount } from '../../api/SalesInvoice';

const TotalSalesInvoicePanel = () => {
    const [data, setData] = useState<number>(0);
    let location = useLocation();
    let navigate = useNavigate();

    useEffect(() => {
        fetchSOCount({
            location: location,
            navigate: navigate,
        }).then((data) => {
            if (data) {
                setData(data);
            }
        });
    }, [location, navigate]);
    return (
        <EuiPanel paddingSize='l'>
            <EuiTextAlign textAlign='center'>
                <EuiTitle size='xs'>
                    <h2>Total Sales Invoice</h2>
                </EuiTitle>
                <EuiSpacer size='s' />
                <EuiButtonEmpty
                    onClick={() =>
                        navigate('/so-list', { state: { from: location } })
                    }
                >
                    <EuiTitle size='m'>
                        <h2>{data}</h2>
                    </EuiTitle>
                </EuiButtonEmpty>
            </EuiTextAlign>
        </EuiPanel>
    );
};

export default TotalSalesInvoicePanel;