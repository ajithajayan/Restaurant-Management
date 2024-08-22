import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import ErrorBoundary from "./components/Layout/ErrorBoundary";
import NotFound404 from "./components/Layout/NotFound404";
import Register from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute, { AuthenticatedRoute } from "./components/Layout/ProtectedRoute";

const queryClient = new QueryClient();

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const DishesPage = lazy(() => import("./pages/DishesPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const BillsPage = lazy(() => import("./pages/BillsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const DiningTablePage = lazy(() => import("./pages/DiningTablePage"));
const CouponPage = lazy(() => import("./pages/CouponPage")); 
const HomePage = lazy(() => import("./pages/HomePage"));
const MessPage = lazy(() => import("./pages/MessPage"));
const SalesReportPage = lazy(() => import("./pages/SalesReportPage"));
// const AddProductPage = lazy(() => import("./pages/AddProductPage")); 
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/register" element={<AuthenticatedRoute><Register /></AuthenticatedRoute>} />
              <Route path="/login" element={<AuthenticatedRoute><LoginPage /></AuthenticatedRoute>} />
              <Route path="/dishes" element={<ProtectedRoute><DishesPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/bills" element={<ProtectedRoute><BillsPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} /> 
              <Route path="/dining-table" element={<ProtectedRoute><DiningTablePage /></ProtectedRoute>} /> 
              <Route path="/coupons" element={<ProtectedRoute><CouponPage /></ProtectedRoute>} /> 
              <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/mess" element={<ProtectedRoute><MessPage /></ProtectedRoute>} />
              <Route path="/salesreport" element={<ProtectedRoute><SalesReportPage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              {/* <Route path="/add-products" element={<ProtectedRoute><AddProductPage /></ProtectedRoute>} /> Add the new AddProductPage route */}
              <Route path="*" element={<NotFound404 />} />
            </Routes>
          </Suspense>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
