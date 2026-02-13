// Price Quote Types and Enums

export enum LocationEnum {
    ADDIS_ABABA = "Addis Ababa",
    ADAMA = "Adama",
    DUKEM = "Dukem",
    DEBRE_ZEIT = "debre_zeit",
    HAWASSA = "Hawassa",
    SHASHEMENE = "Shashemene",
    DJIBOUTI_PORT = "Djibouti",
}

export enum TruckTypeEnum {
    FLATBED = "flatbed",
    TRAILER = "trailer",
}

export enum ContainerSizeEnum {
    TWENTY_FEET = "twenty_feet",
    FORTY_FEET = "forty_feet",
}

export enum TruckAxleTypeEnum {
    SINGLE = "single",
    DOUBLE = "double",
    TRIPLE = "triple",
}

export enum PriceQuoteStatusEnum {
    DRAFT = "draft",
    ACTIVE = "active",
    INACTIVE = "inactive",
}

export interface PriceQuote {
    id: number;
    organization_id: number;
    origin: LocationEnum;
    destination: LocationEnum;
    gross_weight_min: number;
    gross_weight_max: number;
    truck_type: TruckTypeEnum;
    container_size: ContainerSizeEnum;
    amount: number;
    currency: string;
    axle_type: TruckAxleTypeEnum | null;
    status: PriceQuoteStatusEnum;
    valid_from: string | null; // ISO 8601 datetime
    valid_to: string | null; // ISO 8601 datetime
    created_at: string; // ISO 8601 datetime
    updated_at: string; // ISO 8601 datetime
}

export interface CreatePriceQuoteRequest {
    origin: string; // Display name like "Addis Ababa" or "Djibouti Port"
    destination: string; // Display name like "Addis Ababa" or "Djibouti Port"
    gross_weight_min: number;
    gross_weight_max: number;
    gross_weight_unit: string; // Required field, e.g., "kg"
    truck_type: TruckTypeEnum;
    container_size: ContainerSizeEnum;
    amount: number;
    currency?: string;
    axle_type?: TruckAxleTypeEnum | null;
}

export interface UpdatePriceQuoteRequest {
    origin?: string;
    destination?: string;
    gross_weight_min?: number;
    gross_weight_max?: number;
    gross_weight_unit?: string;
    truck_type?: TruckTypeEnum;
    container_size?: ContainerSizeEnum;
    amount?: number;
    currency?: string;
    axle_type?: TruckAxleTypeEnum | null;
    status?: PriceQuoteStatusEnum;
}

export interface PriceQuoteListResponse {
    status: boolean;
    message: string;
    items: PriceQuote[];
    total: number;
    page: number;
    per_page: number;
    pages: number;
}


export interface PriceQuoteCreateResponse {
    status: boolean;
    success_message: string;
    result: PriceQuote;
}

export interface PriceQuoteUpdateResponse {
    status: boolean;
    success_message: string;
    result: PriceQuote;
}

export interface PriceQuoteFilters {
    origin?: LocationEnum;
    destination?: LocationEnum;
    truck_type?: TruckTypeEnum;
    container_size?: ContainerSizeEnum;
    status?: PriceQuoteStatusEnum;
    currency?: string;
}

