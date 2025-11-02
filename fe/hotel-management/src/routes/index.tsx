import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense, type JSX } from "react";
import { CircularProgress, Box } from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Hotel as HotelIcon,
  Person as PersonIcon,
  Restaurant as RestaurantIcon,
  Room as RoomIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  Payments as PaymentsIcon,
  LocalDining as DiningIcon,
  AccountBalance as AccountBalanceIcon,
} from "@mui/icons-material";

// Layouts
import MainLayout from "../components/layout/MainLayout";

// Pages
const LoginPage = lazy(() => import("../pages/login"));
const NotFoundPage = lazy(() => import("../pages/not-found"));

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

// Role-based menu items
const menuItems = {
  admin: [
    { title: "Tổng quan", path: "/admin/dashboard", icon: <DashboardIcon /> },
    { title: "Quản lý người dùng", path: "/admin/users", icon: <PersonIcon /> },
    { title: "Quản lý cơ sở", path: "/admin/facilities", icon: <HotelIcon /> },
    { title: "Nhật ký hoạt động", path: "/admin/audit", icon: <ReceiptIcon /> },
  ],
  facilityManager: [
    { title: "Tổng quan", path: "/manager/dashboard", icon: <DashboardIcon /> },
    { title: "Room Status", path: "/manager/rooms", icon: <RoomIcon /> },
    { title: "Revenue", path: "/manager/revenue", icon: <PaymentsIcon /> },
    {
      title: "Maintenance",
      path: "/manager/maintenance",
      icon: <SettingsIcon />,
    },
    { title: "Staff", path: "/manager/staff", icon: <PersonIcon /> },
    { title: "Reports", path: "/manager/reports", icon: <ReceiptIcon /> },
  ],
  frontDesk: [
    {
      title: "Tổng quan",
      path: "/frontdesk/dashboard",
      icon: <DashboardIcon />,
    },
    { title: "Bookings", path: "/frontdesk/bookings", icon: <HotelIcon /> },
    { title: "Check-in/out", path: "/frontdesk/checkin", icon: <PersonIcon /> },
    { title: "Room Status", path: "/frontdesk/rooms", icon: <RoomIcon /> },
    { title: "Charges", path: "/frontdesk/charges", icon: <PaymentsIcon /> },
    { title: "Calendar", path: "/frontdesk/calendar", icon: <ReceiptIcon /> },
  ],
  kitchen: [
    { title: "Tổng quan", path: "/kitchen/dashboard", icon: <DashboardIcon /> },
    { title: "Orders", path: "/kitchen/orders", icon: <RestaurantIcon /> },
    { title: "Menu", path: "/kitchen/menu", icon: <DiningIcon /> },
  ],
  waiter: [
    { title: "Tổng quan", path: "/waiter/dashboard", icon: <DashboardIcon /> },
    { title: "Tables", path: "/waiter/tables", icon: <RestaurantIcon /> },
    { title: "Orders", path: "/waiter/orders", icon: <DiningIcon /> },
    { title: "Charges", path: "/waiter/charges", icon: <PaymentsIcon /> },
  ],
  cashier: [
    { title: "Dashboard", path: "/cashier/dashboard", icon: <DashboardIcon /> },
    { title: "Payments", path: "/cashier/payments", icon: <PaymentsIcon /> },
    { title: "Invoices", path: "/cashier/invoices", icon: <ReceiptIcon /> },
  ],
  accountant: [
    {
      title: "Dashboard",
      path: "/accountant/dashboard",
      icon: <DashboardIcon />,
    },
    { title: "Folios", path: "/accountant/folios", icon: <ReceiptIcon /> },
    { title: "Revenue", path: "/accountant/revenue", icon: <PaymentsIcon /> },
    { title: "Invoices", path: "/accountant/invoices", icon: <ReceiptIcon /> },
    {
      title: "Reports",
      path: "/accountant/reports",
      icon: <AccountBalanceIcon />,
    },
  ],
  housekeeper: [
    {
      title: "Dashboard",
      path: "/housekeeper/dashboard",
      icon: <DashboardIcon />,
    },
    { title: "Room Status", path: "/housekeeper/rooms", icon: <RoomIcon /> },
    { title: "Tasks", path: "/housekeeper/tasks", icon: <SettingsIcon /> },
  ],
};

// Placeholder components for each role's dashboard
const AdminDashboard = () => <div>Admin Dashboard</div>;
const ManagerDashboard = () => <div>Facility Manager Dashboard</div>;
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
