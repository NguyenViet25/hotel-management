import { useMemo, type JSX } from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Select,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ApartmentIcon from "@mui/icons-material/Apartment";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import CategoryIcon from "@mui/icons-material/Category";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../context/AuthContext";

const drawerWidth = 240;

interface MenuItemConfig {
  label: string;
  path: string;
  icon: JSX.Element;
  roles: Role[];
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, setRole } = useAuth();

  const menuItems: MenuItemConfig[] = useMemo(
    () => [
      {
        label: "Dashboard",
        path: "/",
        icon: <DashboardIcon />,
        roles: ["Admin", "Quản lý cơ sở"],
      },
      {
        label: "Người dùng & RBAC",
        path: "/users",
        icon: <PeopleIcon />,
        roles: ["Admin"],
      },
      {
        label: "Cơ sở",
        path: "/properties",
        icon: <ApartmentIcon />,
        roles: ["Admin", "Quản lý cơ sở"],
      },
      {
        label: "Phòng",
        path: "/rooms",
        icon: <MeetingRoomIcon />,
        roles: ["Admin", "Quản lý cơ sở", "Lễ tân"],
      },
      {
        label: "Loại phòng",
        path: "/room-types",
        icon: <CategoryIcon />,
        roles: ["Admin", "Quản lý cơ sở"],
      },
      {
        label: "Gói giá",
        path: "/rate-plans",
        icon: <PriceChangeIcon />,
        roles: ["Admin", "Quản lý cơ sở"],
      },
      {
        label: "Đặt phòng",
        path: "/bookings",
        icon: <BookOnlineIcon />,
        roles: ["Lễ tân"],
      },
      {
        label: "Lịch phòng",
        path: "/room-calendar",
        icon: <CalendarMonthIcon />,
        roles: ["Lễ tân", "Quản lý cơ sở"],
      },
      {
        label: "Housekeeping",
        path: "/housekeeping",
        icon: <CleaningServicesIcon />,
        roles: ["HK", "Lễ tân"],
      },
      {
        label: "Bảo trì",
        path: "/maintenance",
        icon: <BuildCircleIcon />,
        roles: ["HK", "Quản lý cơ sở"],
      },
      {
        label: "Nhà hàng",
        path: "/restaurant",
        icon: <RestaurantIcon />,
        roles: ["Quản lý cơ sở", "Thu ngân", "Bếp"],
      },
      {
        label: "Báo cáo",
        path: "/reports",
        icon: <AssessmentIcon />,
        roles: ["Admin", "Quản lý cơ sở", "Kế toán"],
      },
      {
        label: "Audit Log",
        path: "/audit-log",
        icon: <FactCheckIcon />,
        roles: ["Admin"],
      },
    ],
    []
  );

  const filteredMenu = menuItems.filter((m) => m.roles.includes(role));

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Hệ thống quản lý khách sạn
          </Typography>
          <Typography variant="body2" sx={{ mr: 1 }}>
            Vai trò:
          </Typography>
          <Select
            size="small"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            sx={{ color: "inherit" }}
          >
            {(
              [
                "Admin",
                "Quản lý cơ sở",
                "Lễ tân",
                "HK",
                "Bếp",
                "Thu ngân",
                "Kế toán",
              ] as Role[]
            ).map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </Select>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {filteredMenu.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
