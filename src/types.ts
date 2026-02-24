export interface DecryptedMetadata {
  name: string;
  type: string;
  size: number;
}

export interface EncryptedFileData {
  ciphertext: ArrayBuffer;
  iv: string;
  encryptedMetadata: string;
  metadataIv: string;
}
