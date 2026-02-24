import { base64urlEncode, base64urlDecode } from "./encoding.js";

/** Generate a new random AES-256-GCM key. */
export async function generateEncryptionKey(): Promise<{
  key: CryptoKey;
  exportedKey: string;
}> {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );

  const rawKey = await crypto.subtle.exportKey("raw", key);
  const exportedKey = base64urlEncode(new Uint8Array(rawKey));

  return { key, exportedKey };
}

/** Import an AES-256-GCM key from a base64url-encoded string. */
export async function importKey(
  keyString: string,
  usages: KeyUsage[] = ["encrypt", "decrypt"],
): Promise<CryptoKey> {
  const keyBytes = base64urlDecode(keyString);
  return crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    usages,
  );
}
