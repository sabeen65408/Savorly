import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  // `savorly_token` is the key managed by AuthContext. Preserve the former
  // camelCase key briefly so existing signed-in users are not stranded after
  // the API client is updated.
  const token =
    localStorage.getItem("savorly_token") ||
    localStorage.getItem("savorlyToken");

  if (token && !localStorage.getItem("savorly_token")) {
    localStorage.setItem("savorly_token", token);
    localStorage.removeItem("savorlyToken");
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
