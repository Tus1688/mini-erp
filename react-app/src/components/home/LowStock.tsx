import {
    EuiLoadingChart,
    EuiLoadingSpinner,
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
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartData,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const LowStockPanel = () => {
    const [data, setData] = useState<ChartData<'bar', number[], string>>();
    const [isLoading, setLoading] = useState<boolean>(false);
    let location = useLocation();
    let navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        fetchStockLow({
            location: location,
            navigate: navigate,
        }).then((data) => {
            setLoading(false);
            if (data) {
                const labels = data.map((item) => item.variant_name);
                const values = data.map((item) => item.quantity);
                setData({
                    labels: labels,
                    datasets: [
                        {
                            label: 'Current Stock',
                            data: values,
                            backgroundColor: ['rgba(54, 162, 235, 0.2)'],
                            borderColor: ['rgba(54, 162, 235, 1)'],
                            borderWidth: 1,
                        },
                    ],
                });
            }
        });
    }, [location, navigate]);
    return (
        <EuiPanel paddingSize='l'>
            <EuiTextAlign textAlign='center'>
                <EuiTitle size='xs'>
                    <h2>Low Stock ({'<'}100pcs)</h2>
                </EuiTitle>
                <EuiSpacer size='l' />
                {isLoading ? (
                    <EuiLoadingSpinner size="xl" />
                ) : data ? (
                    <Bar
                        // set height to fill parent container
                        height='300px'
                        data={data}
                        options={{
                            responsive: true,
                            scales: {
                                y: {
                                    max: 100,
                                },
                            },
                        }}
                        onClick={() => {
                            navigate('/production-draft', {
                                state: {
                                    from: location,
                                    createModal: true,
                                },
                            });
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
