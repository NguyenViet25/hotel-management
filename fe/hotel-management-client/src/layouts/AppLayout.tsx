import { useMemo, useState } from "react";
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
  useMediaQuery,
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
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import CleaningServicesOutlinedIcon from "@mui/icons-material/CleaningServicesOutlined";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

const drawerWidth = 240;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, setRole, propertyId, setPropertyId } = useAuth();
  const isMobile = useMediaQuery("(max-width:900px)");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems = useMemo(
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
  const filteredMenu = menuItems.filter((m: any) => m.roles.includes(role));
  const getRoleIconColor = (r: Role): string => {
    switch (r) {
      case "Admin":
        return "error.main";
      case "Quản lý cơ sở":
        return "primary.main";
      case "Lễ tân":
        return "info.main";
      case "HK":
        return "success.main";
      case "Bếp":
        return "warning.main";
      case "Thu ngân":
        return "secondary.main";
      case "Kế toán":
        return "secondary.dark";
      default:
        return "text.secondary";
    }
  };
  const getRoleIcon = (r: Role) => {
    switch (r) {
      case "Admin":
        return (
          <AdminPanelSettingsIcon
            fontSize="small"
            sx={{ color: getRoleIconColor(r) }}
          />
        );
      case "Quản lý cơ sở":
        return (
          <ManageAccountsIcon
            fontSize="small"
            sx={{ color: getRoleIconColor(r) }}
          />
        );
      case "Lễ tân":
        return (
          <SupportAgentIcon
            fontSize="small"
            sx={{ color: getRoleIconColor(r) }}
          />
        );
      case "HK":
        return (
          <CleaningServicesOutlinedIcon
            fontSize="small"
            sx={{ color: getRoleIconColor(r) }}
          />
        );
      case "Bếp":
        return (
          <RestaurantMenuIcon
            fontSize="small"
            sx={{ color: getRoleIconColor(r) }}
          />
        );
      case "Thu ngân":
        return (
          <PointOfSaleIcon
            fontSize="small"
            sx={{ color: getRoleIconColor(r) }}
          />
        );
      case "Kế toán":
        return (
          <AccountBalanceIcon
            fontSize="small"
            sx={{ color: getRoleIconColor(r) }}
          />
        );
      default:
        return null;
    }
  };
  const getSidebarIconColor = (path: string, active: boolean): string => {
    const key = (
      {
        "/": "primary",
        "/users": "warning",
        "/properties": "success",
        "/rooms": "info",
        "/room-types": "secondary",
        "/rate-plans": "secondary",
        "/bookings": "warning",
        "/housekeeping": "success",
        "/maintenance": "error",
        "/restaurant": "warning",
        "/reports": "secondary",
        "/audit-log": "error",
        "/room-calendar": "info",
      } as Record<string, string>
    )[path];
    if (!key) return active ? "text.primary" : "text.secondary";
    return active ? `${key}.main` : `${key}.light`;
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ flexWrap: "wrap" }}>
          <IconButton
            color="inherit"
            edge="start"
            sx={{ mr: 2 }}
            onClick={() => setDrawerOpen(!drawerOpen)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Hệ thống quản lý khách sạn
          </Typography>
          <Typography variant="body2" sx={{ mr: { xs: 0.5, sm: 1 } }}>
            Cơ sở:
          </Typography>
          <Select
            size="small"
            value={propertyId || ""}
            onChange={(e) => setPropertyId(e.target.value)}
            sx={{
              color: "inherit",
              mr: { xs: 1, sm: 2 },
              minWidth: { xs: 100, sm: 140 },
            }}
            displayEmpty
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="A">Hotel A</MenuItem>
            <MenuItem value="B">Hotel B</MenuItem>
          </Select>
          <Typography variant="body2" sx={{ mr: { xs: 0.5, sm: 1 } }}>
            Vai trò:
          </Typography>
          <Select
            size="small"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            sx={{ color: "inherit", minWidth: { xs: 110, sm: 140 } }}
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
                {getRoleIcon(r)}
                <span style={{ marginLeft: 8 }}>{r}</span>
              </MenuItem>
            ))}
          </Select>
        </Toolbar>
      </AppBar>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: "auto" }}>
            <List>
              {filteredMenu.map((item: any) => (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => {
                      navigate(item.path);
                      setDrawerOpen(false);
                    }}
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
      ) : (
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
              {filteredMenu.map((item: any) => (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                  >
                    <ListItemIcon
                      sx={{
                        color: getSidebarIconColor(
                          item.path,
                          location.pathname === item.path
                        ),
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            <Divider />
          </Box>
        </Drawer>
      )}
      <Box component="main" sx={{ flexGrow: 1, px: 3, pt: 2, width: "100%" }}>
        <Toolbar />
        <Box> {children}</Box>
      </Box>
    </Box>
  );
}
