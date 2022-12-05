export type customerSpecific = {
    id: number;
    name: string;
    tax_id: string;
    address: string;
    city_name: string;
    province_name: string;
    country_name: string;
    error: string;
};

export type customerProps = {
    id: number;
    name: string;
    tax_id: string;
    address: string;
}