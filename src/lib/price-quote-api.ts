import { request } from "./api-client";
import type {
  PriceQuote,
  CreatePriceQuoteRequest,
  UpdatePriceQuoteRequest,
  PriceQuoteListResponse,
  PriceQuoteCreateResponse,
  PriceQuoteUpdateResponse,
  PriceQuoteFilters,
} from "@/types/price-quote";

/**
 * Price Quote API Service
 * Handles all API calls for price quote management
 */
export class PriceQuoteService {
  private static readonly BASE_ENDPOINT = "/price-quote";

  /**
   * Create a new price quote
   * API returns: { status: boolean, success_message: string, result: PriceQuote }
   */
  static async createQuote(
    quoteData: CreatePriceQuoteRequest,
  ): Promise<PriceQuote> {
    const response = await request<PriceQuoteCreateResponse>(
      `${this.BASE_ENDPOINT}/`,
      {
        method: "POST",
        body: JSON.stringify(quoteData),
      },
    );

    const { data, error, status, code } = response;

    if (error) {
      // Create an error object that includes the error code if available
      const errorObj = new Error(error) as Error & {
        status?: number;
        code?: string;
      };
      // Attach status and error code for better error handling
      errorObj.status = status;
      errorObj.code = code;
      throw errorObj;
    }

    if (!data?.result) {
      throw new Error("Failed to create price quote");
    }

    return data.result;
  }

  /**
   * List price quotes with pagination and filters
   */
  static async listQuotes(
    page: number = 1,
    perPage: number = 20,
    filters: PriceQuoteFilters = {},
  ): Promise<PriceQuoteListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        params.append(key, value.toString());
      }
    });

    const { data, error } = await request<PriceQuoteListResponse>(
      `${this.BASE_ENDPOINT}/?${params.toString()}`,
    );

    if (error) {
      throw new Error(error);
    }

    if (!data) {
      throw new Error("Failed to fetch price quotes");
    }

    return data;
  }

  /**
   * Get a single price quote by ID
   */
  static async getQuote(id: number): Promise<PriceQuote> {
    const { data, error, status } = await request<PriceQuote>(
      `${this.BASE_ENDPOINT}/${id}`,
    );

    if (error) {
      if (status === 404) {
        throw new Error("Price quote not found");
      }
      throw new Error(error);
    }

    if (!data) {
      throw new Error("Failed to fetch price quote");
    }

    return data;
  }

  /**
   * Update a price quote
   * Uses PATCH method as per API specification
   * Allowed for: Draft and inactive (expired) quotes
   * Not allowed for: Active quotes (returns 400 error)
   */
  static async updateQuote(
    id: number,
    updateData: UpdatePriceQuoteRequest,
  ): Promise<PriceQuote> {
    const { data, error } = await request<PriceQuoteUpdateResponse>(
      `${this.BASE_ENDPOINT}/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(updateData),
      },
    );

    if (error) {
      throw new Error(error);
    }

    if (!data?.result) {
      throw new Error("Failed to update price quote");
    }

    return data.result;
  }

  /**
   * Delete a price quote
   */
  static async deleteQuote(id: number): Promise<void> {
    const { error, status } = await request<void>(
      `${this.BASE_ENDPOINT}/${id}`,
      {
        method: "DELETE",
      },
    );

    if (error) {
      if (status === 404) {
        throw new Error("Price quote not found");
      }
      throw new Error(error);
    }
  }
}
