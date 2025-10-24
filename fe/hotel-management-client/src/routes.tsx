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

export const routes: RouteObject[] = [
  { path: "/", element: <Dashboard /> },
  { path: "/users", element: <UsersRBAC /> },
  { path: "/properties", element: <Properties /> },
  { path: "/rooms", element: <Rooms /> },
  { path: "/room-types", element: <RoomTypes /> },
  { path: "/rate-plans", element: <RatePlans /> },
  { path: "/bookings", element: <Bookings /> },
  { path: "/housekeeping", element: <Housekeeping /> },
  { path: "/maintenance", element: <Maintenance /> },
  { path: "/restaurant", element: <Restaurant /> },
  { path: "/reports", element: <Reports /> },
  { path: "/audit-log", element: <AuditLog /> },
  { path: "/room-calendar", element: <RoomCalendar /> },
];
