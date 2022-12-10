import {
    EuiLoadingSpinner,
    EuiPanel,
    EuiSpacer,
    EuiTextAlign,
    EuiTitle,
} from '@elastic/eui';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchVariantCount } from '../../api/Variant';

const TotalVariantPanel = () => {
    const [data, setData] = useState<number>(0);
    const [isLoading, setLoading] = useState<boolean>(false);
    let location = useLocation();
    let navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        fetchVariantCount({
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
        <EuiPanel
            paddingSize='l'
            onClick={() => {
                navigate('/variant-list', { state: { from: location } });
            }}
        >
            <EuiTextAlign textAlign='center'>
                <EuiTitle size='xs'>
                    <h2>Total Variant</h2>
                </EuiTitle>
                <EuiSpacer size='s' />
                {isLoading ? (
                    <EuiLoadingSpinner size='xl' />
                ) : (
                    <EuiTitle size='m'>
                        <h2>{data}</h2>
                    </EuiTitle>
                )}
            </EuiTextAlign>
        </EuiPanel>
    );
};

export default TotalVariantPanel;
