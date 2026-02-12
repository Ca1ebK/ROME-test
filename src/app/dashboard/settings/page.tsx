"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Switch from "@mui/material/Switch";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import MailOutlined from "@mui/icons-material/MailOutlined";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import NotificationsOutlined from "@mui/icons-material/NotificationsOutlined";
import FingerprintOutlined from "@mui/icons-material/FingerprintOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import SettingsBrightnessOutlined from "@mui/icons-material/SettingsBrightnessOutlined";
import Logout from "@mui/icons-material/Logout";
import Close from "@mui/icons-material/Close";
import {
  getWorkerProfile,
  updateWorkerEmail,
  updateWorkerPhone,
  updateNotificationPreference,
  type WorkerProfile,
} from "@/lib/supabase";
import { PasskeyManagement } from "@/components";
import { usePasskey } from "@/hooks/usePasskey";
import { useM3Tokens } from "@/hooks/useM3Tokens";
import { useThemeMode, type ThemeModeSetting } from "@/theme";

interface Session {
  workerId: string;
  workerName: string;
  email: string;
  role: string;
}

type ModalType = "email" | "phone" | null;

export default function SettingsPage() {
  const router = useRouter();
  const { isSupported: passkeysSupported, getPasskeys } = usePasskey();
  const m3Tokens = useM3Tokens();
  const { modeSetting, setModeSetting } = useThemeMode();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modal state
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalValue, setModalValue] = useState("");

  // Passkey state
  const [showPasskeyDialog, setShowPasskeyDialog] = useState(false);
  const [passkeyCount, setPasskeyCount] = useState(0);

  const loadPasskeyCount = useCallback(async (workerId: string) => {
    const passkeys = await getPasskeys(workerId);
    setPasskeyCount(passkeys.length);
  }, [getPasskeys]);

  const loadProfile = useCallback(async (workerId: string) => {
    const result = await getWorkerProfile(workerId);
    if (result.success && result.profile) {
      setProfile(result.profile);
      setEmailNotifications(result.profile.email_notifications_enabled);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("rome_session");
    if (stored) {
      const sessionData = JSON.parse(stored) as Session;
      setSession(sessionData);
      loadProfile(sessionData.workerId);
      loadPasskeyCount(sessionData.workerId);
    } else {
      router.push("/login");
    }
  }, [loadProfile, loadPasskeyCount, router]);

  const handleLogout = () => {
    localStorage.removeItem("rome_session");
    router.push("/login");
  };

  const maskPin = () => {
    return "●●●●●●";
  };

  const openModal = (type: ModalType) => {
    if (type === "email") {
      setModalValue(profile?.email || "");
    } else if (type === "phone") {
      setModalValue(profile?.phone || "");
    }
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
    setModalValue("");
  };

  const handleSaveEmail = async () => {
    if (!session) return;
    setIsSaving(true);

    const result = await updateWorkerEmail(session.workerId, modalValue);

    if (result.success) {
      toast.success("Email updated successfully");
      setProfile((prev) => (prev ? { ...prev, email: modalValue } : prev));
      const updatedSession = { ...session, email: modalValue };
      localStorage.setItem("rome_session", JSON.stringify(updatedSession));
      setSession(updatedSession);
      closeModal();
    } else {
      toast.error(result.error || "Failed to update email");
    }

    setIsSaving(false);
  };

  const handleSavePhone = async () => {
    if (!session) return;
    setIsSaving(true);

    const result = await updateWorkerPhone(session.workerId, modalValue);

    if (result.success) {
      toast.success("Phone updated successfully");
      setProfile((prev) => (prev ? { ...prev, phone: modalValue || null } : prev));
      closeModal();
    } else {
      toast.error(result.error || "Failed to update phone");
    }

    setIsSaving(false);
  };

  const handleToggleNotifications = async () => {
    if (!session) return;

    const newValue = !emailNotifications;
    setEmailNotifications(newValue);

    const result = await updateNotificationPreference(session.workerId, newValue);

    if (result.success) {
      toast.success(newValue ? "Notifications enabled" : "Notifications disabled");
    } else {
      setEmailNotifications(!newValue);
      toast.error("Failed to update notification preference");
    }
  };

  if (isLoading || !session) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 256 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Profile Card */}
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: `${m3Tokens.colors.primary.main}20`,
                }}
              >
                <PersonOutlined sx={{ fontSize: 32, color: m3Tokens.colors.primary.main }} />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {session.workerName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                  {profile?.role || "Worker"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  PIN: {maskPin()}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Account Section */}
        <Box>
          <Typography
            variant="overline"
            sx={{ color: m3Tokens.colors.onSurface.variant, letterSpacing: 1, mb: 1.5, display: "block" }}
          >
            Account
          </Typography>
          <Card>
            <List disablePadding>
              <ListItem
                secondaryAction={
                  <Button variant="text" size="small" onClick={() => openModal("email")}>
                    Edit
                  </Button>
                }
              >
                <ListItemIcon>
                  <MailOutlined sx={{ color: m3Tokens.colors.onSurface.variant }} />
                </ListItemIcon>
                <ListItemText
                  primary="Email"
                  secondary={profile?.email || session.email}
                  primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                  secondaryTypographyProps={{ variant: "body1" }}
                />
              </ListItem>
              <Divider component="li" />
              <ListItem
                secondaryAction={
                  <Button variant="text" size="small" onClick={() => openModal("phone")}>
                    {profile?.phone ? "Edit" : "Add"}
                  </Button>
                }
              >
                <ListItemIcon>
                  <PhoneOutlined sx={{ color: m3Tokens.colors.onSurface.variant }} />
                </ListItemIcon>
                <ListItemText
                  primary="Phone"
                  secondary={profile?.phone || "Not set"}
                  primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                  secondaryTypographyProps={{
                    variant: "body1",
                    color: profile?.phone ? "text.primary" : "text.secondary",
                  }}
                />
              </ListItem>
            </List>
          </Card>
        </Box>

        {/* Notifications Section */}
        <Box>
          <Typography
            variant="overline"
            sx={{ color: m3Tokens.colors.onSurface.variant, letterSpacing: 1, mb: 1.5, display: "block" }}
          >
            Notifications
          </Typography>
          <Card>
            <ListItem
              secondaryAction={
                <Switch
                  checked={emailNotifications}
                  onChange={handleToggleNotifications}
                  color="primary"
                />
              }
            >
              <ListItemIcon>
                <NotificationsOutlined sx={{ color: m3Tokens.colors.onSurface.variant }} />
              </ListItemIcon>
              <ListItemText
                primary="Email notifications"
                secondary="Time off updates, schedule changes"
                primaryTypographyProps={{ variant: "body1" }}
                secondaryTypographyProps={{ variant: "caption" }}
              />
            </ListItem>
          </Card>
        </Box>

        {/* Appearance Section */}
        <Box>
          <Typography
            variant="overline"
            sx={{ color: m3Tokens.colors.onSurface.variant, letterSpacing: 1, mb: 1.5, display: "block" }}
          >
            Appearance
          </Typography>
          <Card>
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <SettingsBrightnessOutlined sx={{ color: m3Tokens.colors.onSurface.variant }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1">Theme</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Choose light, dark, or match your system
                  </Typography>
                </Box>
              </Box>
              <ToggleButtonGroup
                value={modeSetting}
                exclusive
                onChange={(_, value: ThemeModeSetting | null) => {
                  if (value) setModeSetting(value);
                }}
                fullWidth
                size="small"
                sx={{
                  backgroundColor: m3Tokens.colors.surface.containerHigh,
                }}
              >
                <ToggleButton value="light" aria-label="Light mode">
                  <LightModeOutlined sx={{ mr: 0.75, fontSize: 18 }} />
                  Light
                </ToggleButton>
                <ToggleButton value="system" aria-label="System default">
                  <SettingsBrightnessOutlined sx={{ mr: 0.75, fontSize: 18 }} />
                  System
                </ToggleButton>
                <ToggleButton value="dark" aria-label="Dark mode">
                  <DarkModeOutlined sx={{ mr: 0.75, fontSize: 18 }} />
                  Dark
                </ToggleButton>
              </ToggleButtonGroup>
            </CardContent>
          </Card>
        </Box>

        {/* Security Section */}
        {passkeysSupported && (
          <Box>
            <Typography
              variant="overline"
              sx={{ color: m3Tokens.colors.onSurface.variant, letterSpacing: 1, mb: 1.5, display: "block" }}
            >
              Security
            </Typography>
            <Card>
              <ListItem
                secondaryAction={
                  <Button variant="text" size="small" onClick={() => setShowPasskeyDialog(true)}>
                    Manage
                  </Button>
                }
              >
                <ListItemIcon>
                  <FingerprintOutlined sx={{ color: m3Tokens.colors.onSurface.variant }} />
                </ListItemIcon>
                <ListItemText
                  primary="Passkeys"
                  secondary={passkeyCount === 0 ? "Enable quick login with biometrics" : `${passkeyCount} registered`}
                  primaryTypographyProps={{ variant: "body1" }}
                  secondaryTypographyProps={{ variant: "caption" }}
                />
              </ListItem>
            </Card>
          </Box>
        )}

        {/* Logout */}
        <Button
          variant="outlined"
          color="error"
          onClick={handleLogout}
          startIcon={<Logout />}
          sx={{
            py: 1.5,
            borderColor: m3Tokens.colors.error.main,
            color: m3Tokens.colors.error.main,
            "&:hover": {
              borderColor: m3Tokens.colors.error.dark,
              backgroundColor: `${m3Tokens.colors.error.main}10`,
            },
          }}
        >
          Log Out
        </Button>

        {/* App Info */}
        <Box sx={{ textAlign: "center", pt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            ROME v1.0.0 • Scholastic Warehouse
          </Typography>
        </Box>
      </Box>

      {/* Edit Email Dialog */}
      <Dialog open={modalType === "email"} onClose={closeModal} maxWidth="xs" fullWidth>
        <DialogTitle>
          Edit Email
          <IconButton
            onClick={closeModal}
            sx={{ position: "absolute", right: 8, top: 8, color: m3Tokens.colors.onSurface.variant }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            type="email"
            label="Email Address"
            value={modalValue}
            onChange={(e) => setModalValue(e.target.value)}
            placeholder="you@example.com"
            sx={{ mt: 1 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            You may need to verify your new email address
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button
            onClick={handleSaveEmail}
            disabled={isSaving || !modalValue}
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Phone Dialog */}
      <Dialog open={modalType === "phone"} onClose={closeModal} maxWidth="xs" fullWidth>
        <DialogTitle>
          {profile?.phone ? "Edit Phone" : "Add Phone"}
          <IconButton
            onClick={closeModal}
            sx={{ position: "absolute", right: 8, top: 8, color: m3Tokens.colors.onSurface.variant }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            type="tel"
            label="Phone Number"
            value={modalValue}
            onChange={(e) => setModalValue(e.target.value)}
            placeholder="(555) 123-4567"
            sx={{ mt: 1 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            Used for urgent notifications only
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button
            onClick={handleSavePhone}
            disabled={isSaving}
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Passkey Management Dialog */}
      {session && (
        <PasskeyManagement
          open={showPasskeyDialog}
          onClose={() => {
            setShowPasskeyDialog(false);
            loadPasskeyCount(session.workerId);
          }}
          workerId={session.workerId}
          userName={session.workerName}
          userEmail={session.email}
        />
      )}
    </>
  );
}
