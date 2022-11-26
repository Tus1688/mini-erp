import {
    EuiLoadingSpinner,
    EuiPageTemplate,
} from '@elastic/eui';

const Loading = () => {
    return (
        <EuiPageTemplate>
            <EuiPageTemplate.Section alignment='center'>
                <EuiLoadingSpinner size='xxl' />
            </EuiPageTemplate.Section>
        </EuiPageTemplate>
    );
};

export default Loading;
