import {
    EuiPanel,
    EuiTextAlign,
    EuiTitle,
    EuiSpacer,
    EuiText,
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

    let location = useLocation();
    let navigate = useNavigate();

    useEffect(() => {
        fetchProductionVsSalesMetrics({
            location: location,
            navigate: navigate,
        }).then((data) => {
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
                            backgroundColor: 'rgba(255, 99, 132, 0.5)',
                            borderWidth: 1.5,
                        },
                        {
                            label: 'Sales',
                            data: data2,
                            fill: false,
                            borderColor: 'rgb(53, 162, 235)',
                            backgroundColor: 'rgba(53, 162, 235, 0.5)',
                            borderWidth: 1.5
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
                {data ? (
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
