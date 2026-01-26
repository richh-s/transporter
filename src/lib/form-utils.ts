import { FieldValues, Path, UseFormReturn } from "react-hook-form";

export function handleFormError<T extends FieldValues>(
    error: any,
    form: UseFormReturn<T>
) {
    if (!error) return;

    const errorMessage = error?.message || error?.detail || "An unexpected error occurred.";

    console.error("Form submission error:", error);

    // If the backend returns field-specific errors (often in a 'errors' or 'fields' object)
    // Adjust this structure based on your actual backend error response format
    if (error?.errors && typeof error.errors === "object") {
        Object.entries(error.errors).forEach(([key, value]) => {
            // Cast the key to Path<T> to satisfy type checking
            // Ideally, the backend error keys exactly match the form field names
            form.setError(key as Path<T>, {
                type: "server",
                message: Array.isArray(value) ? value[0] : (value as string),
            });
        });
        return; // Errors handled
    }

    // Fallback: Set a root-level error
    form.setError("root", {
        type: "server",
        message: errorMessage,
    });
}
