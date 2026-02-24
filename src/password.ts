import { base64urlEncode, base64urlDecode } from "./encoding.js";

const PBKDF2_ITERATIONS = 600_000;
const PBKDF2_HASH = "SHA-256";
const SALT_LENGTH = 16;

/** Generate a random salt for PBKDF2 key derivation. */
export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return base64urlEncode(salt);
}

/** Derive an AES-256-GCM wrapping key from a password using PBKDF2. */
export async function deriveKeyFromPassword(
  password: string,
  saltString: string,
): Promise<CryptoKey> {
  const salt = base64urlDecode(saltString);
  const passwordBytes = new TextEncoder().encode(password);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordBytes,
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: PBKDF2_HASH,
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/** Encrypt a file key with a password-derived wrapping key. */
export async function encryptFileKey(
  fileKeyString: string,
  wrappingKey: CryptoKey,
): Promise<{ encryptedKey: string; iv: string }> {
  const fileKeyBytes = base64urlDecode(fileKeyString);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, tagLength: 128 },
    wrappingKey,
    fileKeyBytes,
  );

  return {
    encryptedKey: base64urlEncode(new Uint8Array(ciphertext)),
    iv: base64urlEncode(iv),
  };
}

/** Decrypt a file key with a password-derived wrapping key. */
export async function decryptFileKey(
  encryptedKeyString: string,
  ivString: string,
  wrappingKey: CryptoKey,
): Promise<string> {
  const ciphertext = base64urlDecode(encryptedKeyString);
  const iv = base64urlDecode(ivString);

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, tagLength: 128 },
    wrappingKey,
    ciphertext,
  );

  return base64urlEncode(new Uint8Array(plaintext));
}
