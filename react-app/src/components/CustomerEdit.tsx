import {
    EuiButton,
    EuiButtonEmpty,
    EuiFieldText,
    EuiFlexGroup,
    EuiForm,
    EuiFormRow,
    EuiGlobalToastList,
    EuiModal,
    EuiModalBody,
    EuiModalFooter,
    EuiModalHeader,
    EuiModalHeaderTitle,
    EuiSpacer,
} from '@elastic/eui';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchCustomerSpecific, patchCustomerSpecific } from '../api/Customer';
import useToast from '../hooks/useToast';

const CustomerEditModal = ({
    id,
    toggleModal,
    setFetchedPage,
    setPagination,
    setData, // from parent
}: {
    id: number;
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
    let location = useLocation();
    let navigate = useNavigate();
    const [customerName, setCustomerName] = useState<string>();
    const [taxId, setTaxId] = useState<string>();
    const [address, setAddress] = useState<string>();
    const [cityName, setCityName] = useState<string>();
    const [provinceName, setProvinceName] = useState<string>();
    const [countryName, setCountryName] = useState<string>();
    const [errorModal, setErrorModal] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const { addToast, getAllToasts, removeToast, getNewId } = useToast();

    useEffect(() => {
        fetchCustomerSpecific({
            id: id,
            navigate: navigate,
            location: location,
        }).then((data) => {
            if (data) {
                if (data.error) {
                    setErrorMessage(data.error);
                    setErrorModal(true);
                    return;
                }
                setCustomerName(data.name);
                setTaxId(data.tax_id);
                setAddress(data.address);
                setCityName(data.city_name);
                setProvinceName(data.province_name);
                setCountryName(data.country_name);
            }
        });
    }, [id, navigate, location]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await patchCustomerSpecific({
            id: id,
            tax_id: taxId ? taxId : '',
            name: customerName ? customerName : '',
            address: address ? address : '',
            city_name: cityName ? cityName : '',
            province_name: provinceName ? provinceName : '',
            country_name: countryName ? countryName : '',
            navigate: navigate,
            location: location,
        }).then((data) => {
            if(data.message) {
                addToast({
                    id: getNewId(),
                    title: 'Updated customer',
                    color: 'success',
                    text: (
                        <>
                            <p>{data.message}</p>
                        </>
                    )
                })
                return;
            }
            if(data.error) {
                addToast({
                    id: getNewId(),
                    title: 'Error',
                    color: 'danger',
                    text: (
                        <>
                            <p>{data.error}</p>
                        </>
                    )
                })
                return;
            }
        })
    };

    return (
        <EuiModal onClose={() => toggleModal(false)}>
            <EuiModalHeader>
                <EuiModalHeaderTitle>
                    <h1>Customer Edit</h1>
                </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
                <EuiForm
                    id='Customer Edit Form'
                    component='form'
                    onSubmit={(e) => handleSubmit(e)}
                >
                    <EuiFormRow label='Customer Name'>
                        <EuiFieldText
                            name='Customer Name'
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
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
                            onChange={(e) => setProvinceName(e.target.value)}
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
                    <EuiSpacer size='l' />
                    {/* set button to right */}
                    <EuiFlexGroup justifyContent='flexEnd'>
                        <EuiButtonEmpty onClick={() => toggleModal(false)}>cancel</EuiButtonEmpty>
                        <EuiButton color='primary' type='submit'>Submit</EuiButton>
                    </EuiFlexGroup>
                    <EuiSpacer size='m' />
                </EuiForm>
            </EuiModalBody>
            <EuiGlobalToastList
                toasts={getAllToasts()}
                dismissToast={({ id }) => removeToast(id)}
                toastLifeTimeMs={5000}
            />
            {errorModal && (
                <EuiModal onClose={() => setErrorModal(false)}>
                    <EuiModalHeader>
                        <EuiModalHeaderTitle>Error</EuiModalHeaderTitle>
                    </EuiModalHeader>
                    <EuiModalBody>{errorMessage}</EuiModalBody>
                    <EuiModalFooter>
                        <EuiButton
                            onClick={() => {
                                setErrorModal(false);
                                toggleModal(false);
                                setData([]);
                                setFetchedPage([]);
                                setPagination({
                                    pageIndex: 0,
                                    pageSize: 20,
                                });
                            }}
                            color='danger'
                        >
                            I understand
                        </EuiButton>
                    </EuiModalFooter>
                </EuiModal>
            )}
        </EuiModal>
    );
};

export default CustomerEditModal;
