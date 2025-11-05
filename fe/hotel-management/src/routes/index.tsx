import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense, type JSX } from "react";
import { CircularProgress, Box } from "@mui/material";

// Layouts
import MainLayout from "../components/layout/MainLayout";
import AdminDashboardPage from "../pages/dashboard/admin";
import { menuItems } from "./menu-items";
import ManagerDashboardPage from "../pages/dashboard/manager";

// Pages
const NotFoundPage = lazy(() => import("../pages/not-found"));
const LoginPage = lazy(() => import("../pages/login"));
const UserManagementPage = lazy(
  () => import("../pages/dashboard/admin/user-management")
);
const AuditLogsPage = lazy(() => import("../pages/dashboard/admin/audit-logs"));
const HotelsListPage = lazy(
  () => import("../features/hotels/pages/HotelsListPage")
);
// Loading component
const LoadingFallback = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
    }}
  >
    <CircularProgress />
  </Box>
);

const AdminDashboard = () => <AdminDashboardPage />;
const ManagerDashboard = () => <ManagerDashboardPage />;
const FrontDeskDashboard = () => <div>Front Desk Dashboard</div>;
const KitchenDashboard = () => <div>Kitchen Dashboard</div>;
const WaiterDashboard = () => <div>Waiter Dashboard</div>;
const CashierDashboard = () => <div>Cashier Dashboard</div>;
const AccountantDashboard = () => <div>Accountant Dashboard</div>;
const HousekeeperDashboard = () => <div>Housekeeper Dashboard</div>;

// Auth guard component
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <LoginPage />
      </Suspense>
    ),
  },
  // Admin routes
  {
    path: "/admin",
    element: (
      <RequireAuth>
        <MainLayout title="Admin Dashboard" menuItems={menuItems.admin} />
      </RequireAuth>
    ),
    children: [
      {
        path: "",
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "user-management",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <UserManagementPage />
          </Suspense>
        ),
      },
      {
        path: "hotels",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <HotelsListPage />
          </Suspense>
        ),
      },
      {
        path: "audit-logs",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <AuditLogsPage />
          </Suspense>
        ),
      },
      // Add other admin routes here
    ],
  },
  // Facility Manager routes
  {
    path: "/manager",
    element: (
      <RequireAuth>
        <MainLayout
          title="Facility Manager"
          menuItems={menuItems.facilityManager}
        />
      </RequireAuth>
    ),
    children: [
      {
        path: "",
        element: <Navigate to="/manager/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <ManagerDashboard />,
      },
      // Add other manager routes here
    ],
  },
  // Front Desk routes
  {
    path: "/frontdesk",
    element: (
      <RequireAuth>
        <MainLayout title="Front Desk" menuItems={menuItems.frontDesk} />
      </RequireAuth>
    ),
    children: [
      {
        path: "",
        element: <Navigate to="/frontdesk/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <FrontDeskDashboard />,
      },
      // Add other front desk routes here
    ],
  },
  // Kitchen routes
  {
    path: "/kitchen",
    element: (
      <RequireAuth>
        <MainLayout title="Kitchen" menuItems={menuItems.kitchen} />
      </RequireAuth>
    ),
    children: [
      {
        path: "",
        element: <Navigate to="/kitchen/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <KitchenDashboard />,
      },
      // Add other kitchen routes here
    ],
  },
  // Waiter routes
  {
    path: "/waiter",
    element: (
      <RequireAuth>
        <MainLayout title="Waiter/Service" menuItems={menuItems.waiter} />
      </RequireAuth>
    ),
    children: [
      {
        path: "",
        element: <Navigate to="/waiter/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <WaiterDashboard />,
      },
      // Add other waiter routes here
    ],
  },
  // Cashier routes
  {
    path: "/cashier",
    element: (
      <RequireAuth>
        <MainLayout title="Cashier" menuItems={menuItems.cashier} />
      </RequireAuth>
    ),
    children: [
      {
        path: "",
        element: <Navigate to="/cashier/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <CashierDashboard />,
      },
      // Add other cashier routes here
    ],
  },
  // Accountant routes
  {
    path: "/accountant",
    element: (
      <RequireAuth>
        <MainLayout title="Accountant" menuItems={menuItems.accountant} />
      </RequireAuth>
    ),
    children: [
      {
        path: "",
        element: <Navigate to="/accountant/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <AccountantDashboard />,
      },
      // Add other accountant routes here
    ],
  },
  // Housekeeper routes
  {
    path: "/housekeeper",
    element: (
      <RequireAuth>
        <MainLayout title="Housekeeping" menuItems={menuItems.housekeeper} />
      </RequireAuth>
    ),
    children: [
      {
        path: "",
        element: <Navigate to="/housekeeper/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <HousekeeperDashboard />,
      },
      // Add other housekeeper routes here
    ],
  },
  // 404 route
  {
    path: "*",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);

export default router;
