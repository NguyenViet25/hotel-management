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
} from "@mui/material";
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import theme from "../../theme";

const drawerWidth = 240;

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

const MainLayout = ({ title, menuItems }: MainLayoutProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerOpen = () => {
    setOpen(true);
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
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          boxShadow: "none",
          borderBottom: "1px solid #ccc",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: (theme) =>
            theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: (theme) =>
              theme.transitions.create(["width", "margin"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          }),
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
            sx={{
              ...(open && { display: "none" }),
            }}
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
            <MenuItem onClick={() => navigate("/profile")}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={() => navigate("/settings")}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            ...(open
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
            QL Cơ Sở
          </Typography>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>

        <List>
          {menuItems.map((item) => (
            <ListItem key={item.title} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
