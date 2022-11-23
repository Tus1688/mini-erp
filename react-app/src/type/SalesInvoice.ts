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

// for creating new sales invoice (table)
export type itemsDisplayProps = {
    name: string;
    variant_id: number;
    batch_id: number;
    price: number;
    discount: number;
    quantity: number;
    total: number;
}