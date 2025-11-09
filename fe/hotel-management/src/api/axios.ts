import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "http://localhost:5283/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Helper: navigate user based on role
const navigateToCorrectPage = (user: any) => {
  if (!user) return;

  const role = user.role?.toLowerCase() ?? "";
  let redirectPath = "/dashboard";

  switch (role) {
    case "admin":
      redirectPath = "/admin/dashboard";
      break;
    case "facilitymanager":
      redirectPath = "/manager/dashboard";
      break;
    case "frontdesk":
      redirectPath = "/frontdesk/dashboard";
      break;
  }

  toast.success("Welcome back!");
  window.location.href = redirectPath; // simple redirect
};

// ✅ Safe login check
export const checkAlreadyLoggedIn = () => {
  console.log(window.location);
  if (window.location.pathname === "/login") {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        navigateToCorrectPage(user);
      } catch {
        localStorage.removeItem("user");
      }
    }
  }
};

// ✅ Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor for handling errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // if (error.response && error.response.status === 401) {
    //   toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    //   localStorage.removeItem("token");
    //   localStorage.removeItem("user");
    //   window.location.href = "/login?expired=true";
    // }

    return Promise.reject(error);
  }
);

export default axiosInstance;
