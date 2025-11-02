import {
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
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
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useStore, type StoreState } from "../../hooks/useStore";
import theme from "../../theme";
import { getRoleInfo } from "../../utils/role-mapper";

const drawerWidth = 280;

interface MainLayoutProps {
  title: string;
  menuItems: {
    title: string;
    path: string;
    icon: React.ReactNode;
  }[];
}

const MainLayout = ({ menuItems }: MainLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const { user } = useStore<StoreState>((state) => state);
  console.log(user);
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Update drawer state when screen size changes
  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  const handleDrawerOpen = () => {
    setOpen(!open);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex", bgcolor: "#ffffff" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: (theme) =>
            theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          ...(open &&
            !isMobile && {
              marginLeft: drawerWidth,
              width: `calc(100% - ${drawerWidth}px)`,
              transition: (theme) =>
                theme.transitions.create(["width", "margin"], {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
            }),
          boxShadow: "none",
          borderBottom: "1px solid #ccc",
          backgroundColor: "white",
          color: "black",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />
          <Stack>
            <Typography variant="body1">{user?.fullname}</Typography>
            <Typography variant="body2" fontStyle={"italic"} fontWeight={600}>
              {getRoleInfo(user?.roles[0])?.label}
            </Typography>
          </Stack>

          <IconButton onClick={handleProfileMenuOpen} size="large" edge="end">
            <Avatar sx={{ width: 38, height: 38 }}>
              <PersonIcon />
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={() => navigate("/profile")} sx={{ width: 220 }}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Thông tin cá nhân
            </MenuItem>

            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Đăng xuất
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={isMobile ? handleDrawerClose : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            bgcolor: "#ffffff",
            ...(open && !isMobile
              ? {
                  overflowX: "hidden",
                  transition: (theme) =>
                    theme.transitions.create("width", {
                      easing: theme.transitions.easing.sharp,
                      duration: theme.transitions.duration.enteringScreen,
                    }),
                }
              : {
                  overflowX: "hidden",
                  transition: (theme) =>
                    theme.transitions.create("width", {
                      easing: theme.transitions.easing.sharp,
                      duration: theme.transitions.duration.leavingScreen,
                    }),
                  width: (theme) => theme.spacing(7),
                  [theme.breakpoints.up("sm")]: {
                    width: (theme) => theme.spacing(9),
                  },
                }),
            width: drawerWidth,
          },
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            px: [1],
          }}
        >
          {user && (
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, ml: 2 }}
            >
              logo_placeholder
            </Typography>
          )}
        </Toolbar>

        <List sx={{ overflowY: "auto", mt: 2 }}>
          {menuItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(`${item.path}/`);
            return (
              <ListItem key={item.title} disablePadding>
                <ListItemButton
                  sx={{
                    mx: 2,
                    justifyContent: open ? "initial" : "center",
                    px: 1.5,
                    mb: 1,
                    borderRadius: "10px",
                    bgcolor: isActive ? "#6E8CFB" : "transparent",
                    color: isActive ? "white" : "black",
                    "&:hover": {
                      bgcolor: isActive ? "#6E8CFB" : "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 1.5 : "auto",
                      justifyContent: "center",
                      color: isActive ? "white" : "inherit",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    sx={{
                      opacity: open ? 1 : 0,
                      display: open ? "block" : "none",
                      color: isActive ? "white" : "inherit",
                      fontWeight: isActive ? "bold" : "normal",
                    }}
                    primaryTypographyProps={{
                      fontWeight: isActive ? "bold" : "normal",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          overflow: "auto",
          height: "100vh",
          bgcolor: "#ffffff",
        }}
      >
        <Toolbar /> {/* Spacer to prevent content from hiding under AppBar */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
