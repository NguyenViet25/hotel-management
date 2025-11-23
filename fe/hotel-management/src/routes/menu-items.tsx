import {
  Bed,
  Category,
  CleanHands,
  Dashboard as DashboardIcon,
  LocalDining as DiningIcon,
  Discount,
  Gamepad,
  History,
  Hotel as HotelIcon,
  Image,
  InsertEmoticon,
  Payments as PaymentsIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  Restaurant as RestaurantIcon,
  Room as RoomIcon,
  Settings as SettingsIcon,
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
    {
      title: "Mã giảm giá",
      path: "/manager/discount-codes",
      icon: <Discount />,
    },
    { title: "Món ăn", path: "/manager/menus", icon: <DiningIcon /> },
    { title: "Bàn ăn", path: "/manager/tables", icon: <RestaurantIcon /> },
    { title: "Minibar", path: "/manager/minibars", icon: <InsertEmoticon /> },
    { title: "Media", path: "/manager/media", icon: <Image /> },
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
    {
      title: "Phiên phục vụ",
      path: "/waiter/sessions",
      icon: <RestaurantIcon />,
    },
  ],
  housekeeper: [
    {
      title: "Tổng quan",
      path: "/housekeeper/dashboard",
      icon: <DashboardIcon />,
    },
    {
      title: "Phòng cần dọn",
      path: "/housekeeper/rooms",
      icon: <CleanHands />,
    },
    {
      title: "Lịch sử",
      path: "/housekeeper/my-tasks",
      icon: <History />,
    },
  ],
};
