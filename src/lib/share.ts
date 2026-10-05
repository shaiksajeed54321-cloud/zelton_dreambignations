/**
 * Shares the current page. Uses the native share sheet when available,
 * otherwise copies the link. Returns a short message to show the user.
 */
export async function shareSite(): Promise<string> {
  const data = { title: document.title, text: document.title, url: window.location.href };

  if (typeof navigator.share === "function") {
    try {
      await navigator.share(data);
      return "";
    } catch (error) {
      // The user closed the share sheet - not an error.
      if (error instanceof DOMException && error.name === "AbortError") return "";
      // Any other failure: fall through to copy the link.
    }
  }

  try {
    await navigator.clipboard.writeText(data.url);
    return "Link copied!";
  } catch {
    // Clipboard API blocked (e.g. non-HTTPS): use the old copy method.
    const input = document.createElement("textarea");
    input.value = data.url;
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    document.body.removeChild(input);
    return copied ? "Link copied!" : `Copy this link: ${data.url}`;
  }
}
