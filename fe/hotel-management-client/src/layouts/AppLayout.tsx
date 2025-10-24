import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ApartmentIcon from "@mui/icons-material/Apartment";
import AssessmentIcon from "@mui/icons-material/Assessment";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CategoryIcon from "@mui/icons-material/Category";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import CleaningServicesOutlinedIcon from "@mui/icons-material/CleaningServicesOutlined";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DomainIcon from "@mui/icons-material/Domain";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import HotelIcon from "@mui/icons-material/Hotel";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import MenuIcon from "@mui/icons-material/Menu";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PeopleIcon from "@mui/icons-material/People";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import PublicIcon from "@mui/icons-material/Public";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import {
  AppBar,
  Avatar,
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
  Menu,
  MenuItem,
  Select,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Role } from "../context/AuthContext";
import { useAuth } from "../context/AuthContext";

const drawerWidth = 240;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, setRole, propertyId, setPropertyId, user, logout } = useAuth();
  const isMobile = useMediaQuery("(max-width:900px)");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const mobileMenuOpen = Boolean(mobileMenuAnchor);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const profileOpen = Boolean(profileAnchor);

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
  const getPropertyIconColor = (v: string): string => {
    switch (v) {
      case "":
        return "text.secondary";
      case "A":
        return "primary.main";
      case "B":
        return "secondary.main";
      default:
        return "info.main";
    }
  };
  const getPropertyIcon = (v: string) => {
    switch (v) {
      case "":
        return (
          <PublicIcon
            fontSize="small"
            sx={{ color: getPropertyIconColor(v) }}
          />
        );
      case "A":
        return (
          <HotelIcon fontSize="small" sx={{ color: getPropertyIconColor(v) }} />
        );
      case "B":
        return (
          <ApartmentIcon
            fontSize="small"
            sx={{ color: getPropertyIconColor(v) }}
          />
        );
      default:
        return (
          <DomainIcon
            fontSize="small"
            sx={{ color: getPropertyIconColor(v) }}
          />
        );
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
        <Toolbar sx={{ flexWrap: "wrap", color: "common.white" }}>
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
          {!isMobile ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: { xs: 1, sm: 1.5 },
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "common.white", fontWeight: 600 }}
              >
                Cơ sở:
              </Typography>
              <Select
                size="small"
                value={propertyId || ""}
                onChange={(e) => setPropertyId(e.target.value)}
                sx={{
                  color: "common.white",
                  minWidth: { xs: 120, sm: 160 },
                  "& .MuiSvgIcon-root": { color: "common.white" },
                }}
                displayEmpty
              >
                <MenuItem value="">
                  {getPropertyIcon("")}
                  <span style={{ marginLeft: 8 }}>Tất cả</span>
                </MenuItem>
                <MenuItem value="A">
                  {getPropertyIcon("A")}
                  <span style={{ marginLeft: 8 }}>Hotel A</span>
                </MenuItem>
                <MenuItem value="B">
                  {getPropertyIcon("B")}
                  <span style={{ marginLeft: 8 }}>Hotel B</span>
                </MenuItem>
              </Select>
              <Typography
                variant="body2"
                sx={{
                  ml: { xs: 0, sm: 1 },
                  color: "common.white",
                  fontWeight: 600,
                }}
              >
                Vai trò:
              </Typography>
              <Select
                size="small"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                sx={{
                  color: "common.white",
                  minWidth: { xs: 120, sm: 160 },
                  "& .MuiSvgIcon-root": { color: "common.white" },
                }}
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
            </Box>
          ) : (
            <>
              <IconButton
                color="inherit"
                aria-label="Mở menu"
                onClick={(e) => setMobileMenuAnchor(e.currentTarget)}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={mobileMenuAnchor}
                open={mobileMenuOpen}
                onClose={() => setMobileMenuAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <Box sx={{ px: 2, py: 1.5, width: 280 }}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Cơ sở
                  </Typography>
                  <Select
                    size="small"
                    value={propertyId || ""}
                    onChange={(e) => {
                      setPropertyId(e.target.value);
                    }}
                    fullWidth
                    displayEmpty
                  >
                    <MenuItem value="">
                      {getPropertyIcon("")}
                      <span style={{ marginLeft: 8 }}>Tất cả</span>
                    </MenuItem>
                    <MenuItem value="A">
                      {getPropertyIcon("A")}
                      <span style={{ marginLeft: 8 }}>Hotel A</span>
                    </MenuItem>
                    <MenuItem value="B">
                      {getPropertyIcon("B")}
                      <span style={{ marginLeft: 8 }}>Hotel B</span>
                    </MenuItem>
                  </Select>

                  <Typography variant="subtitle2" sx={{ mt: 1.5, mb: 0.5 }}>
                    Vai trò
                  </Typography>
                  <Select
                    size="small"
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value as Role);
                    }}
                    fullWidth
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
                </Box>
              </Menu>
            </>
          )}
          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                onClick={(e) => setProfileAnchor(e.currentTarget)}
                sx={{ ml: 0.5 }}
              >
                <Avatar sx={{ width: 28, height: 28 }} src={user?.picture}>
                  {user?.name?.[0] ?? "U"}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={profileAnchor}
                open={profileOpen}
                onClose={() => setProfileAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem
                  onClick={() => {
                    navigate("/profile");
                    setProfileAnchor(null);
                  }}
                >
                  <ListItemIcon>
                    <ManageAccountsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Hồ sơ</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    logout();
                    navigate("/login");
                    setProfileAnchor(null);
                  }}
                >
                  <ListItemIcon>
                    <MeetingRoomIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Đăng xuất</ListItemText>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Tooltip title="Tài khoản">
                <IconButton
                  color="inherit"
                  onClick={(e) => setProfileAnchor(e.currentTarget)}
                  sx={{ ml: 1 }}
                >
                  <Avatar sx={{ width: 32, height: 32 }} src={user?.picture}>
                    {user?.name?.[0] ?? "U"}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={profileAnchor}
                open={profileOpen}
                onClose={() => setProfileAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem
                  onClick={() => {
                    navigate("/profile");
                    setProfileAnchor(null);
                  }}
                >
                  <ListItemIcon>
                    <ManageAccountsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Hồ sơ</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    logout();
                    navigate("/login");
                    setProfileAnchor(null);
                  }}
                >
                  <ListItemIcon>
                    <MeetingRoomIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Đăng xuất</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
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
