import { PaymentResponse } from "@/types/ship";

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export class ReceiptValidationService {
    static validatePaymentForReceipt(payment: PaymentResponse): ValidationResult {
        const errors: string[] = [];

        // Check if payment is completed
        if (!payment.paid) {
            errors.push("Receipt can only be generated for completed payments");
        }

        // Validate payment has required fields
        if (payment.confirmation_method === "manual" && !payment.transaction_receipt && payment.paid) {
            errors.push("Payment transaction receipt is required for manual confirmation");
        }

        // Validate invoice calculations (15% VAT)
        // payment.total is the base Fee (subtotal)
        const subtotal = parseFloat(payment.total);
        const storedVAT = parseFloat(payment.vat);
        const calculatedVAT = subtotal * 0.15;

        // Use a small epsilon to handle floating point precision issues
        if (Math.abs(calculatedVAT - storedVAT) > 0.1) {
            errors.push(
                `VAT calculation mismatch. Expected: ${calculatedVAT.toFixed(2)} (15% of ${subtotal.toFixed(2)}), Found: ${storedVAT.toFixed(2)}`,
            );
        }

        // Validate payment amount
        if (subtotal <= 0) {
            errors.push("Payment amount must be greater than 0");
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}
