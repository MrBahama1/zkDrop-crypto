import { base64urlEncode } from "./encoding.js";
import { importKey } from "./keys.js";
import type { DecryptedMetadata, EncryptedFileData } from "./types.js";

/** Encrypt a File and its metadata with AES-256-GCM. */
export async function encryptFile(
  file: File,
  keyString: string,
): Promise<EncryptedFileData> {
  const key = await importKey(keyString, ["encrypt"]);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = await file.arrayBuffer();

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, tagLength: 128 },
    key,
    plaintext,
  );

  const { encryptedMetadata, metadataIv } = await encryptMetadata(
    { name: file.name, type: file.type, size: file.size },
    keyString,
  );

  return {
    ciphertext,
    iv: base64urlEncode(iv),
    encryptedMetadata,
    metadataIv,
  };
}

/** Encrypt file metadata (name, type, size) separately. */
export async function encryptMetadata(
  metadata: DecryptedMetadata,
  keyString: string,
): Promise<{ encryptedMetadata: string; metadataIv: string }> {
  const key = await importKey(keyString, ["encrypt"]);
  const metadataIv = crypto.getRandomValues(new Uint8Array(12));

  const encoded = new TextEncoder().encode(JSON.stringify(metadata));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: metadataIv, tagLength: 128 },
    key,
    encoded,
  );

  return {
    encryptedMetadata: base64urlEncode(new Uint8Array(ciphertext)),
    metadataIv: base64urlEncode(metadataIv),
  };
}
