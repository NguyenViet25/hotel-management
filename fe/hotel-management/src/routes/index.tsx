import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense, type JSX } from "react";
import { CircularProgress, Box } from "@mui/material";

// Layouts
import MainLayout from "../components/layout/MainLayout";
import AdminDashboardPage from "../pages/dashboard/admin";
import { menuItems } from "./menu-items";
import ManagerDashboardPage from "../pages/dashboard/manager";
import { useStore, type StoreState } from "../hooks/useStore";
import OrdersManagementPage from "../pages/dashboard/waiter/orders/OrdersManagementPage";
import SessionBoardPage from "../pages/dashboard/waiter/sessions/SessionBoardPage";
import SessionDetailsPage from "../pages/dashboard/waiter/sessions/SessionDetailsPage";
import KitchenTimelinePage from "../pages/dashboard/manager/kitchen/KitchenTimelinePage";
import DiscountCodesPage from "../pages/dashboard/manager/discounts/DiscountCodesPage";
import MinibarManagementPage from "../pages/dashboard/manager/minibars/MinibarManagementPage";
import MyTask from "../pages/dashboard/housekeeper/MyTask";
import RoomNeedCleaningPage from "../pages/dashboard/housekeeper/RoomNeedCleaningPage";
import InvoiceManagementPage from "../pages/dashboard/frontdesk/invoices/InvoiceManagementPage";
import FrontDeskTableManagementPage from "../pages/dashboard/frontdesk/tables/FrontDeskTableManagementPage";
import HotelSettingsPage from "../pages/dashboard/manager/hotels/HotelSettingsPage";
import FrontDeskTimelinePage from "../pages/dashboard/frontdesk/orders/FrontDeskTimelinePage";
import ManagerUserManagement from "../pages/dashboard/manager/user-management";
import GuestsManagementPage from "../pages/dashboard/manager/guests/GuestsManagementPage";
import RoomMap from "../pages/dashboard/manager/rooms/designer/RoomMap";
import PageTitle from "../components/common/PageTitle";

// Role-aware layout wrapper for standalone pages like /profile
const RoleAwareLayout = () => {
  const { user } = useStore<StoreState>((s) => s);
  const role = user?.roles?.[0] || user?.roles || "";
  let items = menuItems.admin;
  switch (role) {
    case "Admin":
      items = menuItems.admin;
      break;
    case "Manager":
      items = menuItems.facilityManager;
      break;
    case "FrontDesk":
      items = menuItems.frontDesk;
      break;
    case "Kitchen":
      items = menuItems.kitchen;
      break;
    case "Waiter":
      items = menuItems.waiter;
      break;

    case "Housekeeper":
      items = menuItems.housekeeper;
      break;
  }
  return <MainLayout title="Profile" menuItems={items} />;
};

// Pages
const NotFoundPage = lazy(() => import("../pages/not-found"));
const LoginPage = lazy(() => import("../pages/login"));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage"));
const UserManagementPage = lazy(
  () => import("../pages/dashboard/admin/user-management")
);
const AuditLogsPage = lazy(() => import("../pages/dashboard/admin/audit-logs"));
const HotelsListPage = lazy(
  () => import("../features/hotels/pages/HotelsListPage")
);
const ManagerRoomTypesPage = lazy(
  () => import("../pages/dashboard/manager/room-types")
);
const ManagerRoomsPage = lazy(
  () => import("../pages/dashboard/manager/rooms/RoomPage")
);
const ManagerMenusPage = lazy(
  () => import("../pages/dashboard/manager/menus/MenuManagementPage")
);
const ManagerRevenuePage = lazy(
  () => import("../pages/dashboard/manager/revenue/RevenuePage")
);
const ManagerTablesPage = lazy(
  () => import("../pages/dashboard/manager/tables/TableManagementPage")
);
const ManagerMediaPage = lazy(
  () => import("../pages/dashboard/manager/media/MediaManagementPage")
);
const KitchenManagementPage = lazy(
  () => import("../pages/dashboard/manager/kitchen/KitchenManagementPage")
);
const BookingManagementPage = lazy(
  () => import("../pages/dashboard/frontdesk/bookings/BookingManagementPage")
);
const BookingDetailsPage = lazy(
  () => import("../pages/dashboard/frontdesk/bookings/BookingDetailsPage")
);
const CustomerDetailsPage = lazy(
  () => import("../pages/dashboard/frontdesk/customers/CustomerDetailsPage")
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
const FrontDeskDashboardPage = lazy(
  () => import("../pages/dashboard/frontdesk")
);

const KitchenDashboardPage = lazy(() => import("../pages/dashboard/kitchen"));
const KitchenDashboard = () => (
  <Suspense fallback={<LoadingFallback />}>
    <KitchenDashboardPage />
  </Suspense>
);
const WaiterDashboardPage = lazy(() => import("../pages/dashboard/waiter"));
const WaiterDashboard = () => (
  <Suspense fallback={<LoadingFallback />}>
    <WaiterDashboardPage />
  </Suspense>
);
const HousekeeperPage = lazy(
  () => import("../pages/dashboard/housekeeper/HousekeepingPage")
);

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
  {
    path: "/profile",
    element: (
      <RequireAuth>
        <RoleAwareLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: "",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ProfilePage />
          </Suspense>
        ),
      },
    ],
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
        element: <Navigate to="/dashboard" replace />,
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
        <MainLayout title="Manager" menuItems={menuItems.facilityManager} />
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
      {
        path: "user-management",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ManagerUserManagement />
          </Suspense>
        ),
      },
      {
        path: "room-types",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ManagerRoomTypesPage />
          </Suspense>
        ),
      },
      {
        path: "bookings",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <BookingManagementPage />
          </Suspense>
        ),
      },
      {
        path: "rooms",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ManagerRoomsPage />
          </Suspense>
        ),
      },
      {
        path: "guests",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <GuestsManagementPage />
          </Suspense>
        ),
      },
      {
        path: "discount-codes",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <DiscountCodesPage />
          </Suspense>
        ),
      },
      {
        path: "menus",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ManagerMenusPage />
          </Suspense>
        ),
      },
      {
        path: "revenue",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ManagerRevenuePage />
          </Suspense>
        ),
      },
      {
        path: "timeline",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <FrontDeskTimelinePage />
          </Suspense>
        ),
      },
      {
        path: "minibars",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <MinibarManagementPage />
          </Suspense>
        ),
      },
      {
        path: "tables",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ManagerTablesPage />
          </Suspense>
        ),
      },
      {
        path: "media",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ManagerMediaPage />
          </Suspense>
        ),
      },
      {
        path: "hotel-settings",
        element: <HotelSettingsPage />,
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
        path: "room-map",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <PageTitle
              title="Danh sách phòng"
              subtitle="Quản lý phòng theo dạng danh sách trực quan"
            ></PageTitle>
            <RoomMap allowAddNew={false} />
          </Suspense>
        ),
      },
      {
        path: "dashboard",
        element: <FrontDeskDashboardPage />,
      },
      {
        path: "guests",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <GuestsManagementPage />
          </Suspense>
        ),
      },
      {
        path: "orders",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <OrdersManagementPage />
          </Suspense>
        ),
      },
      {
        path: "timeline",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <FrontDeskTimelinePage />
          </Suspense>
        ),
      },
      {
        path: "sessions",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <SessionBoardPage />
          </Suspense>
        ),
      },
      {
        path: "sessions/:id",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <SessionDetailsPage />
          </Suspense>
        ),
      },
      {
        path: "table-map",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <FrontDeskTableManagementPage />
          </Suspense>
        ),
      },
      {
        path: "bookings",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <BookingManagementPage />
          </Suspense>
        ),
      },
      {
        path: "bookings/:id",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <BookingDetailsPage />
          </Suspense>
        ),
      },
      {
        path: "customers/:id",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <CustomerDetailsPage />
          </Suspense>
        ),
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
      {
        path: "timeline",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <KitchenTimelinePage />
          </Suspense>
        ),
      },
      {
        path: "orders",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <KitchenManagementPage />
          </Suspense>
        ),
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
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <WaiterDashboard />
          </Suspense>
        ),
      },
      {
        path: "dashboard",
        element: <WaiterDashboard />,
      },
      {
        path: "sessions",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <SessionBoardPage />
          </Suspense>
        ),
      },
      {
        path: "sessions/:id",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <SessionDetailsPage />
          </Suspense>
        ),
      },
      // Add other waiter routes here
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
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <HousekeeperPage />
          </Suspense>
        ),
      },
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <HousekeeperPage />
          </Suspense>
        ),
      },
      {
        path: "rooms",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <RoomNeedCleaningPage />
          </Suspense>
        ),
      },
      {
        path: "my-tasks",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <MyTask />
          </Suspense>
        ),
      },
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
