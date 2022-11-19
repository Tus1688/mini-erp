import { EuiButton, EuiButtonEmpty, EuiDatePicker, EuiFlexGroup, EuiForm, EuiFormRow, EuiGlobalToastList, EuiModal, EuiModalBody, EuiModalHeader, EuiModalHeaderTitle, EuiSpacer } from '@elastic/eui';
import moment from 'moment';
import { Moment } from 'moment';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchBatchSpecific, patchBatch } from '../api/Batch';
import useToast from '../hooks/useToast';
import { formatTimeZoneWithoutTime } from '../type/FormatTZ';

const BatchEditModal = ({
    id,
    toggleModal,
}: {
    id: number;
    toggleModal: (value: React.SetStateAction<boolean>) => void;
}) => {
    let location = useLocation();
    let navigate = useNavigate();
    const [batchExpired, setBatchExpired] = useState<Moment | null>();

    const { addToast, getAllToasts, removeToast, getNewId } = useToast();
    useEffect(() => {
        fetchBatchSpecific({
            id: id,
            navigate: navigate,
            location: location,
        }).then((data) => {
            if (data) {
                let rawTZ:string = data.expired_date;
                // utc offset is +7 (ASIA/JAKARTA)
                let dt:Moment = moment(rawTZ).utcOffset(7);
                setBatchExpired(dt);
            }
        });
    }, [id, location, navigate]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let dtString:string = batchExpired?.format(formatTimeZoneWithoutTime) || '';
        await patchBatch({
            id: id,
            expiredDate: dtString,
            navigate: navigate,
            location: location,
        }).then((data) => {
            if (data.message) {
                addToast({
                    id: getNewId(),
                    title: 'Updated variant',
                    color: 'success',
                    text: (
                        <>
                            <p>{data.message}</p>
                        </>
                    ),
                });
                return;
            }
            if (data.error) {
                addToast({
                    id: getNewId(),
                    title: 'Error',
                    color: 'danger',
                    text: (
                        <>
                            <p>{data.error}</p>
                        </>
                    ),
                });
                return;
            }
        })
    }

    return (
        <EuiModal onClose={() => toggleModal(false)}>
            <EuiModalHeader>
                <EuiModalHeaderTitle>
                    <h1>Batch Edit</h1>
                </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
                <EuiForm
                    id='Variant Edit Form'
                    component='form'
                    onSubmit={(e) => handleSubmit(e)}
                >
                    <EuiFormRow
                        label='Expired Date'
                        helpText='Asia/Jakarta Timezone'
                    >
                        <EuiDatePicker
                            selected={batchExpired}
                            onChange={(date) => setBatchExpired(date)}
                        />
                    </EuiFormRow>
                    <EuiSpacer size='l' />
                    <EuiFlexGroup justifyContent='flexEnd'>
                        <EuiButtonEmpty onClick={() => toggleModal(false)}>
                            cancel
                        </EuiButtonEmpty>
                        <EuiButton color='primary' type='submit'>
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

export default BatchEditModal;
