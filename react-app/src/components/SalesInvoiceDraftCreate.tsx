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
    EuiGlobalToastList,
    EuiModal,
    EuiModalBody,
    EuiModalFooter,
    EuiModalHeader,
    EuiModalHeaderTitle,
    EuiSpacer,
} from '@elastic/eui';
import { EuiBasicTableColumn } from '@elastic/eui/src/components/basic_table';
import { Action } from '@elastic/eui/src/components/basic_table/action_types';
import moment, { Moment } from 'moment';
import React, { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchCustomerSearch } from '../api/Customer';
import { createSalesInvoice } from '../api/SalesInvoice';
import { fetchStockSearch } from '../api/Stock';
import { fetchTOPSearch } from '../api/TOP';
import useToast from '../hooks/useToast';
import { customerProps } from '../type/Customer';
import {
    itemsDisplayProps,
    itemsOnCreateProps,
    salesInvoiceOnCreate,
} from '../type/SalesInvoice';
import { stockProps } from '../type/Stock';
import { topProps } from '../type/TOP';

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
    const { addToast, getAllToasts, removeToast, getNewId } = useToast();

    const onSearchCustomerChange = useCallback(async (searchValue: string) => {
        setCustomerLoading(true);
        clearTimeout(searchTimeout);
        // eslint-disable-next-line
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
        // eslint-disable-next-line
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
        // eslint-disable-next-line
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
            quantity <= 0 ||
            price === undefined ||
            discount === undefined
        ) {
            return;
        }
        // selectedItems[0].value then split by - to get variant_id and batch_id
        let variant_name = selectedItems[0].label.split('[')[0].trim();
        let variant_id: number = parseInt(selectedItems[0].value.split('-')[0]);
        let batch_id: number = parseInt(selectedItems[0].value.split('-')[1]);
        let total = price * quantity * (1 - discount / 100);

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

    // act like a useEffect
    const handleCreate = async () => {
        // check if all the value is filled
        if (
            customerSelected.length === 0 ||
            topSelected.length === 0 ||
            date === null ||
            carts.length === 0
        ) {
            addToast({
                id: getNewId(),
                title: 'Error',
                color: 'danger',
                text: <p>Please fill all field</p>,
            });
            return;
        }

        // from carts map it to match itemsOnCreateProps type
        const items: itemsOnCreateProps[] = carts.map((item) => ({
            variant_id: item.variant_id,
            batch_id: item.batch_id,
            price: item.price,
            discount: item.discount,
            quantity: item.quantity,
        }));

        // map all data to match salesInvoiceOnCreateProps type
        const data: salesInvoiceOnCreate = {
            customer_id: customerSelected[0].value,
            top_id: topSelected[0].value,
            date: date.toISOString(),
            items: items,
        };
        await createSalesInvoice({
            data: data,
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

    const actions: Action<any>[] = [
        {
            name: 'delete',
            description: 'delete this item',
            icon: 'trash',
            type: 'icon',
            color: 'danger',
            onClick: (item) => {
                setCarts((prev) => prev.filter((cart) => cart !== item));
            },
        },
    ];
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
            render: (price: number) => {
                return 'Rp. ' + price.toLocaleString('id-ID');
            },
        },
        {
            field: 'discount',
            name: 'Discount (%)',
            render: (discount: number) => {
                return discount + ' %';
            },
        },
        {
            field: 'quantity',
            name: 'Quantity',
            render: (quantity: number) => {
                return quantity.toLocaleString('id-ID');
            },
        },
        {
            field: 'total',
            name: 'Total',
            width: '16%',
            render: (total: number) => {
                return 'Rp. ' + total.toLocaleString('id-ID');
            },
        },
        {
            // witdh to 50px
            width: '40px',
            actions,
        },
    ];

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
                                    min={1}
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
                <EuiButton
                    color='success'
                    type='submit'
                    onClick={() => handleCreate()}
                >
                    Create
                </EuiButton>
            </EuiModalFooter>
            <EuiGlobalToastList
                toasts={getAllToasts()}
                dismissToast={({ id }) => removeToast(id)}
                toastLifeTimeMs={3000}
            />
        </EuiModal>
    );
};

export default SalesInvoiceCreateModal;
