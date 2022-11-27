import { EuiFlexGroup, EuiFlexItem, EuiPageTemplate, EuiPanel, EuiText, EuiTextColor, EuiTitle } from '@elastic/eui';
import TotalSalesInvoicePanel from '../components/home/TotalSalesInvoice';

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
                <EuiFlexGroup>
                    <EuiFlexItem grow={false}>
                        <TotalSalesInvoicePanel />
                    </EuiFlexItem>
                </EuiFlexGroup>
            </EuiPageTemplate.Section>
        </>
    );
};

export default Home;
