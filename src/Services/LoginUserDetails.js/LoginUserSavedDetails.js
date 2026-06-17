// import CryptoJS from 'crypto-js';

// const secretKey = process.env.REACT_APP_USER_ENC_DEC_KEY;

// export const getDecryptedData = () => {
//   const encryptedData = localStorage.getItem("user");
//   if (encryptedData) {
//     const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
//     const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
//     return JSON.parse(decryptedData);
//   }
//   return null;
// };

// export const getDecryptedUserType = () => {
//   const encryptedUserType = sessionStorage.getItem("LoginUserType");
//   if (encryptedUserType) {
//     const bytes = CryptoJS.AES.decrypt(encryptedUserType, secretKey);
//     const decryptedType = bytes.toString(CryptoJS.enc.Utf8);
//     return decryptedType;
//   }
//   return null;
// };

// export const getDecryptedAccessToken = () => {
//   const encryptedAccessToken = localStorage.getItem("accessToken");
//   if (!encryptedAccessToken) return null;

//   try {
//     const bytes = CryptoJS.AES.decrypt(encryptedAccessToken, secretKey);
//     let decryptedToken = bytes.toString(CryptoJS.enc.Utf8);

//     if (!decryptedToken) return null;

//     // 1) trim whitespace
//     decryptedToken = decryptedToken.trim();

//     // 2) remove surrounding quotes if token is stored with quotes e.g. "\"eyJ...\""
//     if (
//       (decryptedToken.startsWith('"') && decryptedToken.endsWith('"')) ||
//       (decryptedToken.startsWith("'") && decryptedToken.endsWith("'"))
//     ) {
//       decryptedToken = decryptedToken.slice(1, -1);
//     }

//     // 3) If stored with a Bearer prefix, remove it so callers can do `Bearer ${token}`
//     if (decryptedToken.toLowerCase().startsWith("bearer ")) {
//       decryptedToken = decryptedToken.slice(7).trim();
//     }

//     // final sanity trim
//     decryptedToken = decryptedToken.trim();

//     return decryptedToken || null;
//   } catch (err) {
//     console.error("Failed to decrypt accessToken:", err);
//     return null;
//   }
// };


// export const getDecryptedRefreshToken = () => {
//   const encryptedRefresToken = localStorage.getItem("refreshToken");
//   if (encryptedRefresToken) {
//     const bytes = CryptoJS.AES.decrypt(encryptedRefresToken, secretKey);
//     const decryptedRefreshToken = bytes.toString(CryptoJS.enc.Utf8);
//     return decryptedRefreshToken;
//   }
//   return null;
// };



// export const getDecryptedDataFromSessionStorage = (key) => {
//   const encryptedData = sessionStorage.getItem(key);
//   if (encryptedData) {
//     const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
//     const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
//     return JSON.parse(decryptedData);
//   }
//   return null;
// };




import CryptoJS from "crypto-js";

const secretKey = process.env.REACT_APP_USER_ENC_DEC_KEY || "default_dev_secret";

export const encryptAndStore = (key, value) => {
  const cipher = CryptoJS.AES.encrypt(JSON.stringify(value), secretKey).toString();
  localStorage.setItem(key, cipher);
};

const decryptValue = (key) => {
  const encrypted = localStorage.getItem(key);
  if (!encrypted) return null;

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
    const text = bytes.toString(CryptoJS.enc.Utf8);
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (err) {
    console.error(`Failed to decrypt ${key}:`, err);
    return null;
  }
};

const cleanToken = (token) => {
  if (!token) return null;

  let t = String(token).trim();

  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    t = t.slice(1, -1);
  }

  if (t.toLowerCase().startsWith("bearer ")) {
    t = t.slice(7).trim();
  }

  return t || null;
};

export const getDecryptedData = () => decryptValue("user");

export const getDecryptedAccessToken = () => {
  return cleanToken(decryptValue("accessToken"));
};

export const getDecryptedRefreshToken = () => {
  return cleanToken(decryptValue("refreshToken"));
};

export const updateAccessToken = (accessToken) => {
  encryptAndStore("accessToken", accessToken);
};

export const updateRefreshToken = (refreshToken) => {
  encryptAndStore("refreshToken", refreshToken);
};

export const clearAuthStorage = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

export const getDecryptedUserType = () => {
  const encryptedUserType = sessionStorage.getItem("LoginUserType");
  if (!encryptedUserType) return null;

  try {
    const bytes = CryptoJS.AES.decrypt(encryptedUserType, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return null;
  }
};

export const getDecryptedDataFromSessionStorage = (key) => {
  const encryptedData = sessionStorage.getItem(key);
  if (!encryptedData) return null;

  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const text = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(text);
  } catch {
    return null;
  }
};