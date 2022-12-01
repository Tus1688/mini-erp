import {
    EuiFlexGroup,
    EuiFlexItem,
    EuiPageTemplate,
    EuiSpacer,
    EuiText,
    EuiTextColor,
    EuiTitle,
} from '@elastic/eui';
import { useEffect, useState } from 'react';
import BestCustomerPanel from '../components/home/BestCustomer';
import BestEmployeePanel from '../components/home/BestEmployee';
import LowStockPanel from '../components/home/LowStock';
import ProductionVsSales from '../components/home/ProductionVsSales';
import SoldStockMonthlyPanel from '../components/home/SoldStock';
import TotalProductionDraftPanel from '../components/home/TotalProductionDraft';
import TotalSalesInvoicePanel from '../components/home/TotalSalesInvoice';
import TotalSalesInvoiceDraftPanel from '../components/home/TotalSalesInvoiceDraft';
import TotalVariantPanel from '../components/home/TotalVariant';
import WeeklyRevenuePanel from '../components/home/WeeklyRevenue';

const Home = () => {
    const [financeUser, setFinanceUser] = useState<boolean>(false);
    const [inventoryUser, setInventoryUser] = useState<boolean>(false);

    useEffect(() => {
        setFinanceUser(sessionStorage.getItem('fin_u') === 'true');
        setInventoryUser(sessionStorage.getItem('inv_u') === 'true');
    }, []);
    return (
        <>
            <EuiPageTemplate.Section>
                <EuiTitle size='l'>
                    <h1>Welcome Back, {sessionStorage.getItem('username')}</h1>
                </EuiTitle>
                <EuiText>
                    <EuiTextColor color='subdued'>
                        <p>
                            The one who always supports you -{' '}
                            <b>Bumbuventory</b>
                        </p>
                    </EuiTextColor>
                </EuiText>
                <EuiSpacer size='s' />
                <EuiFlexGroup wrap={true} justifyContent='center'>
                    {financeUser ? (
                        <>
                            <EuiFlexItem grow={false}>
                                <TotalSalesInvoicePanel />
                            </EuiFlexItem>
                            <EuiFlexItem grow={false}>
                                <TotalSalesInvoiceDraftPanel />
                            </EuiFlexItem>
                        </>
                    ) : null}
                    {inventoryUser ? (
                        <>
                            <EuiFlexItem grow={false}>
                                <TotalVariantPanel />
                            </EuiFlexItem>
                            <EuiFlexItem grow={false}>
                                <TotalProductionDraftPanel />
                            </EuiFlexItem>
                            <EuiFlexItem
                                grow={true}
                                style={{ maxWidth: '300px' }}
                            >
                                <LowStockPanel />
                            </EuiFlexItem>
                        </>
                    ) : null}
                    {inventoryUser || financeUser ? (
                        <>
                            <EuiFlexItem
                                grow={true}
                                style={{ maxWidth: '300px' }}
                            >
                                <SoldStockMonthlyPanel />
                            </EuiFlexItem>
                            <EuiFlexItem
                                grow={true}
                                style={{ maxWidth: '600px' }}
                            >
                                <ProductionVsSales />
                            </EuiFlexItem>
                        </>
                    ) : null}
                    {financeUser ? (
                        <EuiFlexItem grow={true} style={{ maxWidth: '600px' }}>
                            <WeeklyRevenuePanel />
                        </EuiFlexItem>
                    ) : null}
                    {inventoryUser || financeUser ? (
                        <EuiFlexItem grow={true} style={{ maxWidth: '300px' }}>
                            <BestEmployeePanel />
                        </EuiFlexItem>
                    ) : null}
                    {financeUser ? (
                        <EuiFlexItem grow={true} style={{ maxWidth: '300px' }}>
                            <BestCustomerPanel />
                        </EuiFlexItem>
                    ) : null}
                </EuiFlexGroup>
            </EuiPageTemplate.Section>
        </>
    );
};

export default Home;
