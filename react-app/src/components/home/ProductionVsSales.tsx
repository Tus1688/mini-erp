import {
    EuiPanel,
    EuiTextAlign,
    EuiTitle,
    EuiSpacer,
    EuiText,
    EuiLoadingSpinner,
} from '@elastic/eui';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartData,
} from 'chart.js';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchProductionVsSalesMetrics } from '../../api/Metrics';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const ProductionVsSales = () => {
    const [data, setData] = useState<ChartData<'line', number[], string>>();
    const [isLoading, setLoading] = useState<boolean>(false);

    let location = useLocation();
    let navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        fetchProductionVsSalesMetrics({
            location: location,
            navigate: navigate,
        }).then((data) => {
            setLoading(false);
            if (data) {
                const labels = data.map((item) =>
                    new Date(item.date).toLocaleDateString('id-ID')
                );
                const data1 = data.map((item) => item.production);
                const data2 = data.map((item) => item.sales);
                setData({
                    labels: labels,
                    datasets: [
                        {
                            label: 'Production',
                            data: data1,
                            fill: false,
                            borderColor: 'rgb(255, 99, 132)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            borderWidth: 1.5,
                        },
                        {
                            label: 'Sales',
                            data: data2,
                            fill: false,
                            backgroundColor: 'rgba(54, 162, 239, 0.2)',
                            borderColor: 'rgba(54, 162, 239, 1)',
                            borderWidth: 1.5,
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
                    <h2>Production vs Sales</h2>
                </EuiTitle>
                <EuiSpacer size='s' />
                {isLoading ? (
                    <EuiLoadingSpinner size='xl' />
                ) : data ? (
                    <Line data={data} />
                ) : (
                    <>
                        <EuiText>There is no data yet ...</EuiText>
                    </>
                )}
            </EuiTextAlign>
        </EuiPanel>
    );
};

export default ProductionVsSales;
