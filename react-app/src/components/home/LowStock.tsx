import {
    EuiButtonEmpty,
    EuiFlexGroup,
    EuiFlexItem,
    EuiPanel,
    EuiSpacer,
    EuiTextAlign,
    EuiTitle,
} from '@elastic/eui';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchStockLow } from '../../api/Stock';
import { stockProps } from '../../type/Stock';

const LowStockPanel = () => {
    const [data, setData] = useState<stockProps[] | undefined>(undefined);
    let location = useLocation();
    let navigate = useNavigate();

    useEffect(() => {
        fetchStockLow({
            location: location,
            navigate: navigate,
        }).then((data) => {
            if (!data.error) {
                setData(data);
            }
        });
    }, [location, navigate]);
    return (
        <EuiPanel paddingSize='xl'>
            <EuiTextAlign textAlign='center'>
                <EuiTitle size='xs'>
                    <h2>Low Stock</h2>
                </EuiTitle>
                <EuiSpacer size='l' />
                <EuiFlexGroup
                    wrap={true}
                    justifyContent='center'
                    alignItems='center'
                >
                    {data ? (
                        data.map((item) => (
                            <EuiFlexItem grow={false}>
                                <EuiPanel
                                    color='plain'
                                    hasBorder={true}
                                    hasShadow={true}
                                    paddingSize='s'
                                >
                                    <EuiButtonEmpty
                                        onClick={() =>
                                            navigate('/production-draft', {
                                                state: {
                                                    from: location,
                                                    createModal: true,
                                                },
                                            })
                                        }
                                    >
                                        <EuiTitle size='s'>
                                            <h2>
                                                {item.variant_name} [
                                                {item.quantity} pcs]
                                            </h2>
                                        </EuiTitle>
                                    </EuiButtonEmpty>
                                </EuiPanel>
                            </EuiFlexItem>
                        ))
                    ) : (
                        <EuiButtonEmpty onClick={() => navigate('/stock-list')}>
                            <EuiTitle size='m'>
                                <h1>0</h1>
                            </EuiTitle>
                        </EuiButtonEmpty>
                    )}
                </EuiFlexGroup>
            </EuiTextAlign>
        </EuiPanel>
    );
};

export default LowStockPanel;
