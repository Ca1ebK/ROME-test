"use client";

import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
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
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import FingerprintOutlined from "@mui/icons-material/FingerprintOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import AddOutlined from "@mui/icons-material/AddOutlined";
import PhoneIphoneOutlined from "@mui/icons-material/PhoneIphoneOutlined";
import LaptopOutlined from "@mui/icons-material/LaptopOutlined";
import Close from "@mui/icons-material/Close";
import { usePasskey } from "@/hooks/usePasskey";
import { m3Tokens } from "@/theme";
import { toast } from "sonner";

interface PasskeyInfo {
  id: string;
  credential_id: string;
  device_name: string | null;
  last_used_at: string | null;
  created_at: string;
}

interface PasskeyManagementProps {
  open: boolean;
  onClose: () => void;
  workerId: string;
  userName: string;
  userEmail: string;
}

export function PasskeyManagement({
  open,
  onClose,
  workerId,
  userName,
  userEmail,
}: PasskeyManagementProps) {
  const { isSupported, isLoading, error, register, getPasskeys, deletePasskey, clearError } = usePasskey();
  const [passkeys, setPasskeys] = useState<PasskeyInfo[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load passkeys
  const loadPasskeys = useCallback(async () => {
    setIsLoadingList(true);
    const list = await getPasskeys(workerId);
    setPasskeys(list);
    setIsLoadingList(false);
  }, [workerId, getPasskeys]);

  useEffect(() => {
    if (open) {
      loadPasskeys();
      clearError();
    }
  }, [open, loadPasskeys, clearError]);

  const handleRegister = async () => {
    const success = await register(workerId, userName, userEmail, deviceName || undefined);
    if (success) {
      toast.success("Passkey registered successfully!");
      setShowRegister(false);
      setDeviceName("");
      loadPasskeys();
    }
  };

  const handleDelete = async (credentialId: string) => {
    const success = await deletePasskey(workerId, credentialId);
    if (success) {
      toast.success("Passkey removed");
      setDeleteConfirm(null);
      loadPasskeys();
    } else {
      toast.error("Failed to remove passkey");
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never used";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDeviceIcon = (name: string | null) => {
    const lower = (name || "").toLowerCase();
    if (lower.includes("iphone") || lower.includes("android") || lower.includes("phone")) {
      return <PhoneIphoneOutlined />;
    }
    return <LaptopOutlined />;
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FingerprintOutlined sx={{ color: m3Tokens.colors.primary.main }} />
              <Typography variant="h6">Passkeys</Typography>
            </Box>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {!isSupported && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Passkeys are not supported on this browser or device.
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
              {error}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Passkeys let you sign in quickly using your fingerprint, face, or device PIN instead of
            email verification codes.
          </Typography>

          {isLoadingList ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : passkeys.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                px: 2,
                backgroundColor: m3Tokens.colors.surface.containerLow,
                borderRadius: m3Tokens.shape.medium,
              }}
            >
              <FingerprintOutlined
                sx={{ fontSize: 48, color: m3Tokens.colors.onSurface.variant, mb: 1 }}
              />
              <Typography variant="body1" color="text.secondary">
                No passkeys registered
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Add a passkey for faster login
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {passkeys.map((passkey, index) => (
                <Box key={passkey.id}>
                  <ListItem
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => setDeleteConfirm(passkey.credential_id)}
                        sx={{ color: m3Tokens.colors.error.main }}
                      >
                        <DeleteOutline />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>{getDeviceIcon(passkey.device_name)}</ListItemIcon>
                    <ListItemText
                      primary={passkey.device_name || "Unknown Device"}
                      secondary={`Last used: ${formatDate(passkey.last_used_at)} • Added: ${formatDate(passkey.created_at)}`}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                  {index < passkeys.length - 1 && <Divider component="li" />}
                </Box>
              ))}
            </List>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <AddOutlined />}
            onClick={() => setShowRegister(true)}
            disabled={!isSupported || isLoading}
            fullWidth
          >
            Register New Passkey
          </Button>
        </DialogActions>
      </Dialog>

      {/* Register Passkey Dialog */}
      <Dialog open={showRegister} onClose={() => setShowRegister(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Register Passkey</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Give this passkey a name to help you identify it later.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Device Name (optional)"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="e.g., My iPhone, Work Laptop"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRegister(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRegister}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : null}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Remove Passkey?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            You won&apos;t be able to use this passkey to sign in anymore. You can always register
            it again later.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
