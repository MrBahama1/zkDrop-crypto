import { base64urlDecode } from "./encoding.js";
import { importKey } from "./keys.js";
import type { DecryptedMetadata } from "./types.js";

/** Decrypt AES-256-GCM encrypted file content. */
export async function decryptFile(
  ciphertext: ArrayBuffer,
  ivString: string,
  keyString: string,
): Promise<ArrayBuffer> {
  const key = await importKey(keyString, ["decrypt"]);
  const iv = base64urlDecode(ivString);

  return crypto.subtle.decrypt(
    { name: "AES-GCM", iv, tagLength: 128 },
    key,
    ciphertext,
  );
}

/** Decrypt file metadata (name, type, size). */
export async function decryptMetadata(
  encryptedMetadata: string,
  metadataIvString: string,
  keyString: string,
): Promise<DecryptedMetadata> {
  const key = await importKey(keyString, ["decrypt"]);
  const iv = base64urlDecode(metadataIvString);
  const ciphertext = base64urlDecode(encryptedMetadata);

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, tagLength: 128 },
    key,
    ciphertext,
  );

  return JSON.parse(new TextDecoder().decode(plaintext));
}
