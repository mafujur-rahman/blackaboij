import { BASE_URL } from "@/config/api";
import axios from "axios";

const api = axios.create({
  baseURL: BASE_URL,
  // ✅ DO NOT set Content-Type globally
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("auth_token");

  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  return config;
});

export default api;
