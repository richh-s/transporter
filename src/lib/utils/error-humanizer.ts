/**
 * Robustly extracts an error message from common backend error structures.
 * Handles:
 * - Direct strings
 * - Pydantic validation arrays (detail: [{msg: ...}, ...])
 * - Objects with error/message/detail keys
 * 
 * @param result The raw response body from the API
 * @returns A string representing the primary error message
 */
export function extractErrorMessage(result: unknown): string {
    if (!result) return "Something went wrong";
    if (typeof result === "string") return result;

    const res = result as Record<string, unknown>;

    // Handle FastAPI/Pydantic validation errors (array of objects)
    if (Array.isArray(res.detail)) {
        const firstDetail = res.detail[0];
        if (typeof firstDetail === "string") return firstDetail;
        if (typeof firstDetail === "object" && firstDetail !== null) {
            const d = firstDetail as Record<string, unknown>;
            // Pydantic v2 uses 'msg', v1 might use 'msg' or others
            return (d.msg as string) || (d.message as string) || JSON.stringify(firstDetail);
        }
    }

    // Handle standard object structures
    return (
        (res.error as string) ||
        (res.message as string) ||
        (res.detail as string) ||
        (typeof result === "object" ? JSON.stringify(result) : String(result))
    );
}

/**
 * Humanizes common technical error messages from the backend into user-friendly text.
 * 
 * @param message The raw error message from the backend
 * @returns A more readable version of the error message
 */
export function humanizeError(message: string): string {
    if (!message) return "An error occurred";

    // If it's the default object string, we failed to extract properly
    if (message === "[object Object]") return "Invalid request or server error";

    // common Pydantic/FastAPI validation messages
    if (message.includes("String should have at least")) {
        const match = message.match(/at least (\d+) characters/);
        if (match) {
            return `Must be at least ${match[1]} characters`;
        }
        return "Too short";
    }

    if (message.includes("String should have at most")) {
        const match = message.match(/at most (\d+) characters/);
        if (match) {
            return `Must be at most ${match[1]} characters`;
        }
        return "Too long";
    }

    if (message.includes("value is not a valid integer")) {
        return "Must be a whole number";
    }

    if (message.includes("value is not a valid number")) {
        return "Must be a valid number";
    }

    if (message.includes("field required")) {
        return "This field is required";
    }

    if (message.toLowerCase().includes("invalid email")) {
        return "Invalid email address";
    }

    // Handle specific backend codes or common patterns
    if (message === "Value error, Invalid phone number") {
        return "Invalid phone number format (e.g. +2519XXXXXXXX)";
    }

    return message;
}
