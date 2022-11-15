import {
    EuiDescriptionListDescription,
    EuiDescriptionListTitle,
} from '@elastic/eui';

const FlyoutDescriptionList = ({
    title,
    description,
}: {
    title: string;
    description: string | number | undefined;
}) => {
    return (
        <>
            <EuiDescriptionListTitle>{title}</EuiDescriptionListTitle>
            <EuiDescriptionListDescription>
                {description}
            </EuiDescriptionListDescription>
        </>
    );
};

export default FlyoutDescriptionList;
