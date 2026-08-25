import axios from "axios";
import {
  getDecryptedAccessToken,
  getDecryptedRefreshToken,
  updateAccessToken,
  updateRefreshToken,
  clearAuthStorage,
} from "../LoginUserDetails.js/LoginUserSavedDetails";

const BASE_URL = process.env.REACT_APP_SERVERURL;

const apiClient = axios.create({
  baseURL: BASE_URL,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

const isAuthUrl = (url = "") => {
  return (
    url.includes("auth/login/") ||
    url.includes("auth/token/refresh/") ||
    url.includes("auth/logout/")
  );
};

apiClient.interceptors.request.use((config) => {
  const token = getDecryptedAccessToken();

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["Content-Type"] =
    config.headers["Content-Type"] || "application/json";

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error?.response?.status !== 401 ||
      originalRequest?._retry ||
      isAuthUrl(originalRequest?.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      const refresh = getDecryptedRefreshToken();

      if (!refresh) {
        throw new Error("Refresh token not found.");
      }

      const refreshResponse = await axios.post(
        `${BASE_URL}auth/token/refresh/`,
        { refresh },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const newAccess = refreshResponse?.data?.access;
      const newRefresh = refreshResponse?.data?.refresh;

      if (!newAccess) {
        throw new Error("New access token not received.");
      }

      updateAccessToken(newAccess);

      if (newRefresh) {
        updateRefreshToken(newRefresh);
      }

      processQueue(null, newAccess);

      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuthStorage();

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export const refreshAccessToken = async () => {
  const refresh = getDecryptedRefreshToken();

  if (!refresh) return null;

  const res = await axios.post(
    `${BASE_URL}auth/token/refresh/`,
    { refresh },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const newAccess = res?.data?.access;
  const newRefresh = res?.data?.refresh;

  if (newAccess) updateAccessToken(newAccess);
  if (newRefresh) updateRefreshToken(newRefresh);

  return newAccess;
};

class ApiService {
  get = async (url = "", headers = {}) => {
    try {
      const response = await apiClient.get(url, { headers });
      return { error: null, data: response.data };
    } catch (error) {
      console.error("Error fetching data:", error);
      return { error, data: null };
    }
  };

  getwitParams = async (url = "", params = {}, headers = {}) => {
    try {
      const response = await apiClient.get(url, { params, headers });
      return { error: null, data: response.data };
    } catch (error) {
      console.error("Error fetching data:", error);
      return { error, data: null };
    }
  };

  post = async (url, payload = {}, headers = {}) => {
    try {
      const response = await apiClient.post(url, payload, { headers });
      return { error: null, data: response.data };
    } catch (error) {
      console.log("Post Request Error:", error);
      throw error;
    }
  };

  postwitParams = async (url, payload = {}, params = {}, headers = {}) => {
    try {
      const response = await apiClient.post(url, payload, { params, headers });
      return { error: null, data: response.data };
    } catch (error) {
      console.log("Post Request Error:", error);
      throw error;
    }
  };

  delete = async (url, headers = {}) => {
    try {
      const response = await apiClient.delete(url, { headers });
      return { error: null, data: response.data };
    } catch (error) {
      console.log("Delete Request Error:", error);
      throw error;
    }
  };

  deleteWithPayload = async (url, payload = {}, headers = {}) => {
    try {
      const response = await apiClient.delete(url, {
        data: payload,
        headers,
      });
      return { error: null, data: response.data };
    } catch (error) {
      console.log("Delete Request Error:", error);
      throw error;
    }
  };

  put = async (url, payload = {}, headers = {}) => {
    try {
      const response = await apiClient.put(url, payload, { headers });
      return { error: null, data: response.data };
    } catch (error) {
      console.log("Error:", error);
      return { error, data: null };
    }
  };

  patch = async (url, payload = {}, headers = {}) => {
    try {
      const response = await apiClient.patch(url, payload, { headers });
      return { error: null, data: response.data };
    } catch (error) {
      console.log("Error:", error);
      return { error, data: null };
    }
  };
}
const apiService = new ApiService();
export default apiService;