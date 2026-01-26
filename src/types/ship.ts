
export enum LocationEnum {
    ADDIS_ABABA = "Addis Ababa",
    ADAMA = "Adama",
    BAHIR_DAR = "Bahir Dar",
    DIRE_DAWA = "Dire Dawa",
    HAWASSA = "Hawassa",
    JIMMA = "Jimma",
    MEKELLE = "Mekelle",
    GONDAR = "Gondar",
    DESSIE = "Dessie",
    ARBAMINCH = "Arbaminch",
    DJIBOUTI = "Djibouti",
}

export enum ShipStatusEnum {
    CREATED = "Created",
    ASSIGNED = "Assigned",
    IN_TRANSIT = "In Transit",
    DELIVERED = "Delivered",
    COMPLETED = "Completed",
    CANCELLED = "Cancelled",
}

export enum ShipItemStatusEnum {
    CREATED = "Created",
    ASSIGNED = "Assigned",
    LOADED = "Loaded",
    IN_TRANSIT = "In Transit",
    DELIVERED = "Delivered",
    PENDING = "Pending"
}

export enum ShipDocumentTypeEnum {
    BILL_OF_LADING = "Bill of Lading",
    PACKING_LIST = "Packing List",
    COMMERCIAL_INVOICE = "Commercial Invoice",
    CUSTOMS_DECLARATION = "Customs Declaration",
    INSURANCE_CERTIFICATE = "Insurance Certificate",
}

export enum ShipItemDocumentTypeEnum {
    PROOF_OF_DELIVERY = "proof_of_delivery",
    CONTAINER_RETURN_RECEIPT = "container_interchange_document",
    POD_DOCUMENT = "pod_document",
    PROOF_OF_DELIVERY_OF_DOCUMENT = "proof_of_delivery_of_document",
}

export interface ShipItemDocument {
    id: number;
    ship_id: number;
    ship_item_id: number;
    container_id?: number | null;
    document_type: ShipItemDocumentTypeEnum;
    file_path: string;
    file_ext: string;
    presigned_url: string;
    created_at: string;
    updated_at: string;
    file_name?: string; // Optional helper
}

export enum DocumentStatusEnum {
    PENDING = "Pending",
    APPROVED = "Approved",
    REJECTED = "Rejected",
}

export enum ShipItemDocumentTypeEnum {
    PROOF_OF_DELIVERY = "proof_of_delivery",
    CONTAINER_RETURN_RECEIPT = "container_return_receipt",
}

export interface ShipItemDocument {
    id: number;
    ship_id: number;
    ship_item_id: number;
    container_id?: number | null;
    document_type: ShipItemDocumentTypeEnum;
    file_path: string;
    file_ext: string;
    presigned_url: string;
    created_at: string;
    updated_at: string;
    file_name?: string; // Optional helper
}


export interface Container {
    id: number;
    container_number: string;
    container_type: string;
    container_size?: string;
    status: string;
    weight?: number; // Legacy or deprecated
    gross_weight?: number;
    gross_weight_unit?: string;
    tare_weight?: number;
    volume?: number;
    recommended_truck_type?: string;
    is_returning?: boolean;
    return_location_info?: {
        city?: string;
        port?: string;
        address?: string;
        country?: string;
    } | null;
    container_details?: {
        commodity?: string[];
        instruction?: string;
    };
}

export interface Truck {
    id: number;
    vin: string;
    plate_number: string;
    make: string | null;
    model: string | null;
    year: number | null;
    truck_type: "flatbed" | "trailer";
    status: "active" | "inactive" | "maintenance" | "out_of_service";
    registration_date: string;
    gov_id: string | null;
    capacity_quintal?: number;
    assigned?: boolean;
}

export interface Driver {
    id: number;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    driver_license_number: string;
    license_expiry_date: string;
    status: string;
    assigned?: boolean;
}

export interface Facility {
    country: string;
    region: string;
    name: string;
    address: string;
    contact_name: string;
    contact_phone_number: string;
    contact_email: string;
}

export interface ShipmentDetails {
    bill_of_lading_number: string;
    pickup_number: string;
    delivery_number: string;
}

export interface Ship {
    id: number;
    shipper_id: number;
    origin: string; // Location code e.g. "addis_ababa"
    destination: string; // Location code e.g. "djibouti"
    pickup_date: string;
    delivery_date: string;
    pickup_facility: Facility;
    delivery_facility: Facility;
    shipment_details: ShipmentDetails;
    status: string;
    ship_items: ShipItem[];
    containers: Container[];
}

export interface ShipItem {
    id: number;
    ship_id: number;
    transporter_id: number;
    container_id: number;
    truck_id?: number | null;
    driver_id?: number | null;
    status: string; // ShipItemStatusEnum
    price: number;
    computed_price: number;
    currency: string;
    assigned_driver_id: number | null;
    assigned_truck_id: number | null;
    pickup_scheduled_time: string | null;
    delivery_scheduled_time: string | null;
    actual_pickup_time: string | null;
    actual_delivery_time: string | null;
    created_at: string;
    updated_at: string;
    container: Container;
    containers?: Container[];
    assigned_driver: Driver | null;
    assigned_truck: Truck | null;
    driver?: Driver | null;
    truck?: Truck | null;
    origin?: string;
    destination?: string;
    pickup_date?: string;
}

export interface ShipDocument {
    id: number;
    document_type: string; // ShipDocumentTypeEnum
    file_path: string;
    file_name: string;
    file_ext: string;
    created_at: string;
    updated_at?: string;
}

// Payment Types
export interface PaymentResponse {
    id: number;
    payment_id: string;          // UUID
    payment_type: "commission";
    total: string;               // Decimal as string
    vat: string;                 // Decimal as string
    payment_method: "tele_birr";
    transaction_receipt: string | null;
    paid: boolean;
    total_str: string;           // Computed field
    vat_str: string;             // Computed field
}

export interface CreateOrderRequest {
    payment_id: number;
    ship_id: number;
    title: string;
}

export interface CreateOrderResponse {
    status: boolean;
    error_message?: string | null;
    success_message?: string | null;
    result?: {
        payment_url: string;
    };
}

