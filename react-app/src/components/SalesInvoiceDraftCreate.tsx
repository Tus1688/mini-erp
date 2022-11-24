import {
    EuiBasicTable,
    EuiButton,
    EuiButtonEmpty,
    EuiButtonIcon,
    EuiComboBox,
    EuiComboBoxOptionOption,
    EuiDatePicker,
    EuiFieldNumber,
    EuiFlexGroup,
    EuiFlexItem,
    EuiForm,
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
import { useCallback,  useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchCustomerSearch } from '../api/Customer';
import { fetchStockSearch } from '../api/Stock';
import { fetchTOPSearch } from '../api/TOP';
import { customerProps } from '../type/Customer';
import { itemsDisplayProps } from '../type/SalesInvoice';
import { stockProps } from '../type/Stock';
import { topProps } from '../type/TOP';

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
    // top = term of payment
    const [topSelected, setTopSelected] = useState<
        EuiComboBoxOptionOption<any>[]
    >([]);
    const [customerSelected, setCustomerSelected] = useState<
        EuiComboBoxOptionOption<any>[]
    >([]);
    const [date, setDate] = useState<Moment | null>(moment());

    const [carts, setCarts] = useState<itemsDisplayProps[]>([]); // incharge of the items in the table
    // selected items
    const [selectedItems, setSelectedItems] = useState<
        EuiComboBoxOptionOption<any>[]
    >([]);
    const [quantity, setQuantity] = useState<number>();
    const [maxQuantity, setMaxQuantity] = useState<number>(0);
    const [price, setPrice] = useState<number>();
    const [discount, setDiscount] = useState<number>();

    // options
    const [customerOptions, setCustomerOptions] = useState<
        EuiComboBoxOptionOption<any>[]
    >([]);
    const [itemOptions, setItemOptions] = useState<
        EuiComboBoxOptionOption<any>[]
    >([]);
    const [topOptions, setTopOptions] = useState<
        EuiComboBoxOptionOption<any>[]
    >([]);

    // loading
    const [customerLoading, setCustomerLoading] = useState<boolean>(false);
    const [itemLoading, setItemLoading] = useState<boolean>(false);
    const [topLoading, setTopLoading] = useState<boolean>(false);

    let searchTimeout: NodeJS.Timeout;

    const onSearchCustomerChange = useCallback(async (searchValue: string) => {
        setCustomerLoading(true);
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            const data: customerProps[] = await fetchCustomerSearch({
                search: searchValue,
                location: location,
                navigate: navigate,
            });
            if (data) {
                setCustomerOptions(
                    data.map((customer) => ({
                        label: customer.name,
                        value: customer.id,
                    }))
                );
                setCustomerLoading(false);
                return;
            }
        }, 300);
        setCustomerLoading(false);
        setCustomerOptions([]);
    }, []);

    const onSearchTOPChange = useCallback(async (searchValue: string) => {
        setTopLoading(true);
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            const data: topProps[] = await fetchTOPSearch({
                search: searchValue,
                location: location,
                navigate: navigate,
            });
            if (data) {
                setTopOptions(
                    data.map((top) => ({
                        label: top.name,
                        value: top.id,
                    }))
                );
                setTopLoading(false);
                return;
            }
        }, 300);
        setTopLoading(false);
        setTopOptions([]);
    }, []);

    const onSearchItemChange = useCallback(async (searchValue: string) => {
        setItemLoading(true);
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            const data: stockProps[] = await fetchStockSearch({
                search: searchValue,
                location: location,
                navigate: navigate,
            });
            if (data) {
                // set Top Options to become
                // data.variant_name [data.batch id][data.expired_date][data.quantity]
                setItemOptions(
                    data.map((item) => ({
                        label: `${item.variant_name} [${
                            item.batch_id
                        }][${new Date(item.expired_date).toLocaleDateString(
                            'id-ID'
                        )}][${item.quantity}]`,
                        value: `${item.variant_id}-${item.batch_id}`,
                    }))
                );
                setItemLoading(false);
                return;
            }
        }, 300);
        setItemLoading(false);
        setItemOptions([]);
    }, []);

    const handleSubmitItems = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // append to items and clear selected
        // value is the id of selected combobox whereas label is the shown value
        // check if all the value is filled
        if (
            selectedItems.length === 0 ||
            quantity === undefined ||
            price === undefined ||
            discount === undefined
        ) {
            return;
        }
        // selectedItems[0].value then split by - to get variant_id and batch_id
        let variant_name = selectedItems[0].label.split('[')[0].trim();
        let variant_id = selectedItems[0].value.split('-')[0];
        let batch_id = selectedItems[0].value.split('-')[1];
        let total = price * quantity * (1 - discount / 100);
        console.log('variant name: ', variant_name);
        console.log('variant id :', variant_id);
        console.log('batch id :', batch_id);
        console.log('price: ', price);
        console.log('discount: ', discount);
        console.log('qty: ', quantity);
        console.log('total: ', total);

        setCarts((prev) => [
            ...prev,
            {
                name: variant_name,
                variant_id: variant_id,
                batch_id: batch_id,
                price: price,
                discount: discount,
                quantity: quantity,
                total: total,
            },
        ]);

        // clean up selected
        setSelectedItems([]);
        setMaxQuantity(0);
    };

    return (
        <EuiModal onClose={() => toggleModal(false)}>
            <EuiModalHeader>
                <EuiModalHeaderTitle>
                    <h2>Create sales invoice draft</h2>
                </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
                <EuiFlexGroup direction='row' justifyContent='spaceEvenly'>
                    <EuiFlexItem grow={false} style={{ width: '30%' }}>
                        <EuiFormRow label='Customer name'>
                            <EuiComboBox
                                placeholder='john doe'
                                options={customerOptions}
                                selectedOptions={customerSelected}
                                isLoading={customerLoading}
                                onSearchChange={onSearchCustomerChange}
                                onChange={(e) => setCustomerSelected(e)}
                                singleSelection={{ asPlainText: true }}
                                async
                            />
                        </EuiFormRow>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false} style={{ width: '30%' }}>
                        <EuiFormRow label='Term of payment'>
                            <EuiComboBox
                                placeholder='net 30'
                                options={topOptions}
                                selectedOptions={topSelected}
                                isLoading={topLoading}
                                onSearchChange={onSearchTOPChange}
                                onChange={(e) => setTopSelected(e)}
                                singleSelection={{ asPlainText: true }}
                                async
                            />
                        </EuiFormRow>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false} style={{ width: '30%' }}>
                        <EuiFormRow label='Sales invoice date'>
                            <EuiDatePicker
                                selected={date}
                                onChange={(e) => setDate(e)}
                            />
                        </EuiFormRow>
                    </EuiFlexItem>
                </EuiFlexGroup>
                <EuiSpacer size='xl' />
                <EuiForm
                    onSubmit={(e) => handleSubmitItems(e)}
                    component='form'
                >
                    <EuiFlexGroup
                        direction='row'
                        justifyContent='spaceEvenly'
                        alignItems='flexEnd'
                    >
                        <EuiFlexItem grow={false} style={{ width: '320px' }}>
                            <EuiFormRow label='Item'>
                                <EuiComboBox
                                    placeholder='Rawon [batch id][exp date][quantity]'
                                    options={itemOptions}
                                    selectedOptions={selectedItems}
                                    isLoading={itemLoading}
                                    onSearchChange={onSearchItemChange}
                                    onChange={(e) => {
                                        setSelectedItems(e);
                                        // set maxQuantity to be the quantity of selected item
                                        setMaxQuantity(
                                            parseInt(
                                                e[0].label
                                                    .split('[')[3]
                                                    .split(']')[0]
                                            )
                                        );
                                    }}
                                    singleSelection={{ asPlainText: true }}
                                    async
                                />
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
                            <EuiFormRow label='Discount (%)'>
                                <EuiFieldNumber
                                    placeholder='10'
                                    min={0}
                                    max={100}
                                    value={discount}
                                    onChange={(e) =>
                                        setDiscount(e.target.valueAsNumber)
                                    }
                                />
                            </EuiFormRow>
                        </EuiFlexItem>
                        <EuiFlexItem grow={false} style={{ width: '120px' }}>
                            <EuiFormRow label='Quantity'>
                                <EuiFieldNumber
                                    placeholder='300'
                                    value={quantity}
                                    onChange={(e) =>
                                        setQuantity(e.target.valueAsNumber)
                                    }
                                    min={0}
                                    max={maxQuantity}
                                />
                            </EuiFormRow>
                        </EuiFlexItem>
                        <EuiFlexItem grow={false} style={{ width: '50px' }}>
                            <EuiButtonIcon
                                aria-label='add item to cart'
                                iconType='plusInCircleFilled'
                                type='submit'
                                color='primary'
                                size='m'
                                display='base'
                            />
                        </EuiFlexItem>
                    </EuiFlexGroup>
                </EuiForm>
                <EuiSpacer size='xl' />
                <EuiBasicTable items={carts} columns={columns} />
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
