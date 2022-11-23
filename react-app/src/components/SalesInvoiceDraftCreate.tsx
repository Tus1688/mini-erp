import {
    EuiBasicTable,
    EuiButton,
    EuiButtonEmpty,
    EuiComboBox,
    EuiComboBoxOption,
    EuiComboBoxOptionOption,
    EuiFieldNumber,
    EuiFlexGroup,
    EuiFlexItem,
    EuiForm,
    EuiFormLegend,
    EuiFormRow,
    EuiModal,
    EuiModalBody,
    EuiModalFooter,
    EuiModalHeader,
    EuiModalHeaderTitle,
    EuiSpacer,
    EuiText,
} from '@elastic/eui';
import { EuiBasicTableColumn } from '@elastic/eui/src/components/basic_table';
import moment, { Moment } from 'moment';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { itemsDisplayProps, itemsProps } from '../type/SalesInvoice';

const columns: EuiBasicTableColumn<any>[] = [
    {
        field: 'name',
        name: 'Variant Name',
    },
    {
        field: 'variant_id',
        name: 'Variant ID',
        width: '10%',
    },
    {
        field: 'batch_id',
        name: 'Batch ID',
        width: '10%',
    },
    {
        field: 'price',
        name: 'Price',
    },
    {
        field: 'discount',
        name: 'Discount (%)',
    },
    {
        field: 'quantity',
        name: 'Quantity',
    },
    {
        field: 'total',
        name: 'Total',
        width: '16%',
    },
];

const SalesInvoiceCreateModal = ({
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

    // selected global
    const [topSelected, setTopSelected] = useState<
        EuiComboBoxOptionOption<any>[]
    >([]);
    const [customerSelected, setCustomerSelected] = useState<
        EuiComboBoxOptionOption<any>[]
    >([]);
    const [date, setDate] = useState<Moment>(moment());

    const [items, setItems] = useState<itemsDisplayProps[]>([]); // incharge of the items in the table
    // selected items
    const [variantSelected, setVariantSelected] = useState<
        EuiComboBoxOptionOption<any>[]
    >([]);
    const [batchSelected, setBatchSelected] = useState<
        EuiComboBoxOptionOption<any>[]
    >([]);
    const [quantity, setQuantity] = useState<number>();
    const [price, setPrice] = useState<number>();
    const [discount, setDiscount] = useState<number>();

    // options
    const [customerOptions, setCustomerOptions] = useState<
        EuiComboBoxOptionOption<any>[]
    >([]);
    const [variantOptions, setVariantOptions] = useState<
        EuiComboBoxOptionOption<any>[]
    >([]);
    const [batchOptions, setBatchOptions] = useState<
        EuiComboBoxOptionOption<any>[]
    >([]);

    let searchTimeout: string | number | NodeJS.Timeout | undefined;

    const handleSubmitItems = (e: React.FormEvent<HTMLFormElement>) => {
        console.log('here');
        e.preventDefault();
        // append to items and clear selected
        // value is the id of selected combobox whereas label is the shown value
        setItems([
            ...items,
            {
                name: variantSelected[0].label,
                variant_id: variantSelected[0].value,
                batch_id: batchSelected[0].value,
                price: price || 0,
                discount: discount || 0,
                quantity: quantity || 0,
                total:
                    (price || 0) * (quantity || 0) -
                    ((price || 0) * (quantity || 0) * (discount || 0)) / 100,
            },
        ]);
        // clean up selected
        setVariantSelected([]);
        setBatchSelected([]);
        setPrice(undefined);
        setDiscount(undefined);
        setQuantity(undefined);
    };

    return (
        <EuiModal onClose={() => toggleModal(false)}>
            <EuiModalHeader>
                <EuiModalHeaderTitle>
                    <h2>Create sales invoice draft</h2>
                </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
                <EuiBasicTable items={items} columns={columns} />
                <EuiSpacer size='xl' />
                <EuiForm
                    onSubmit={(e) => handleSubmitItems(e)}
                    component='form'
                >
                    <EuiFlexGroup direction='row' justifyContent='spaceEvenly'>
                        <EuiFlexItem grow={false} style={{ width: '150px' }}>
                            <EuiFormRow label='Variant'>
                                <EuiComboBox placeholder='rawon' />
                            </EuiFormRow>
                        </EuiFlexItem>
                        <EuiFlexItem grow={false} style={{ width: '150px' }}>
                            <EuiFormRow label='Batch Id'>
                                <EuiComboBox placeholder='1 (2022/12/04)' />
                            </EuiFormRow>
                        </EuiFlexItem>
                        <EuiFlexItem grow={false} style={{ width: '130px' }}>
                            <EuiFormRow label='Price'>
                                <EuiFieldNumber
                                    placeholder='50000'
                                    min={0}
                                    value={price}
                                    onChange={(e) =>
                                        setPrice(e.target.valueAsNumber)
                                    }
                                />
                            </EuiFormRow>
                        </EuiFlexItem>
                        <EuiFlexItem grow={false} style={{ width: '110px' }}>
                            <EuiFormRow label='Discount'>
                                <EuiFieldNumber
                                    placeholder='10'
                                    append={<EuiText>%</EuiText>}
                                    min={0}
                                    max={100}
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.valueAsNumber)}
                                />
                            </EuiFormRow>
                        </EuiFlexItem>
                        <EuiFlexItem grow={false} style={{ width: '120px' }}>
                            <EuiFormRow label='Quantity'>
                                <EuiFieldNumber placeholder='300' min={0} />
                            </EuiFormRow>
                        </EuiFlexItem>
                    </EuiFlexGroup>
                </EuiForm>
            </EuiModalBody>
            <EuiModalFooter>
                <EuiButtonEmpty onClick={() => toggleModal(false)}>
                    Cancel
                </EuiButtonEmpty>
                <EuiButton color='success'>Create</EuiButton>
            </EuiModalFooter>
        </EuiModal>
    );
};

export default SalesInvoiceCreateModal;
