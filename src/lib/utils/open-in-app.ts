import { Browser } from "@capacitor/browser";

/**
 * Opens a URL in the in-app browser (Capacitor) or falls back to window.open for web
 * Use this for document previews, PDFs, external links, etc.
 */
export async function openInApp(url: string): Promise<void> {
  if (!url) {
    console.warn("openInApp called with empty URL");
    return;
  }

  try {
    // Open in Capacitor's in-app browser
    await Browser.open({
      url,
      presentationStyle: "popover",
      toolbarColor: "#4ba94d", // Brand color
    });
  } catch {
    // Fallback to window.open for web or if Browser plugin fails
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
