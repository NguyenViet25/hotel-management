import {
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  alpha,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import theme from "../../theme";

const drawerWidth = 280;

// Styled search component
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "50%",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
  },
  border: "1px solid #ccc",
  borderRadius: theme.shape.borderRadius,
}));

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

          <Search sx={{ width: "100%" }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Tìm kiếm phòng/khách/đơn..."
              inputProps={{ "aria-label": "search" }}
              sx={{ width: "100%" }}
            />
          </Search>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" sx={{ mr: 2 }}>
            Cơ sở: Hà Nội - Cầu Giấy
          </Typography>
          <IconButton
            onClick={handleProfileMenuOpen}
            size="large"
            edge="end"
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
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
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, ml: 2 }}
          >
            Role name
          </Typography>
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
                    bgcolor: isActive ? "rgba(0, 0, 0, 1)" : "transparent",
                    color: isActive ? "white" : "black",
                    "&:hover": {
                      bgcolor: isActive
                        ? "rgba(0, 0, 0, 1)"
                        : "rgba(0, 0, 0, 0.04)",
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
