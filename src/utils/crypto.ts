const SECRET_KEY = "radius_system_key_2026_x!z";

export function encryptData(text: string): string {
  try {
    const encoded = encodeURIComponent(text);
    let result = "";
    for (let i = 0; i < encoded.length; i++) {
      const charCode = encoded.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return btoa(result);
  } catch (e) {
    console.error("Encryption error", e);
    return "";
  }
}

export function decryptData(base64Str: string): string {
  try {
    const str = atob(base64Str);
    let result = "";
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return decodeURIComponent(result);
  } catch (e) {
    console.error("Decryption error", e);
    return "";
  }
}
