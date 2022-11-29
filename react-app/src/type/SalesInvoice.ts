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

// for creating new sales invoice (EuiBasicTable)
export type itemsDisplayProps = {
    name: string;
    variant_id: number;
    batch_id: number;
    price: number;
    discount: number;
    quantity: number;
    total: number;
}

// for creating new sales invoice (POST request)
export type salesInvoiceOnCreate = {
    top_id: number;
    customer_id: number;
    date: string;
    items: itemsOnCreateProps[];
};

export type itemsOnCreateProps = {
    variant_id: number;
    batch_id: number;
    quantity: number;
    price: number;
    discount: number;
}

export type weeklyRevenue = {
    date: string;
    total: number;
}