import {
    EuiButtonEmpty,
    EuiLoadingSpinner,
    EuiPanel,
    EuiSpacer,
    EuiTextAlign,
    EuiTitle,
} from '@elastic/eui';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchSODraftCount } from '../../api/SalesInvoice';

const TotalSalesInvoiceDraftPanel = () => {
    const [data, setData] = useState<number>(0);
    const [isLoading, setLoading] = useState<boolean>(false);
    let location = useLocation();
    let navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        fetchSODraftCount({
            location: location,
            navigate: navigate,
        }).then((data) => {
            setLoading(false);
            if (data) {
                setData(data);
            }
        });
    }, [location, navigate]);
    return (
        <EuiPanel paddingSize='l'>
            <EuiTextAlign textAlign='center'>
                <EuiTitle size='xs'>
                    <h2>Awaiting Sales Invoice Approval</h2>
                </EuiTitle>
                <EuiSpacer size='s' />
                {isLoading ? (
                    <EuiLoadingSpinner size='xl' />
                ) : (
                    <EuiButtonEmpty
                        onClick={() =>
                            navigate('/so-draft-list', {
                                state: { from: location },
                            })
                        }
                    >
                        <EuiTitle size='m'>
                            <h2>{data}</h2>
                        </EuiTitle>
                    </EuiButtonEmpty>
                )}
            </EuiTextAlign>
        </EuiPanel>
    );
};

export default TotalSalesInvoiceDraftPanel;
