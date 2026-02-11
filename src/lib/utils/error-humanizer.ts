/**
 * Humanizes common technical error messages from the backend into user-friendly text.
 * 
 * @param message The raw error message from the backend
 * @returns A more readable version of the error message
 */
export function humanizeError(message: string): string {
    if (!message) return "An error occurred";

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
