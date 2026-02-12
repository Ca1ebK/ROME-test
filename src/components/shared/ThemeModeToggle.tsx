"use client";

import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import SettingsBrightnessOutlined from "@mui/icons-material/SettingsBrightnessOutlined";
import Check from "@mui/icons-material/Check";
import { useThemeMode, type ThemeModeSetting } from "@/theme";

const modeOptions: { value: ThemeModeSetting; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Light", icon: <LightModeOutlined fontSize="small" /> },
  { value: "dark", label: "Dark", icon: <DarkModeOutlined fontSize="small" /> },
  { value: "system", label: "System", icon: <SettingsBrightnessOutlined fontSize="small" /> },
];

interface ThemeModeToggleProps {
  /** Icon button size */
  size?: "small" | "medium";
  /** Custom sx for the icon button */
  sx?: Record<string, unknown>;
}

export function ThemeModeToggle({ size = "small", sx }: ThemeModeToggleProps) {
  const { modeSetting, setModeSetting } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const currentIcon =
    modeSetting === "light" ? (
      <LightModeOutlined fontSize={size} />
    ) : modeSetting === "dark" ? (
      <DarkModeOutlined fontSize={size} />
    ) : (
      <SettingsBrightnessOutlined fontSize={size} />
    );

  const currentLabel =
    modeSetting === "light" ? "Light" : modeSetting === "dark" ? "Dark" : "System";

  return (
    <>
      <Tooltip title={`Theme: ${currentLabel}`}>
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          size={size}
          aria-label="Toggle theme"
          sx={sx}
        >
          {currentIcon}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            sx: { minWidth: 160, mt: 0.5 },
          },
        }}
      >
        {modeOptions.map((option) => (
          <MenuItem
            key={option.value}
            selected={modeSetting === option.value}
            onClick={() => {
              setModeSetting(option.value);
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>{option.icon}</ListItemIcon>
            <ListItemText>{option.label}</ListItemText>
            {modeSetting === option.value && (
              <Check fontSize="small" sx={{ ml: 1, color: "primary.main" }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
