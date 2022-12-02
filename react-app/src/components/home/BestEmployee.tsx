import {
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
    ArcElement,
    Tooltip,
    Legend,
    ChartData,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { fetchBestEmployeeMetrics } from '../../api/Metrics';

ChartJS.register(ArcElement, Tooltip, Legend);

const BestEmployeePanel = () => {
    const [data, setData] = useState<ChartData<'doughnut', number[], string>>();

    let location = useLocation();
    let navigate = useNavigate();

    useEffect(() => {
        fetchBestEmployeeMetrics({
            location: location,
            navigate: navigate,
        }).then((data) => {
            if (data) {
                // map the array of data to the format that chartjs needs
                const labels = data.map((item) => item.name);
                const values = data.map((item) => item.total);
                setData({
                    labels: labels,
                    datasets: [
                        {
                            label: 'Sales Invoice created',
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
        <EuiPanel paddingSize='l'>
            <EuiTextAlign textAlign='center'>
                <EuiTitle size='xs'>
                    <h2>Best employees (30 days)</h2>
                </EuiTitle>
                <EuiSpacer size='s' />
                {data ? (
                    <Doughnut data={data} />
                ) : (
                    <>
                        <EuiText>There is no data yet ...</EuiText>
                    </>
                )}
            </EuiTextAlign>
        </EuiPanel>
    );
};

export default BestEmployeePanel;