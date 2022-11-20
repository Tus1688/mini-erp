import {
    EuiButton,
    EuiButtonEmpty,
    EuiComboBox,
    EuiComboBoxOptionOption,
    EuiFieldNumber,
    EuiFlexGroup,
    EuiForm,
    EuiFormRow,
    EuiModal,
    EuiModalBody,
    EuiModalHeader,
    EuiModalHeaderTitle,
    EuiSpacer,
} from '@elastic/eui';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchBatchSearch } from '../api/Batch';
import { createProdutionDraft } from '../api/ProductionDraft';
import { fetchVariantSearch } from '../api/Variant';
import useToast from '../hooks/useToast';

type variantPromiseProps = {
    id: number;
    name: string;
    description: string;
    error: string | undefined;
};

type batchPromiseProps = {
    id: number;
    created_at: string;
    expired_date: string;
    error: string | undefined;
};

const ProductionDraftCreate = ({
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
    let location = useLocation();
    let navigate = useNavigate();
    const [variantLoading, setVariantLoading] = useState(false);
    const [batchLoading, setBatchLoading] = useState(false);
    const [variantOptions, setVariantOptions] = useState<
        EuiComboBoxOptionOption<any>[]
    >([]);
    const [variantSelected, setVariantSelected] = useState<
        EuiComboBoxOptionOption<any>[]
    >([]);
    const [batchOptions, setBatchOptions] = useState<
        EuiComboBoxOptionOption<any>[]
    >([]);
    const [batchSelected, setBatchSelected] = useState<
        EuiComboBoxOptionOption<any>[]
    >([]);
    const [quantity, setQuantity] = useState<number>();
    let searchTimeout: string | number | NodeJS.Timeout | undefined;
    const { addToast, getAllToasts, removeToast, getNewId } = useToast();

    const onSearchVariantChange = useCallback(async (searchValue: string) => {
        setVariantLoading(true);
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            const data: variantPromiseProps[] = await fetchVariantSearch({
                search: searchValue,
                location: location,
                navigate: navigate,
            });
            if (data) {
                setVariantOptions(
                    data.map((variant) => ({
                        label: variant.name,
                        value: variant.id,
                    }))
                );
                setVariantLoading(false);
                return;
            }
        }, 300);
        setVariantOptions([]);
        setVariantLoading(false);
    }, []);

    const onSearchBatchChange = useCallback(async (searchValue: string) => {
        setBatchLoading(true);
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            const data: batchPromiseProps[] = await fetchBatchSearch({
                search: searchValue,
                location: location,
                navigate: navigate,
            });
            if (data) {
                setBatchOptions(
                    data.map((batch) => ({
                        label:
                            batch.id +
                            ' (' +
                            batch.expired_date.substring(0, 10) +
                            ')',
                        value: batch.id,
                    }))
                );
                setBatchLoading(false);
                return;
            }
        }, 300);
        setBatchOptions([]);
        setBatchLoading(false);
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await createProdutionDraft({
            variantId: variantSelected[0].value,
            batchId: batchSelected[0].value,
            quantity: quantity || 0,
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
                    Create Production Draft
                </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
                <EuiForm
                    id='Production Draft Craete Form'
                    component='form'
                    onSubmit={(e) => handleSubmit(e)}
                >
                    <EuiFormRow
                        label='Variant'
                        helpText='Search with variant name'
                    >
                        <EuiComboBox
                            placeholder='Rawon'
                            options={variantOptions}
                            onChange={(e) => setVariantSelected(e)}
                            selectedOptions={variantSelected}
                            isLoading={variantLoading}
                            onSearchChange={onSearchVariantChange}
                            singleSelection={{ asPlainText: true }}
                            async
                        />
                    </EuiFormRow>
                    <EuiFormRow
                        label='Batch ID'
                        helpText='Search with expired date (YYYY-MM-DD)'
                    >
                        <EuiComboBox
                            placeholder='1 (2022-12-04)'
                            options={batchOptions}
                            onChange={(e) => setBatchSelected(e)}
                            selectedOptions={batchSelected}
                            isLoading={batchLoading}
                            onSearchChange={onSearchBatchChange}
                            singleSelection={{ asPlainText: true }}
                            async
                        />
                    </EuiFormRow>
                    <EuiFormRow label='Quantity' helpText='Input Quantity'>
                        <EuiFieldNumber
                            placeholder='100'
                            value={quantity}
                            onChange={(e) =>
                                setQuantity(e.target.valueAsNumber)
                            }
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
                </EuiForm>
            </EuiModalBody>
        </EuiModal>
    );
};

export default ProductionDraftCreate;
