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
    ArcElement,
    Tooltip,
    Legend,
    ChartData,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { fetchMonthlySoldStock } from '../../api/Stock';

ChartJS.register(ArcElement, Tooltip, Legend);

const SoldStockMonthlyPanel = () => {
    const [data, setData] = useState<ChartData<'doughnut', number[], string>>();
    const [isLoading, setLoading] = useState<boolean>(false);

    let location = useLocation();
    let navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        fetchMonthlySoldStock({
            location: location,
            navigate: navigate,
        }).then((data) => {
            setLoading(false);
            if (data) {
                // map the array of data to the format that chartjs needs
                const labels = data.map((item) => item.variant_name);
                const values = data.map((item) => item.quantity);
                setData({
                    labels: labels,
                    datasets: [
                        {
                            label: 'Sold Stock',
                            data: values,
                            backgroundColor: [
                                'rgba(248, 107, 99, 0.2)',
                                'rgba(54, 162, 239, 0.2)',
                                'rgba(243, 211, 113, 0.2)',
                                'rgba(125, 222, 216, 0.2)',
                                'rgba(246, 143, 190, 0.2)',
                            ],
                            borderColor: [
                                'rgba(248, 107, 99, 1)',
                                'rgba(54, 162, 239, 1)',
                                'rgba(243, 211, 113, 1)',
                                'rgba(125, 222, 216, 1)',
                                'rgba(246, 143, 190, 1)',
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
                    <h2>Best sellers (30days)</h2>
                </EuiTitle>
                <EuiSpacer size='s' />
                {isLoading ? (
                    <EuiLoadingSpinner size='xl' />
                ) : data ? (
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

export default SoldStockMonthlyPanel;
