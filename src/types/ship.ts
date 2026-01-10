
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

export enum DocumentStatusEnum {
    PENDING = "Pending",
    APPROVED = "Approved",
    REJECTED = "Rejected",
}

export interface Ship {
    id: number;
    shipper_id: number;
    origin: LocationEnum;
    destination: LocationEnum;
    pickup_date: string; // ISO Date string
    delivery_date: string; // ISO Date string
    pickup_facility: Record<string, any>;
    delivery_facility: Record<string, any>;
    shipment_details: Record<string, any>;
    status: ShipStatusEnum;
    // Relationships
    ship_items?: ShipItem[];
    ship_documents?: ShipDocument[];
}

export interface ShipItem {
    id: number;
    ship_id: number;
    truck_id?: number | null;
    driver_id?: number | null;
    transporter_id: number;
    ship?: Ship;
    computed_price: number;
    currency: string;
    status: ShipItemStatusEnum;
}

export interface ShipDocument {
    id: number;
    ship_id: number;
    document_type: ShipDocumentTypeEnum;
    status: DocumentStatusEnum;
    file_path: string;
    file_ext: string;
    expired_at?: string | null;
    rejection_reason?: string | null;
}
