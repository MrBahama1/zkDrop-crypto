/** Encode a byte array to a URL-safe base64 string (no padding). */
export function base64urlEncode(buffer: Uint8Array): string {
  const binary = Array.from(buffer)
    .map((b) => String.fromCharCode(b))
    .join("");
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Decode a URL-safe base64 string to a byte array. */
export function base64urlDecode(str: string): Uint8Array<ArrayBuffer> {
  // Restore standard base64 characters
  let padded = str.replace(/-/g, "+").replace(/_/g, "/");
  // Add padding if needed
  const remainder = padded.length % 4;
  if (remainder === 2) padded += "==";
  else if (remainder === 3) padded += "=";
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
