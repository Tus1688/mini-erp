import {
    EuiButton,
    EuiDescriptionList,
    EuiFlexGroup,
    EuiLoadingSpinner,
    EuiModal,
    EuiModalBody,
    EuiModalFooter,
    EuiModalHeader,
    EuiModalHeaderTitle,
} from '@elastic/eui';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchCustomerSpecific } from '../api/Customer';
import { customerSpecific } from '../type/Customer';
import FlyoutDescriptionList from './FlyoutDescriptionList';

const CustomerModal = ({
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
    const [data, setrData] = useState<customerSpecific>();
    const [errorModal, setErrorModal] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

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
                setrData(data);
            }
        });
    }, [id, navigate, location]);

    return (
        <EuiModal onClose={() => toggleModal(false)}>
            {data ? (
                <>
                    <EuiModalHeader>
                        <EuiModalHeaderTitle>
                            <h1>{data.name}'s details</h1>
                        </EuiModalHeaderTitle>
                    </EuiModalHeader>
                    <EuiModalBody>
                        <EuiDescriptionList>
                            <FlyoutDescriptionList
                                title='ID'
                                description={data?.id}
                            />
                            <FlyoutDescriptionList
                                title='Name'
                                description={data.name}
                            />
                            <FlyoutDescriptionList
                                title='Tax ID'
                                description={data.tax_id}
                            />
                            <FlyoutDescriptionList
                                title='Address'
                                description={data.address}
                            />
                            <FlyoutDescriptionList
                                title='City'
                                description={data.city_name}
                            />
                            <FlyoutDescriptionList
                                title='Province'
                                description={data.province_name}
                            />
                            <FlyoutDescriptionList
                                title='Country'
                                description={data.country_name}
                            />
                        </EuiDescriptionList>
                    </EuiModalBody>
                    <EuiModalFooter>
                        <EuiButton onClick={() => toggleModal(false)}>
                            Close
                        </EuiButton>
                    </EuiModalFooter>
                </>
            ) : (
                <EuiModalBody>
                    <EuiFlexGroup justifyContent='center' alignItems='center'>
                        <EuiLoadingSpinner size='xl' />
                    </EuiFlexGroup>
                </EuiModalBody>
            )}
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

export default CustomerModal;
