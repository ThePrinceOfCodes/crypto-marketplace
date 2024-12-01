import { getAuthToken } from "@common/utils/tokenStorage";
import Axios, { CreateAxiosDefaults } from "axios";
import { QueryClient } from "react-query";

const DEFAULT_API_CONFIG: CreateAxiosDefaults = {
  baseURL: process.env.API_BASE_URL,
  // baseURL: "https://api.dev.msq.market/",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
};

const api = Axios.create(DEFAULT_API_CONFIG);

// Add token to request header
api.interceptors.request.use((config) => {
  const token = `Bearer ${getAuthToken()}`;
  if (config.headers && getAuthToken()) {
    config.headers.Authorization = token;
  }
  return config;
});

api.defaults.data = {};

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

export { api, queryClient };
