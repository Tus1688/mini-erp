import {
    EuiFlexGroup,
    EuiFlexItem,
    EuiPageTemplate,
    EuiSpacer,
    EuiText,
    EuiTextColor,
    EuiTitle,
} from '@elastic/eui';
import LowStockPanel from '../components/home/LowStock';
import TotalProductionDraftPanel from '../components/home/TotalProductionDraft';
import TotalSalesInvoicePanel from '../components/home/TotalSalesInvoice';
import TotalSalesInvoiceDraftPanel from '../components/home/TotalSalesInvoiceDraft';
import TotalVariantPanel from '../components/home/TotalVariant';

const Home = () => {
    return (
        <>
            <EuiPageTemplate.Section>
                <EuiTitle size='l'>
                    <h1>Welcome Back, {sessionStorage.getItem('username')}</h1>
                </EuiTitle>
                <EuiText>
                    <EuiTextColor color='subdued'>
                        <p>
                            The one who always support you - <b>Bumbuventory</b>
                        </p>
                    </EuiTextColor>
                </EuiText>
                <EuiSpacer size='s' />
                <EuiFlexGroup wrap={true}>
                    <EuiFlexItem grow={false}>
                        <TotalSalesInvoicePanel />
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                        <TotalSalesInvoiceDraftPanel />
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                        <TotalVariantPanel />
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                        <TotalProductionDraftPanel />
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                        <LowStockPanel />
                    </EuiFlexItem>
                </EuiFlexGroup>
            </EuiPageTemplate.Section>
        </>
    );
};

export default Home;
