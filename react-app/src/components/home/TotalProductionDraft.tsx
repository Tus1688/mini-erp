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
import { fetchProductionDraftCount } from '../../api/ProductionDraft';

const TotalProductionDraftPanel = () => {
    const [data, setData] = useState<number>(0);
    const [isLoading, setLoading] = useState<boolean>(false);
    let location = useLocation();
    let navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        fetchProductionDraftCount({
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
                    <h2>Awaiting Production Approval</h2>
                </EuiTitle>
                <EuiSpacer size='s' />
                {isLoading ? (
                    <EuiLoadingSpinner size='xl' />
                ) : (
                    <EuiButtonEmpty
                        onClick={() =>
                            navigate('/production-draft', {
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

export default TotalProductionDraftPanel;
