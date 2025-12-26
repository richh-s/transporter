import { request } from "./api-client";

export interface Truck {
    id: number;
    license_plate?: string;
    license_plate_number?: string;
    plate_number?: string;
    // Add other truck fields as needed based on your API response
}

/**
 * TRUCKS API ENDPOINT CONFIGURATION
 * Based on API documentation: GET /api/v1/truck - List Trucks
 */
const TRUCKS_ENDPOINT = "/truck"; // List Trucks endpoint

/**
 * Fetch trucks for the organization
 */
export async function fetchTrucks(): Promise<Truck[]> {
    try {
        // Use the configured endpoint (from API documentation)
        const endpoints = [
            TRUCKS_ENDPOINT, // Primary endpoint: /api/v1/truck
            "/truck/", // Fallback (with trailing slash)
            "/trucks", // Fallback (plural form)
        ];

        for (const endpoint of endpoints) {
            try {
                const { data, error, status } = await request<
                    Truck[] | { items: Truck[] } | { data: Truck[] } | { trucks: Truck[] } | { result: Truck[] }
                >(endpoint);

                if (error) {
                    // Log the error but continue trying other endpoints
                    if (process.env.NODE_ENV === "development") {
                        console.log(`[Trucks API] Endpoint ${endpoint} returned error:`, error, `(Status: ${status})`);
                    }
                    continue;
                }

                if (data) {
                    // Handle different response formats
                    if (Array.isArray(data)) {
                        if (process.env.NODE_ENV === "development") {
                            console.log(`[Trucks API] Successfully fetched ${data.length} trucks from ${endpoint}`);
                        }
                        return data;
                    }

                    // Handle { items: Truck[] } format (paginated response)
                    if (typeof data === "object" && "items" in data && Array.isArray((data as { items: Truck[] }).items)) {
                        const items = (data as { items: Truck[] }).items;
                        if (process.env.NODE_ENV === "development") {
                            console.log(`[Trucks API] Successfully fetched ${items.length} trucks from ${endpoint}`);
                        }
                        return items;
                    }

                    // Handle { data: Truck[] } format
                    if (typeof data === "object" && "data" in data && Array.isArray((data as { data: Truck[] }).data)) {
                        const items = (data as { data: Truck[] }).data;
                        if (process.env.NODE_ENV === "development") {
                            console.log(`[Trucks API] Successfully fetched ${items.length} trucks from ${endpoint}`);
                        }
                        return items;
                    }

                    // Handle { trucks: Truck[] } format
                    if (typeof data === "object" && "trucks" in data && Array.isArray((data as { trucks: Truck[] }).trucks)) {
                        const items = (data as { trucks: Truck[] }).trucks;
                        if (process.env.NODE_ENV === "development") {
                            console.log(`[Trucks API] Successfully fetched ${items.length} trucks from ${endpoint}`);
                        }
                        return items;
                    }

                    // Handle { result: Truck[] } format
                    if (typeof data === "object" && "result" in data && Array.isArray((data as { result: Truck[] }).result)) {
                        const items = (data as { result: Truck[] }).result;
                        if (process.env.NODE_ENV === "development") {
                            console.log(`[Trucks API] Successfully fetched ${items.length} trucks from ${endpoint}`);
                        }
                        return items;
                    }

                    if (process.env.NODE_ENV === "development") {
                        console.log(`[Trucks API] Endpoint ${endpoint} returned data but format not recognized:`, data);
                    }
                }
            } catch (endpointError) {
                // Continue to next endpoint if this one fails
                if (process.env.NODE_ENV === "development") {
                    console.log(`[Trucks API] Endpoint ${endpoint} failed:`, endpointError);
                }
                continue;
            }
        }

        // If no endpoint works, log warning and return empty array
        console.error(
            "[Trucks API] ❌ Could not fetch trucks from any endpoint. Tried:",
            endpoints.join(", ")
        );
        console.error(
            "[Trucks API] 💡 To fix this:",
            "\n1. Open browser DevTools (F12) → Network tab",
            "\n2. Check which endpoint your API uses for trucks",
            "\n3. Update TRUCKS_ENDPOINT in src/lib/trucks-api.ts"
        );
        return [];
    } catch (error) {
        console.error("[Trucks API] Error fetching trucks:", error);
        return [];
    }
}

