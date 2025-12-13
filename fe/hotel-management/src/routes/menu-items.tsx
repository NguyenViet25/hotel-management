import {
  AccessTime,
  AccessTimeFilled,
  AccessTimeFilledOutlined,
  AttachMoney,
  Bed,
  Category,
  CleanHands,
  Dashboard as DashboardIcon,
  LocalDining as DiningIcon,
  Discount,
  History,
  Hotel as HotelIcon,
  InsertEmoticon,
  Money,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  Restaurant as RestaurantIcon,
  SensorsOutlined,
  Settings,
  ShoppingCart,
  TableBar,
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
    {
      title: "Quản lý người dùng",
      path: "/manager/user-management",
      icon: <PersonIcon />,
    },
    { title: "Loại phòng", path: "/manager/room-types", icon: <Category /> },
    { title: "Phòng", path: "/manager/rooms", icon: <Bed /> },
    { title: "Khách", path: "/manager/guests", icon: <PersonIcon /> },
    {
      title: "Mã giảm giá",
      path: "/manager/discount-codes",
      icon: <Discount />,
    },
    { title: "Thực đơn", path: "/manager/menus", icon: <DiningIcon /> },
    // {
    //   title: "Báo cáo doanh thu",
    //   path: "/manager/revenue",
    //   icon: <AttachMoney />,
    // },
    {
      title: "Lịch trình món ăn",
      path: "/manager/timeline",
      icon: <AccessTime />,
    },
    { title: "Bàn ăn", path: "/manager/tables", icon: <TableBar /> },
    { title: "Minibar", path: "/manager/minibars", icon: <InsertEmoticon /> },
    {
      title: "Cài đặt khách sạn",
      path: "/manager/hotel-settings",
      icon: <Settings />,
    },
    // { title: "Media", path: "/manager/media", icon: <Image /> },
  ],
  frontDesk: [
    {
      title: "Tổng quan",
      path: "/frontdesk/dashboard",
      icon: <DashboardIcon />,
    },
    { title: "Khách", path: "/frontdesk/guests", icon: <PersonIcon /> },
    { title: "Đặt phòng", path: "/frontdesk/bookings", icon: <HotelIcon /> },
    { title: "Đặt món", path: "/frontdesk/orders", icon: <RestaurantIcon /> },
    // {
    //   title: "Lịch trình món ăn",
    //   path: "/frontdesk/timeline",
    //   icon: <AccessTime />,
    // },
    {
      title: "Phiên phục vụ",
      path: "/frontdesk/sessions",
      icon: <SensorsOutlined />,
    },
    {
      title: "Danh sách bàn",
      path: "/frontdesk/table-map",
      icon: <TableBar />,
    },
  ],
  kitchen: [
    { title: "Tổng quan", path: "/kitchen/dashboard", icon: <DashboardIcon /> },
    {
      title: "Lịch trình món ăn",
      path: "/kitchen/timeline",
      icon: <RestaurantIcon />,
    },
    {
      title: "Đơn đồ ăn",
      path: "/kitchen/orders",
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
