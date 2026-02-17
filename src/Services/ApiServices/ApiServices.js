import axios from "axios";
// import CryptoJS from "crypto-js";

// function decrypt(encryptedData, password) {
//   try {
//     const rawData = CryptoJS.enc.Base64.parse(encryptedData);

//     const key = CryptoJS.enc.Hex.parse(CryptoJS.SHA256(password).toString());

//     const iv = CryptoJS.lib.WordArray.create(rawData.words.slice(0, 4));
//     const hmac = CryptoJS.lib.WordArray.create(rawData.words.slice(4, 12));
//     const encryptedDataWords = CryptoJS.lib.WordArray.create(
//       rawData.words.slice(12)
//     );

//     const calculatedHmac = CryptoJS.HmacSHA256(
//       iv.concat(encryptedDataWords),
//       key
//     );
//     if (
//       !hmac ||
//       !calculatedHmac ||
//       CryptoJS.enc.Hex.stringify(hmac) !==
//         CryptoJS.enc.Hex.stringify(calculatedHmac)
//     ) {
//       console.error("Decryption failed: HMAC hashes do not match.");
//       return false;
//     }

//     const decrypted = CryptoJS.AES.decrypt(
//       { ciphertext: encryptedDataWords },
//       key,
//       { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
//     );

//     return decrypted.toString(CryptoJS.enc.Utf8);
//   } catch (error) {
//     console.error("Error decrypting:", error);
//     return null;
//   }
// }



// function encrypt(data, password) {
//   const key = CryptoJS.enc.Hex.parse(CryptoJS.SHA256(password).toString());
//   const iv = CryptoJS.lib.WordArray.random(16);


//   const encrypted = CryptoJS.AES.encrypt(data, key, {
//       iv: iv,
//       mode: CryptoJS.mode.CBC,
//       padding: CryptoJS.pad.Pkcs7,
//   });

//   const hmac = CryptoJS.HmacSHA256(iv.concat(encrypted.ciphertext), key);


//   const encryptedData = CryptoJS.lib.WordArray.create()
//       .concat(iv)
//       .concat(hmac)
//       .concat(encrypted.ciphertext);

//   return CryptoJS.enc.Base64.stringify(encryptedData);
// }

// class ApiService {
//   get = async (url = {} , headers = {}) => {
//     try {
//       const response = await axios.get(process.env.REACT_APP_SERVERURL + url, {
//         headers: headers,
//       });
//       return { error: null, data: response.data };
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       return { error, data: null };
//     }
//   };

class ApiService {
    get = async (url = "", headers = {}) => {
      if (
        url === "" ||
        typeof url !== "string" || 
        url.includes("[object Object]") || 
        url.startsWith("http://localhost:3000") || 
        url.startsWith("http://localhost:3001")
      ) {
        return { error: new Error("Invalid or local URL"), data: null };
      }
  
      try {
        const response = await axios.get(process.env.REACT_APP_SERVERURL + url, {
          headers: headers,
        });
        return { error: null, data: response.data };
      } catch (error) {
        console.error("Error fetching data:", error);
        return { error, data: null };
      }
    };




  getwitParams = async (url = {} , params = {}, headers = {}) => {
    try {
      const response = await axios.get(process.env.REACT_APP_SERVERURL + url, {
        params: params,
        headers: headers,
      });
      return { error: null, data: response.data };
      
      // let encryptedData = response.data.trim();
      // const decryptedResponse = decrypt(
      //   encryptedData,
      //   process.env.REACT_APP_USER_ENC_DEC_KEY
      // );
     
      // if (decryptedResponse) {
      //   console.log("decryptedResponsedecryptedResponsedecryptedResponse",JSON.parse(decryptedResponse))
      //   return { error: null, data: JSON.parse(decryptedResponse) };
      // } else {
      //   throw new Error("Decryption failed or empty response.");
      // }
    } catch (error) {
      console.error("Error fetching data:", error);
      return { error, data: null };
    }
  };

  post = async (url, payload = {}, headers = {}) => {   
    try {
      const response = await axios.post(
        process.env.REACT_APP_SERVERURL + url,
        // result,
        payload,
        {
          headers: headers,
        }
      );
      return { error: null, data: response.data };
    } catch (error) {
      console.log("Post Request Error:", error);
      throw error;
    }
  };

  postwitParams = async (url, payload = {}, params = {},headers = {}) => {
    try {
      const response = await axios.post(
        process.env.REACT_APP_SERVERURL + url,
        
        payload,
        {
          params: params,
          headers: headers,
        }
      );
      return { error: null, data: response.data };
    } catch (error) {
      console.log("Post Request Error:", error);
      throw error;
    }
  };

  delete = async (url, headers = {}) => {
    try {
      const response = await axios.delete(
        process.env.REACT_APP_SERVERURL + url,
        {
          headers: headers,
        }
      );
      return { error: null, data: response.data };
    } catch (error) {
      console.log("Delete Request Error:", error);
      throw error;
    }
  };

  deleteWithPayload = async (url, payload = {}, headers = {}) => {
    try {
      const response = await axios.delete(process.env.REACT_APP_SERVERURL + url, {
        data: payload, // ✅ Payload should be inside `data`
        headers: headers,
      });
      return { error: null, data: response.data };
    } catch (error) {
      console.log("Delete Request Error:", error);
      throw error;
    }
  };
  

  put = async (url, payload={}, headers = {}) => {
    try {
      const response = await axios.put(
        process.env.REACT_APP_SERVERURL + url,
        payload,
        {
          headers: headers,
        }
      );
      return { error: null, data: response.data };
    } catch (error) {
      console.log("Error:", error);
      return { error, data: null };
    }
  };
  patch = async (url, payload={}, headers = {}) => {
    try {
      const response = await axios.patch(
        process.env.REACT_APP_SERVERURL + url,
        payload,
        {
          headers: headers,
        }
      );
      return { error: null, data: response.data };
    } catch (error) {
      console.log("Error:", error);
      return { error, data: null };
    }
  };

  // patch = async (url, payload = {}, headers = {}) => {
  //   try {
  //     const response = await axios.patch(
  //       process.env.REACT_APP_SERVERURL + url,
  //       payload
  //     );
  //     return { error: null, data: response.data };
  //   } catch (error) {
  //     console.log("Error:", error);
  //     return { error, data: null };
  //   }
  // };
}
export default new ApiService();
