import axios from "axios";
import { auth } from "../firebase";
import { getIdToken } from "firebase/auth";

// Create instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  withCredentials: false, // We are using Firebase tokens, not cookies
});

// REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;

      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error("❌ Failed to attach Firebase token:", err);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR (optional: auto-logout on 401)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("❌ Unauthorized - but NOT auto-redirecting");
      // RETURN the error and let AuthContext handle logout/redirect
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
