import axios, {AxiosInstance } from "axios";
import {
  Dish,
  ApiResponse,
  Category,
  OrderFormData,
  AnalyticsData,
  Order,
  Bill,
  DashboardData,
} from "../types";

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  withCredentials: true,
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export const login = (credentials: any) => api.post("http://127.0.0.1:8000/api/token/", credentials);

export const register = (userData: any) =>
  api.post("http://127.0.0.1:8000/api/register/", userData)

export const logout = (refresh_token: any) =>
  api.post("http://127.0.0.1:8000/api/logout/", refresh_token);

export const getCategories = () =>
  api
    .get<ApiResponse<Category>>("http://127.0.0.1:8000/api/categories/")
    .then((response) => response.data.results);
export const getDishes = () =>
  api.get<ApiResponse<Dish>>("http://127.0.0.1:8000/api/dishes/").then((response) => response.data);
export const fetchDish = async (dishId: number) => {
  const response = await api.get(`http://127.0.0.1:8000/api/dishes/${dishId}/`);
  return response.data;
};

export const getOrders = async () => {
  const response = await api.get("http://127.0.0.1:8000/api/orders/");
  return response.data;
};

export const fetchOrders = async (page: number) => {
  const response = await api.get(`http://127.0.0.1:8000/api/orders/?page=${page}`);
  return response.data;
};

export const fetchOrder = async (orderId: number) => {
  const response = await api.get(`http://127.0.0.1:8000/api/orders/${orderId}/`);
  return response.data;
};

export const createOrder = async (orderData: OrderFormData) => {
  const response = await api.post("http://127.0.0.1:8000/api/orders/", orderData);
  return response.data;
};

export const updateOrderStatus = async (
  orderId: number,
  status: Order["status"]
) => {
  const response = await api.patch<Order>(`http://127.0.0.1:8000/api/orders/${orderId}/`, { status });
  return response.data;
};

export const deleteOrder = async (orderId: number) => {
  const response = await api.delete<Order>(`http://127.0.0.1:8000/api/orders/${orderId}/`);
  return response.data;
};

export const generateBill = async (orderId: number, totalAmount: number) => {
  const response = await api.post<Bill>("http://127.0.0.1:8000/api/bills/", {
    order: orderId,
    total_amount: totalAmount,
  });
  return response.data;
};

export const fetchBills = async (page: number) => {
  const response = await api.get(`http://127.0.0.1:8000/api/bills/?page=${page}`);
  return response.data;
};

export const fetchUnreadCount = async () => {
  try {
    const response = await api.get("http://127.0.0.1:8000/api/notifications/unread/");
    return response.data.length;
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
  }
};

export const getAnalytics = () =>
  api
    .get<AnalyticsData>("http://127.0.0.1:8000/api/orders/analytics/")
    .then((response) => response.data);

export const fetchDashboardData = async (
  timeRange: string
): Promise<DashboardData> => {
  const [dashboardResponse, trendsResponse] = await Promise.all([
    api.get(`http://127.0.0.1:8000/api/orders/dashboard_data/?time_range=${timeRange}`),
    api.get(`http://127.0.0.1:8000/api/orders/sales_trends/?time_range=${timeRange}`),
  ]);

  const dashboardData = dashboardResponse.data;
  
  const trendsData = trendsResponse.data;

  return { ...dashboardData, ...trendsData };
};
