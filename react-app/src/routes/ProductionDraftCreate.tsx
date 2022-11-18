import { EuiPageTemplate, EuiText, EuiTextColor, EuiTitle } from '@elastic/eui';

const ProductionDraftCreate = () => {
    return (
        <>
            <EuiPageTemplate.Section style={{ height: 0 }}>
                <EuiTitle size='l'>
                    <h1>Production Draft Create</h1>
                </EuiTitle>
                <EuiText>
                    <EuiTextColor color='subdued'>
                        <p>In this page you can create production draft</p>
                    </EuiTextColor>
                </EuiText>
            </EuiPageTemplate.Section>
        </>
    );
};

export default ProductionDraftCreate;
