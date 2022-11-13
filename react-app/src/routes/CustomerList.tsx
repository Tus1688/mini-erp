import { EuiDataGrid, EuiPageTemplate, EuiText, EuiTextColor, EuiTitle } from '@elastic/eui';
import React from 'react';

type customer = {
    id: number;
    name: string;
    tax_id: string;
    Address: string;
}

const CustomerList = () => {
    const [data, setData] = React.useState<customer[]>([]);
    
    return (
        <>
            <EuiPageTemplate.Section color='primary'>
                <EuiTitle size='l'>
                    <h1>Customer List</h1>
                </EuiTitle>
                <EuiText>
                    <EuiTextColor color='subdued'>
                        <p>
                            In this page you can see, add, edit and delete
                            customers.
                            <br />
                            The table below is a list of all customers.
                        </p>
                    </EuiTextColor>
                </EuiText>
            </EuiPageTemplate.Section>
            <EuiPageTemplate.Section>
            </EuiPageTemplate.Section>
        </>
    );
};

export default CustomerList;
