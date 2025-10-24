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
import RequireAuth from "./components/RequireAuth";
import Login from "./pages/Login";
import Profile from "./pages/Profile";

export const routes: RouteObject[] = [
  { path: "/login", element: <Login /> },
  { path: "/profile", element: <RequireAuth><Profile /></RequireAuth> },
  { path: "/", element: <RequireAuth><RequireRole allowed={["Admin","Quản lý cơ sở"]}><Dashboard /></RequireRole></RequireAuth> },
  { path: "/users", element: <RequireAuth><RequireRole allowed={["Admin"]}><UsersRBAC /></RequireRole></RequireAuth> },
  { path: "/properties", element: <RequireAuth><RequireRole allowed={["Admin","Quản lý cơ sở"]}><Properties /></RequireRole></RequireAuth> },
  { path: "/rooms", element: <RequireAuth><RequireRole allowed={["Admin","Quản lý cơ sở","Lễ tân"]}><Rooms /></RequireRole></RequireAuth> },
  { path: "/room-types", element: <RequireAuth><RequireRole allowed={["Admin","Quản lý cơ sở"]}><RoomTypes /></RequireRole></RequireAuth> },
  { path: "/rate-plans", element: <RequireAuth><RequireRole allowed={["Admin","Quản lý cơ sở"]}><RatePlans /></RequireRole></RequireAuth> },
  { path: "/bookings", element: <RequireAuth><RequireRole allowed={["Lễ tân"]}><Bookings /></RequireRole></RequireAuth> },
  { path: "/housekeeping", element: <RequireAuth><RequireRole allowed={["HK","Lễ tân"]}><Housekeeping /></RequireRole></RequireAuth> },
  { path: "/maintenance", element: <RequireAuth><RequireRole allowed={["HK","Quản lý cơ sở"]}><Maintenance /></RequireRole></RequireAuth> },
  { path: "/restaurant", element: <RequireAuth><RequireRole allowed={["Quản lý cơ sở","Thu ngân","Bếp"]}><Restaurant /></RequireRole></RequireAuth> },
  { path: "/reports", element: <RequireAuth><RequireRole allowed={["Admin","Quản lý cơ sở","Kế toán"]}><Reports /></RequireRole></RequireAuth> },
  { path: "/audit-log", element: <RequireAuth><RequireRole allowed={["Admin"]}><AuditLog /></RequireRole></RequireAuth> },
  { path: "/room-calendar", element: <RequireAuth><RequireRole allowed={["Lễ tân","Quản lý cơ sở"]}><RoomCalendar /></RequireRole></RequireAuth> },
];
