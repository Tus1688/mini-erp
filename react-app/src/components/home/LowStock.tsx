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
        // max width to 40% of screen size
        <EuiPanel paddingSize='l'>
            <EuiTextAlign textAlign='center'>
                <EuiTitle size='xs'>
                    <h2>Low Stock ({'<'}100pcs)</h2>
                </EuiTitle>
                <EuiSpacer size='l' />
                <EuiFlexGroup
                    wrap={true}
                    justifyContent='center'
                    alignItems='center'
                    direction='column'
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
                                        <EuiTitle size='m'>
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
                        <EuiFlexItem grow={false}>
                            <EuiPanel
                                color='plain'
                                hasBorder={true}
                                hasShadow={true}
                                paddingSize='s'
                            >
                                <EuiButtonEmpty
                                    onClick={() =>
                                        navigate('/stock-list', {
                                            state: {
                                                from: location,
                                            },
                                        })
                                    }
                                >
                                    <EuiTitle size='m'>
                                        <h2>There is no Low Stock</h2>
                                    </EuiTitle>
                                </EuiButtonEmpty>
                            </EuiPanel>
                        </EuiFlexItem>
                    )}
                </EuiFlexGroup>
            </EuiTextAlign>
        </EuiPanel>
    );
};

export default LowStockPanel;
