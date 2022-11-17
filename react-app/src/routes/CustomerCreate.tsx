import {
    EuiButton,
    EuiButtonEmpty,
    EuiFieldText,
    EuiFlexGroup,
    EuiForm,
    EuiFormRow,
    EuiGlobalToastList,
    EuiPageTemplate,
    EuiSpacer,
    EuiText,
    EuiTextColor,
    EuiTitle,
} from '@elastic/eui';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createCustomer } from '../api/Customer';
import useToast from '../hooks/useToast';

const CustomerCreate = () => {
    const [customerName, setCustomerName] = useState<string>();
    const [taxId, setTaxId] = useState<string>();
    const [address, setAddress] = useState<string>();
    const [cityName, setCityName] = useState<string>();
    const [provinceName, setProvinceName] = useState<string>();
    const [countryName, setCountryName] = useState<string>();

    const { addToast, getAllToasts, removeToast, getNewId } = useToast();

    let location = useLocation();
    let navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await createCustomer({
            name: customerName ? customerName : '',
            tax_id: taxId ? taxId : '',
            address: address ? address : '',
            city_name: cityName ? cityName : '',
            province_name: provinceName ? provinceName : '',
            country_name: countryName ? countryName : '',
            location: location,
            navigate: navigate,
        }).then((data) => {
            if (data.message) {
                addToast({
                    id: getNewId(),
                    title: 'Customer created',
                    color: 'success',
                    text: <p>{data.message}</p>,
                });
                return;
            }
            if (data.error) {
                addToast({
                    id: getNewId(),
                    title: 'Error',
                    color: 'danger',
                    text: <p>{data.error}</p>,
                });
                return;
            }
        });
    };

    return (
        <>
            <EuiPageTemplate.Section style={{ height: 0 }}>
                <EuiTitle size='l'>
                    <h1>Customer Create</h1>
                </EuiTitle>
                <EuiText>
                    <EuiTextColor color='subdued'>
                        <p>In this page you can create new customer</p>
                    </EuiTextColor>
                </EuiText>
                <EuiSpacer size='l' />
                <div style={{ maxWidth: '30rem' }}>
                    <EuiForm
                        id='Customer Create Form'
                        component='form'
                        onSubmit={(e) => handleSubmit(e)}
                    >
                        <EuiFormRow label='Customer Name'>
                            <EuiFieldText
                                name='Customer Name'
                                value={customerName}
                                onChange={(e) =>
                                    setCustomerName(e.target.value)
                                }
                                maxLength={50}
                            />
                        </EuiFormRow>
                        <EuiFormRow label='Tax ID'>
                            <EuiFieldText
                                name='Tax ID'
                                value={taxId}
                                onChange={(e) => setTaxId(e.target.value)}
                                maxLength={16}
                            />
                        </EuiFormRow>
                        <EuiFormRow label='Address'>
                            <EuiFieldText
                                name='Address'
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                maxLength={100}
                            />
                        </EuiFormRow>
                        <EuiFormRow label='City'>
                            <EuiFieldText
                                name='City'
                                value={cityName}
                                onChange={(e) => setCityName(e.target.value)}
                                maxLength={50}
                            />
                        </EuiFormRow>
                        <EuiFormRow label='Province'>
                            <EuiFieldText
                                name='Province'
                                value={provinceName}
                                onChange={(e) =>
                                    setProvinceName(e.target.value)
                                }
                                maxLength={50}
                            />
                        </EuiFormRow>
                        <EuiFormRow label='Country'>
                            <EuiFieldText
                                name='Country'
                                value={countryName}
                                onChange={(e) => setCountryName(e.target.value)}
                                maxLength={50}
                            />
                        </EuiFormRow>
                        <EuiSpacer />
                        <EuiFlexGroup
                            justifyContent='flexEnd'
                            style={{ marginRight: '2rem' }}
                        >
                            <EuiButtonEmpty
                                color='danger'
                                onClick={() => {
                                    setCustomerName('');
                                    setTaxId('');
                                    setAddress('');
                                    setCityName('');
                                    setProvinceName('');
                                    setCountryName('');
                                }}
                            >
                                Empty All
                            </EuiButtonEmpty>
                            <EuiButton color='primary' type='submit'>
                                Submit
                            </EuiButton>
                        </EuiFlexGroup>
                    </EuiForm>
                </div>
            </EuiPageTemplate.Section>
            <EuiGlobalToastList
                toasts={getAllToasts()}
                dismissToast={({ id }) => removeToast(id)}
                toastLifeTimeMs={5000}
            />
        </>
    );
};

export default CustomerCreate;
