# @zkdrop/crypto

Open-source, zero-knowledge encryption library that powers [zkDrop](https://zkdrop.com). All encryption and decryption happens entirely in the browser using the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) — no keys or plaintext ever leave the client.

## Features

- **AES-256-GCM** file encryption and decryption
- **Metadata encryption** — file names, types, and sizes are encrypted separately
- **PBKDF2 password protection** — derive wrapping keys from passwords (600K iterations, SHA-256)
- **Key wrapping** — encrypt/decrypt file keys with password-derived keys
- **Base64url encoding** — URL-safe key serialization
- **Zero dependencies** — only uses the browser's built-in Web Crypto API

## Install

```bash
npm install @zkdrop/crypto
```

## Usage

### Encrypt a file

```typescript
import { generateEncryptionKey, encryptFile } from "@zkdrop/crypto";

const { exportedKey } = await generateEncryptionKey();
const { ciphertext, iv, encryptedMetadata, metadataIv } = await encryptFile(file, exportedKey);

// Upload ciphertext to your storage
// Share the key via URL fragment: https://example.com/view#key=<exportedKey>
```

### Decrypt a file

```typescript
import { decryptFile, decryptMetadata } from "@zkdrop/crypto";

const plaintext = await decryptFile(ciphertext, iv, key);
const metadata = await decryptMetadata(encryptedMetadata, metadataIv, key);

console.log(metadata.name); // original filename
console.log(metadata.type); // MIME type
console.log(metadata.size); // file size in bytes
```

### Password-protected sharing

```typescript
import {
  generateEncryptionKey,
  generateSalt,
  deriveKeyFromPassword,
  encryptFileKey,
  decryptFileKey,
} from "@zkdrop/crypto";

// Sender: wrap the file key with a password
const { exportedKey } = await generateEncryptionKey();
const salt = generateSalt();
const wrappingKey = await deriveKeyFromPassword("secret-password", salt);
const { encryptedKey, iv } = await encryptFileKey(exportedKey, wrappingKey);

// Recipient: unwrap the file key with the same password
const recipientWrappingKey = await deriveKeyFromPassword("secret-password", salt);
const recoveredKey = await decryptFileKey(encryptedKey, iv, recipientWrappingKey);
```

## API

### Encoding

- `base64urlEncode(buffer: Uint8Array): string` — encode bytes to URL-safe base64
- `base64urlDecode(str: string): Uint8Array` — decode URL-safe base64 to bytes

### Key management

- `generateEncryptionKey(): Promise<{ key: CryptoKey; exportedKey: string }>` — generate a random AES-256-GCM key
- `importKey(keyString: string, usages?: KeyUsage[]): Promise<CryptoKey>` — import a key from base64url string

### File encryption

- `encryptFile(file: File, keyString: string): Promise<EncryptedFileData>` — encrypt a File and its metadata
- `decryptFile(ciphertext: ArrayBuffer, ivString: string, keyString: string): Promise<ArrayBuffer>` — decrypt file content

### Metadata encryption

- `encryptMetadata(metadata: DecryptedMetadata, keyString: string): Promise<{ encryptedMetadata: string; metadataIv: string }>` — encrypt file metadata separately
- `decryptMetadata(encryptedMetadata: string, metadataIvString: string, keyString: string): Promise<DecryptedMetadata>` — decrypt file metadata

### Password protection

- `generateSalt(): string` — generate a random PBKDF2 salt
- `deriveKeyFromPassword(password: string, saltString: string): Promise<CryptoKey>` — derive an AES-256-GCM key from a password
- `encryptFileKey(fileKeyString: string, wrappingKey: CryptoKey): Promise<{ encryptedKey: string; iv: string }>` — wrap a file key
- `decryptFileKey(encryptedKeyString: string, ivString: string, wrappingKey: CryptoKey): Promise<string>` — unwrap a file key

## Types

```typescript
interface DecryptedMetadata {
  name: string;
  type: string;
  size: number;
}

interface EncryptedFileData {
  ciphertext: ArrayBuffer;
  iv: string;
  encryptedMetadata: string;
  metadataIv: string;
}
```

## Security

- **AES-256-GCM** with 128-bit authentication tags
- **96-bit random IVs** — never reused per encryption operation
- **PBKDF2** with 600,000 iterations and SHA-256 for password-based key derivation
- All operations use the **Web Crypto API** — no custom crypto implementations
- Keys are generated and used entirely in the browser — they are never sent to any server

## How zkDrop uses this

zkDrop is a zero-knowledge file sharing platform. This library handles all client-side cryptography:

1. When sharing a file, the sender's browser generates a key, encrypts the file and metadata, then uploads only ciphertext to the server
2. The key is embedded in the URL fragment (`#key=...`) which is never sent to the server
3. When viewing, the recipient's browser downloads ciphertext and decrypts it locally
4. For password-protected shares, the file key is wrapped with a PBKDF2-derived key

The server only ever stores encrypted data. It has zero knowledge of file contents, names, or types.

## License

MIT — see [LICENSE](./LICENSE)
