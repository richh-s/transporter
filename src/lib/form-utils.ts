import { FieldValues, Path, UseFormReturn } from "react-hook-form";

interface FormError {
  message?: string;
  detail?: string;
  errors?: Record<string, string | string[]>;
}

function isFormError(error: unknown): error is FormError {
  return (
    typeof error === "object" &&
    error !== null &&
    ("message" in error || "detail" in error || "errors" in error)
  );
}

function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export function handleFormError<T extends FieldValues>(
  error: FormError | Error | unknown,
  form: UseFormReturn<T>,
) {
  if (!error) return;

  console.error("Form submission error:", error);

  // Handle FormError type
  if (isFormError(error)) {
    // If the backend returns field-specific errors (often in a 'errors' or 'fields' object)
    // Adjust this structure based on your actual backend error response format
    if (error.errors && typeof error.errors === "object") {
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
    const errorMessage =
      error.message || error.detail || "An unexpected error occurred.";
    form.setError("root", {
      type: "server",
      message: errorMessage,
    });
    return;
  }

  // Handle Error type
  if (isError(error)) {
    form.setError("root", {
      type: "server",
      message: error.message || "An unexpected error occurred.",
    });
    return;
  }

  // Fallback for unknown error types
  form.setError("root", {
    type: "server",
    message: "An unexpected error occurred.",
  });
}
