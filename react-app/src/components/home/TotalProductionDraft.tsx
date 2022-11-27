import {
    EuiButtonEmpty,
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
    let location = useLocation();
    let navigate = useNavigate();

    useEffect(() => {
        fetchProductionDraftCount({
            location: location,
            navigate: navigate,
        }).then((data) => {
            if (data) {
                setData(data);
            }
        });
    }, []);
    return (
        <EuiPanel paddingSize='l'>
            <EuiTextAlign textAlign='center'>
                <EuiTitle size='xs'>
                    <h2>Awaiting Approval Production:</h2>
                </EuiTitle>
                <EuiSpacer size='s' />
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
            </EuiTextAlign>
        </EuiPanel>
    );
};

export default TotalProductionDraftPanel;
