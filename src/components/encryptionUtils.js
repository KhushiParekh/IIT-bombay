import CryptoJS from 'crypto-js';

// Generate a random AES key
export const generateAESKey = () => {
  return CryptoJS.lib.WordArray.random(256/8).toString();
};

// Encrypt data with AES
export const encryptWithAES = (data, key) => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

// Decrypt data with AES
export const decryptWithAES = (encryptedData, key) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Generate RSA key pair
export const generateRSAKeyPair = async () => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
  return keyPair;
};

// Export public key to string
export const exportPublicKey = async (publicKey) => {
  const exported = await window.crypto.subtle.exportKey(
    "spki",
    publicKey
  );
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
};

// Export private key to string
export const exportPrivateKey = async (privateKey) => {
  const exported = await window.crypto.subtle.exportKey(
    "pkcs8",
    privateKey
  );
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
};