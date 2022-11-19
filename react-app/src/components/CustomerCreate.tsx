import {
    EuiModal,
    EuiModalHeader,
    EuiModalHeaderTitle,
    EuiModalBody,
    EuiForm,
    EuiFormRow,
    EuiFieldText,
    EuiSpacer,
    EuiFlexGroup,
    EuiButtonEmpty,
    EuiButton,
    EuiGlobalToastList,
} from '@elastic/eui';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createCustomer } from '../api/Customer';
import useToast from '../hooks/useToast';

const CustomerCreateModal = ({
    toggleModal,
    setFetchedPage,
    setPagination,
    setData,
}: {
    toggleModal: (value: React.SetStateAction<boolean>) => void;
    setFetchedPage: React.Dispatch<React.SetStateAction<number[]>>;
    setPagination: React.Dispatch<
        React.SetStateAction<{
            pageIndex: number;
            pageSize: number;
        }>
    >;
    setData: React.Dispatch<
        React.SetStateAction<
            {
                [key: string]: React.ReactNode;
            }[]
        >
    >;
}) => {
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
            if (data.error) {
                addToast({
                    id: getNewId(),
                    title: 'Error',
                    color: 'danger',
                    text: <p>{data.error}</p>,
                });
                return;
            }
            toggleModal(false);
            setFetchedPage([]);
            setData([]);
            setPagination({
                pageIndex: 0,
                pageSize: 20,
            });
        });
    };

    return (
        <EuiModal onClose={() => toggleModal(false)}>
            <EuiModalHeader>
                <EuiModalHeaderTitle>
                    <h1>Customer Create</h1>
                </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
                <EuiForm
                    id='Customer Create Form'
                    component='form'
                    onSubmit={(e) => handleSubmit(e)}
                >
                    <EuiFormRow
                        label='Customer Name'
                        helpText='maximum 50 characters'
                    >
                        <EuiFieldText
                            name='Customer Name'
                            placeholder='John Doe'
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            maxLength={50}
                        />
                    </EuiFormRow>
                    <EuiFormRow label='Tax ID' helpText='maximum 16 characters'>
                        <EuiFieldText
                            name='Tax ID'
                            placeholder='1234567891028374'
                            value={taxId}
                            onChange={(e) => setTaxId(e.target.value)}
                            maxLength={16}
                        />
                    </EuiFormRow>
                    <EuiFormRow
                        label='Address'
                        helpText='maximum 100 characters'
                    >
                        <EuiFieldText
                            name='Address'
                            placeholder='John&rsquo;s office'
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            maxLength={100}
                        />
                    </EuiFormRow>
                    <EuiFormRow label='City' helpText='maximum 50 characters'>
                        <EuiFieldText
                            name='City'
                            placeholder='John&rsquo;s city'
                            value={cityName}
                            onChange={(e) => setCityName(e.target.value)}
                            maxLength={50}
                        />
                    </EuiFormRow>
                    <EuiFormRow
                        label='Province'
                        helpText='maximum 50 characters'
                    >
                        <EuiFieldText
                            name='Province'
                            placeholder='John&rsquo;s province'
                            value={provinceName}
                            onChange={(e) => setProvinceName(e.target.value)}
                            maxLength={50}
                        />
                    </EuiFormRow>
                    <EuiFormRow
                        label='Country'
                        helpText='maximum 50 characters'
                    >
                        <EuiFieldText
                            name='Country'
                            placeholder='Somewhere in Mars'
                            value={countryName}
                            onChange={(e) => setCountryName(e.target.value)}
                            maxLength={50}
                        />
                    </EuiFormRow>
                    <EuiSpacer size='l' />
                    <EuiFlexGroup justifyContent='flexEnd'>
                        <EuiButtonEmpty
                            color='danger'
                            onClick={() => toggleModal(false)}
                        >
                            cancel
                        </EuiButtonEmpty>
                        <EuiButton color='success' type='submit'>
                            Submit
                        </EuiButton>
                    </EuiFlexGroup>
                    <EuiSpacer size='m' />
                </EuiForm>
            </EuiModalBody>
            <EuiGlobalToastList
                toasts={getAllToasts()}
                dismissToast={({ id }) => removeToast(id)}
                toastLifeTimeMs={5000}
            />
        </EuiModal>
    );
};

export default CustomerCreateModal;