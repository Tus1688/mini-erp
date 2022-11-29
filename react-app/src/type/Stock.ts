export type stockProps = {
    variant_name: string;
    variant_id: number;
    batch_id: number;
    quantity: number;
    expired_date: string;
}

export type monthlySoldStockProps = {
    variant_name: string;
    quantity: number;
}

export type lowStockProps = {
    variant_name: string;
    variant_id: number;
    quantity: number;
}