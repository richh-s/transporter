import { Browser } from "@capacitor/browser";

/**
 * Opens a URL in the in-app browser (Capacitor) or falls back to window.open for web
 * Use this for document previews, PDFs, external links, etc.
 */
export async function openInApp(url: string): Promise<void> {
  console.log("📄 [openInApp] Called with URL:", url);

  if (!url) {
    console.warn("📄 [openInApp] Called with empty URL");
    return;
  }

  try {
    console.log("📄 [openInApp] Attempting to open with Capacitor Browser...");
    // Open in Capacitor's in-app browser
    await Browser.open({
      url,
      presentationStyle: "popover",
      toolbarColor: "#4ba94d", // Brand color
    });
    console.log("📄 [openInApp] Capacitor Browser opened successfully");
  } catch (error) {
    console.log(
      "📄 [openInApp] Capacitor Browser failed, falling back to window.open:",
      error,
    );
    // Fallback to window.open for web or if Browser plugin fails
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    console.log(
      "📄 [openInApp] window.open result:",
      newWindow ? "opened" : "blocked",
    );
  }
}
