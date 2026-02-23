"use client";

import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import ReportIcon from "@mui/icons-material/Report";
import Switch from "@mui/material/Switch";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import LogoutIcon from "@mui/icons-material/Logout";
import { useRouter } from "next/navigation";

function Header() {
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pages = [
    {
      url: "/report",
      title: "Report",
      icon: <ReportIcon />,
    },
    {
      url: "/",
      title: "Expense",
      icon: <ReportIcon />,
      // isVisible: session ? true : false,
    },
    {
      url: "/income",
      title: "Income",
      icon: <ReportIcon />,
      // isVisible: session ? true : false,
    },
    {
      url: "/category",
      title: "Category",
      icon: <ReportIcon />,
      // isVisible: session ? true : false,
    },
    {
      url: "/settings",
      title: "Settings",
      icon: <SettingsIcon />,
    },
  ];

  //   useEffect(() => {
  //     const savedTheme = localStorage.getItem("darkMode");
  //     if (savedTheme) setDarkMode(savedTheme === "true");
  //   }, []);

  //   useEffect(() => {
  //     localStorage.setItem("darkMode", darkMode);
  //   }, [darkMode]);

  const handleLogout = () => {
    localStorage.clear(); // or remove token only
    router.push("/login");
  };

  return (
    <>
      <Stack justifyContent={"center"} alignItems={"center"}>
        <IconButton size="small" onClick={() => setDrawerOpen(true)}>
          <MenuIcon />
        </IconButton>
      </Stack>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 260 }}>
          <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ bgcolor: "primary.main" }}>U</Avatar>
            <Box>
              <Typography fontWeight={600}>User Name</Typography>
              <Typography variant="caption" color="text.secondary">
                user@email.com
              </Typography>
            </Box>
          </Box>

          <Divider />

          <List>
            {pages.map((page) => (
              <ListItemButton
                key={page.url}
                onClick={() => {
                  setDrawerOpen(false);
                  router.push(page.url);
                }}
              >
                <ListItemIcon>{page.icon}</ListItemIcon>
                <ListItemText primary={page.title} />
              </ListItemButton>
            ))}

            <ListItemButton>
              <ListItemIcon>
                <Brightness4Icon />
              </ListItemIcon>
              <ListItemText primary="Dark Mode" />
              <Switch
                edge="end"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
            </ListItemButton>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon color="error" />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ color: "error" }}
              />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
export default Header;
