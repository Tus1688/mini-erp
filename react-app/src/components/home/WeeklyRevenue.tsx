import {
    EuiLoadingSpinner,
    EuiPanel,
    EuiSpacer,
    EuiText,
    EuiTextAlign,
    EuiTitle,
} from '@elastic/eui';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
    ChartData,
    ScatterDataPoint,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { fetchWeeklyRevenue } from '../../api/SalesInvoice';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

const WeeklyRevenuePanel = () => {
    const [data, setData] =
        useState<
            ChartData<'line', (number | ScatterDataPoint | null)[], unknown>
        >();
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
        },
    };
    const [isLoading, setLoading] = useState<boolean>(false);

    let location = useLocation();
    let navigate = useNavigate();
    useEffect(() => {
        setLoading(true);
        fetchWeeklyRevenue({
            location: location,
            navigate: navigate,
        }).then((data) => {
            setLoading(false);
            if (data) {
                const labels = data.map((item) =>
                    new Date(item.date).toLocaleDateString('id-ID')
                );
                setData({
                    labels: labels,
                    datasets: [
                        {
                            fill: true,
                            label: 'Rp.',
                            data: data.map((item) => item.total),
                            borderColor: 'rgb(53, 162, 235)',
                            backgroundColor: 'rgba(53, 162, 235, 0.2)',
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
                    <h2>Weekly Revenue</h2>
                </EuiTitle>
                <EuiSpacer size='s' />
                {isLoading ? (
                    <EuiLoadingSpinner size='xl' />
                ) : data ? (
                    <Line data={data} options={options} />
                ) : (
                    <>
                        <EuiText>There is no data yet ...</EuiText>
                    </>
                )}
            </EuiTextAlign>
        </EuiPanel>
    );
};

export default WeeklyRevenuePanel;
