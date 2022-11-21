export type itemsProps = {
    name: string;
    batch_id: number;
    description: string;
    price: number;
    discount: number;
    quantity: number;
    total: number;
}

export type salesInvoiceSpecific = {
    id: number;
    top_name: string;
    customer_name: string;
    date: string;
    created_by: string;
    total: number;
    items: itemsProps[];
};