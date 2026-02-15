import { BASE_URL } from "@/config/api";
import axios from "axios";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 1000 * 60 * 10, 
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
});

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
