// Utility functions for Price Quote enums and formatting

import {
    LocationEnum,
    TruckTypeEnum,
    ContainerSizeEnum,
    TruckAxleTypeEnum,
    PriceQuoteStatusEnum,
} from "@/types/price-quote";

/**
 * Convert API enum values to display names
 */
export function formatLocation(location: string): string {
    const map: Record<string, string> = {
        [LocationEnum.ADDIS_ABABA]: "Addis Ababa",
        [LocationEnum.ADAMA]: "Adama",
        [LocationEnum.DUKEM]: "Dukem",
        [LocationEnum.DEBRE_ZEIT]: "debre_zeit",
        [LocationEnum.HAWASSA]: "Hawassa",
        [LocationEnum.SHASHEMENE]: "Shashemene",
        [LocationEnum.DJIBOUTI_PORT]: "Djibouti Port",
    };
    return map[location] || location;
}

/**
 * Convert enum values to API display format (for sending to backend)
 */
export function locationEnumToDisplayName(location: LocationEnum): string {
    const map: Record<LocationEnum, string> = {
        [LocationEnum.ADDIS_ABABA]: "Addis Ababa",
        [LocationEnum.ADAMA]: "Adama",
        [LocationEnum.DUKEM]: "Dukem",
        [LocationEnum.DEBRE_ZEIT]: "debre_zeit",
        [LocationEnum.HAWASSA]: "Hawassa",
        [LocationEnum.SHASHEMENE]: "Shashemene",
        [LocationEnum.DJIBOUTI_PORT]: "Djibouti Port",
    };
    return map[location] || location;
}

export function formatTruckType(truckType: string): string {
    const map: Record<string, string> = {
        [TruckTypeEnum.FLATBED]: "Flatbed",
        [TruckTypeEnum.TRAILER]: "Trailer",
    };
    return map[truckType] || truckType;
}

export function formatContainerSize(size: string): string {
    const map: Record<string, string> = {
        [ContainerSizeEnum.TWENTY_FEET]: "20 Feet",
        [ContainerSizeEnum.FORTY_FEET]: "40 Feet",
    };
    return map[size] || size;
}

export function formatAxleType(axleType: string | null): string {
    if (!axleType) return "Not specified";
    const map: Record<string, string> = {
        [TruckAxleTypeEnum.SINGLE]: "Single",
        [TruckAxleTypeEnum.DOUBLE]: "Double",
        [TruckAxleTypeEnum.TRIPLE]: "Triple",
    };
    return map[axleType] || axleType;
}

/**
 * Format status for display (capitalize first letter)
 */
export function formatStatus(status: string | PriceQuoteStatusEnum): string {
    const statusStr = String(status);
    return statusStr.charAt(0).toUpperCase() + statusStr.slice(1);
}

/**
 * Get status badge variant for UI
 */
export function getStatusVariant(
    status: string | PriceQuoteStatusEnum
): "default" | "secondary" | "destructive" | "outline" {
    const statusStr = String(status);
    const variants: Record<
        string,
        "default" | "secondary" | "destructive" | "outline"
    > = {
        [PriceQuoteStatusEnum.DRAFT]: "secondary",
        [PriceQuoteStatusEnum.ACTIVE]: "default",
        [PriceQuoteStatusEnum.INACTIVE]: "destructive",
    };
    return variants[statusStr] || "outline";
}

/**
 * Location options for Select components
 */
export const LOCATION_OPTIONS = [
    { value: LocationEnum.ADDIS_ABABA, label: "Addis Ababa" },
    { value: LocationEnum.ADAMA, label: "Adama" },
    { value: LocationEnum.DUKEM, label: "Dukem" },
    { value: LocationEnum.DEBRE_ZEIT, label: "Debre Zeit" },
    { value: LocationEnum.HAWASSA, label: "Hawassa" },
    { value: LocationEnum.SHASHEMENE, label: "Shashemene" },
    { value: LocationEnum.DJIBOUTI_PORT, label: "Djibouti Port" },
];

