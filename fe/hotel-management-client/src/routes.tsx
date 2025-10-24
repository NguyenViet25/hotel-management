import type { RouteObject } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Housekeeping from "./pages/Housekeeping";
import Maintenance from "./pages/Maintenance";
import Bookings from "./pages/Bookings";
import RoomCalendar from "./pages/RoomCalendar";
import UsersRBAC from "./pages/UsersRBAC";
import Properties from "./pages/Properties";
import RoomTypes from "./pages/RoomTypes";
import RatePlans from "./pages/RatePlans";
import Restaurant from "./pages/Restaurant";
import Reports from "./pages/Reports";
import AuditLog from "./pages/AuditLog";
import RequireRole from "./components/RequireRole";

export const routes: RouteObject[] = [
  { path: "/", element: <RequireRole allowed={["Admin","Quản lý cơ sở"]}><Dashboard /></RequireRole> },
  { path: "/users", element: <RequireRole allowed={["Admin"]}><UsersRBAC /></RequireRole> },
  { path: "/properties", element: <RequireRole allowed={["Admin","Quản lý cơ sở"]}><Properties /></RequireRole> },
  { path: "/rooms", element: <RequireRole allowed={["Admin","Quản lý cơ sở","Lễ tân"]}><Rooms /></RequireRole> },
  { path: "/room-types", element: <RequireRole allowed={["Admin","Quản lý cơ sở"]}><RoomTypes /></RequireRole> },
  { path: "/rate-plans", element: <RequireRole allowed={["Admin","Quản lý cơ sở"]}><RatePlans /></RequireRole> },
  { path: "/bookings", element: <RequireRole allowed={["Lễ tân"]}><Bookings /></RequireRole> },
  { path: "/housekeeping", element: <RequireRole allowed={["HK","Lễ tân"]}><Housekeeping /></RequireRole> },
  { path: "/maintenance", element: <RequireRole allowed={["HK","Quản lý cơ sở"]}><Maintenance /></RequireRole> },
  { path: "/restaurant", element: <RequireRole allowed={["Quản lý cơ sở","Thu ngân","Bếp"]}><Restaurant /></RequireRole> },
  { path: "/reports", element: <RequireRole allowed={["Admin","Quản lý cơ sở","Kế toán"]}><Reports /></RequireRole> },
  { path: "/audit-log", element: <RequireRole allowed={["Admin"]}><AuditLog /></RequireRole> },
  { path: "/room-calendar", element: <RequireRole allowed={["Lễ tân","Quản lý cơ sở"]}><RoomCalendar /></RequireRole> },
];
