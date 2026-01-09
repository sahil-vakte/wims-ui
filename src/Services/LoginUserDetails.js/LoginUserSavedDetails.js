import CryptoJS from 'crypto-js';

const secretKey = process.env.REACT_APP_USER_ENC_DEC_KEY;

export const getDecryptedData = () => {
  const encryptedData = localStorage.getItem("user");
  if (encryptedData) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  }
  return null;
};

export const getDecryptedUserType = () => {
  const encryptedUserType = sessionStorage.getItem("LoginUserType");
  if (encryptedUserType) {
    const bytes = CryptoJS.AES.decrypt(encryptedUserType, secretKey);
    const decryptedType = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedType;
  }
  return null;
};

export const getDecryptedAccessToken = () => {
  const encryptedAccessToken = localStorage.getItem("accessToken");
  if (!encryptedAccessToken) return null;

  try {
    const bytes = CryptoJS.AES.decrypt(encryptedAccessToken, secretKey);
    let decryptedToken = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedToken) return null;

    // 1) trim whitespace
    decryptedToken = decryptedToken.trim();

    // 2) remove surrounding quotes if token is stored with quotes e.g. "\"eyJ...\""
    if (
      (decryptedToken.startsWith('"') && decryptedToken.endsWith('"')) ||
      (decryptedToken.startsWith("'") && decryptedToken.endsWith("'"))
    ) {
      decryptedToken = decryptedToken.slice(1, -1);
    }

    // 3) If stored with a Bearer prefix, remove it so callers can do `Bearer ${token}`
    if (decryptedToken.toLowerCase().startsWith("bearer ")) {
      decryptedToken = decryptedToken.slice(7).trim();
    }

    // final sanity trim
    decryptedToken = decryptedToken.trim();

    return decryptedToken || null;
  } catch (err) {
    console.error("Failed to decrypt accessToken:", err);
    return null;
  }
};


export const getDecryptedRefreshToken = () => {
  const encryptedRefresToken = localStorage.getItem("refreshToken");
  if (encryptedRefresToken) {
    const bytes = CryptoJS.AES.decrypt(encryptedRefresToken, secretKey);
    const decryptedRefreshToken = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedRefreshToken;
  }
  return null;
};


export const getPatientListPatientTabsData = () => {
  const encryptedData = sessionStorage.getItem("PatientListPatientTabsData");
  if (encryptedData) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  }
  return null;
};


export const getDecryptedDataFromSessionStorage = (key) => {
  const encryptedData = sessionStorage.getItem(key);
  if (encryptedData) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  }
  return null;
};
