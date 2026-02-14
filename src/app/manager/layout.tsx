"use client";

import { useRouter, usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import HistoryOutlined from "@mui/icons-material/HistoryOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import Logout from "@mui/icons-material/Logout";
import { useM3Tokens } from "@/hooks/useM3Tokens";
import { ThemeModeToggle } from "@/components/shared/ThemeModeToggle";
import { useSession } from "@/hooks/useSession";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  const m3Tokens = useM3Tokens();

  // Use session hook with role requirement
  const { session, isLoading, logout } = useSession({
    requiredRoles: ["manager", "supervisor"],
    roleFailRedirect: "/dashboard",
  });

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100dvh",
          backgroundColor: m3Tokens.colors.surface.main,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const navItems = [
    { href: "/manager", icon: AssignmentOutlined, label: "Pending" },
    { href: "/manager/history", icon: HistoryOutlined, label: "History" },
    { href: "/manager/workers", icon: PeopleOutlined, label: "Workers" },
  ];

  const getNavValue = () => {
    if (pathname === "/manager") return 0;
    if (pathname.startsWith("/manager/history")) return 1;
    if (pathname.startsWith("/manager/workers")) return 2;
    return 0;
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        backgroundColor: m3Tokens.colors.surface.main,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${m3Tokens.colors.outline.variant}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: m3Tokens.colors.primary.main,
              fontSize: "0.875rem",
              fontWeight: "bold",
            }}
          >
            R
          </Avatar>
          <Typography variant="subtitle1" fontWeight={700}>
            ROME
          </Typography>
          <Chip
            label="Manager"
            size="small"
            sx={{
              bgcolor: `${m3Tokens.colors.primary.main}20`,
              color: m3Tokens.colors.primary.main,
              fontWeight: 500,
              fontSize: "0.625rem",
            }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            {session?.workerName}
          </Typography>
          <ThemeModeToggle />
          <IconButton
            onClick={logout}
            size="small"
            sx={{ color: m3Tokens.colors.onSurface.variant }}
          >
            <Logout fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          overflow: "auto",
          pb: 10,
        }}
      >
        {children}
      </Box>

      {/* Bottom Navigation */}
      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
        elevation={8}
      >
        <BottomNavigation
          value={getNavValue()}
          onChange={(_, newValue) => {
            router.push(navItems[newValue].href);
          }}
          sx={{
            backgroundColor: m3Tokens.colors.surface.container,
            borderTop: `1px solid ${m3Tokens.colors.outline.variant}`,
            "& .MuiBottomNavigationAction-root": {
              color: m3Tokens.colors.onSurface.variant,
              minWidth: 80,
              "&.Mui-selected": {
                color: m3Tokens.colors.primary.main,
              },
            },
          }}
        >
          {navItems.map((item) => (
            <BottomNavigationAction
              key={item.href}
              label={item.label}
              icon={<item.icon />}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
