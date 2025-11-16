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
  Home,
  Category,
  Bed,
  ShoppingCart,
} from "@mui/icons-material";

export const menuItems = {
  admin: [
    { title: "Tổng quan", path: "/admin/dashboard", icon: <DashboardIcon /> },
    {
      title: "Quản lý người dùng",
      path: "/admin/user-management",
      icon: <PersonIcon />,
    },
    { title: "Quản lý cơ sở", path: "/admin/hotels", icon: <HotelIcon /> },
    {
      title: "Nhật ký hoạt động",
      path: "/admin/audit-logs",
      icon: <ReceiptIcon />,
    },
  ],
  facilityManager: [
    { title: "Tổng quan", path: "/manager/dashboard", icon: <DashboardIcon /> },
    { title: "Loại phòng", path: "/manager/room-types", icon: <Category /> },
    { title: "Phòng", path: "/manager/rooms", icon: <Bed /> },
    { title: "Món ăn", path: "/manager/menus", icon: <DiningIcon /> },
  ],
  frontDesk: [
    {
      title: "Tổng quan",
      path: "/frontdesk/dashboard",
      icon: <DashboardIcon />,
    },
    { title: "Đặt phòng", path: "/frontdesk/bookings", icon: <HotelIcon /> },
    { title: "Đặt món", path: "/frontdesk/orders", icon: <RestaurantIcon /> },
  ],
  kitchen: [
    { title: "Tổng quan", path: "/kitchen/dashboard", icon: <DashboardIcon /> },
    {
      title: "Lịch trình món ăn",
      path: "/kitchen/timeline",
      icon: <RestaurantIcon />,
    },
    {
      title: "Mua nguyên liệu",
      path: "/kitchen/shopping-list",
      icon: <ShoppingCart />,
    },
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
