import {
    EuiPanel,
    EuiSpacer,
    EuiText,
    EuiTextAlign,
    EuiTitle,
} from '@elastic/eui';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchStockLow } from '../../api/Stock';
import {
    Chart as ChartJS,
    RadialLinearScale,
    ArcElement,
    Tooltip,
    Legend,
    ChartData,
} from 'chart.js';
import { PolarArea } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

const LowStockPanel = () => {
    const [data, setData] =
        useState<ChartData<'polarArea', number[], string>>();
    let location = useLocation();
    let navigate = useNavigate();

    useEffect(() => {
        fetchStockLow({
            location: location,
            navigate: navigate,
        }).then((data) => {
            if (data) {
                const labels = data.map((item) => item.variant_name);
                const values = data.map((item) => item.quantity);
                setData({
                    labels: labels,
                    datasets: [
                        {
                            label: 'Current Stock',
                            data: values,
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.2)',
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)',
                            ],
                            borderWidth: 1,
                        },
                    ],
                });
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
                {data ? (
                    <PolarArea
                        data={data}
                        options={{
                            scales: {
                                r: {
                                    display: false,
                                },
                            },
                        }}
                        onClick={() => {
                            navigate('/production-draft', {
                                state: {
                                    from: location,
                                    createModal: true,
                                },
                            })
                        }}
                        style={{ cursor: 'pointer' }}
                    />
                ) : (
                    <>
                        <EuiText>There is no data yet ...</EuiText>
                    </>
                )}
            </EuiTextAlign>
        </EuiPanel>
    );
};

export default LowStockPanel;
