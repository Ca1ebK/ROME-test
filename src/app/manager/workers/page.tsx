"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import Fab from "@mui/material/Fab";
import PersonAddOutlined from "@mui/icons-material/PersonAddOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import Close from "@mui/icons-material/Close";
import Check from "@mui/icons-material/Check";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import BadgeOutlined from "@mui/icons-material/BadgeOutlined";
import { useTheme } from "@mui/material/styles";
import {
  getWorkers,
  createWorker,
  type WorkerListItem,
} from "@/lib/supabase";
import { useM3Tokens } from "@/hooks/useM3Tokens";

type RoleFilter = "all" | "worker" | "supervisor" | "manager";

export default function WorkersPage() {
  const m3Tokens = useM3Tokens();
  const theme = useTheme();

  const [workers, setWorkers] = useState<WorkerListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  // Add worker dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newRole, setNewRole] = useState("worker");
  const [newEmail, setNewEmail] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const loadWorkers = useCallback(async () => {
    setIsLoading(true);
    const result = await getWorkers();
    if (result.success) {
      setWorkers(result.workers);
    } else {
      toast.error(result.error || "Failed to load workers");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadWorkers();
  }, [loadWorkers]);

  // Filter workers
  const filteredWorkers = workers.filter((w) => {
    const matchesSearch =
      !search ||
      w.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (w.email && w.email.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === "all" || w.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Role counts
  const roleCounts = {
    all: workers.length,
    worker: workers.filter((w) => w.role === "worker").length,
    supervisor: workers.filter((w) => w.role === "supervisor").length,
    manager: workers.filter((w) => w.role === "manager").length,
  };

  // Reset add dialog
  const resetAddDialog = () => {
    setNewName("");
    setNewPin("");
    setNewRole("worker");
    setNewEmail("");
    setAddError(null);
    setIsAdding(false);
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    resetAddDialog();
  };

  const handlePinChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setNewPin(digits);
    setAddError(null);
  };

  const handleAddWorker = async () => {
    // Validate
    if (!newName.trim()) {
      setAddError("Name is required.");
      return;
    }
    if (newPin.length !== 6) {
      setAddError("PIN must be exactly 6 digits.");
      return;
    }

    setIsAdding(true);
    setAddError(null);

    const result = await createWorker(newPin, newName.trim(), newRole);

    if (result.success) {
      toast.success("Worker created!", {
        description: `${newName.trim()} has been added.`,
      });
      handleCloseDialog();
      loadWorkers(); // Refresh the list
    } else {
      setAddError(result.error || "Failed to create worker.");
    }

    setIsAdding(false);
  };

  const isAddValid = newName.trim().length > 0 && newPin.length === 6;

  // Get initials for avatar
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || "?";
  };

  // Role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case "manager":
        return { bg: `${m3Tokens.colors.primary.main}18`, text: m3Tokens.colors.primary.main };
      case "supervisor":
        return { bg: `${m3Tokens.colors.warning.main}18`, text: m3Tokens.colors.warning.main };
      default:
        return { bg: m3Tokens.colors.surface.containerHighest, text: m3Tokens.colors.onSurface.variant };
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 256 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Workers
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {workers.length} {workers.length === 1 ? "member" : "members"}
            </Typography>
          </Box>
        </Box>

        {/* Search */}
        <TextField
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
                </InputAdornment>
              ),
              ...(search && {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch("")}>
                      <Close sx={{ fontSize: 18 }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }),
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 9999,
              backgroundColor: m3Tokens.colors.surface.container,
            },
          }}
        />

        {/* Role filter */}
        <ToggleButtonGroup
          value={roleFilter}
          exclusive
          onChange={(_, val: RoleFilter | null) => val && setRoleFilter(val)}
          size="small"
          sx={{ alignSelf: "flex-start" }}
        >
          <ToggleButton value="all">
            All ({roleCounts.all})
          </ToggleButton>
          <ToggleButton value="worker">
            Workers ({roleCounts.worker})
          </ToggleButton>
          <ToggleButton value="supervisor">
            Supervisors ({roleCounts.supervisor})
          </ToggleButton>
          {roleCounts.manager > 0 && (
            <ToggleButton value="manager">
              Managers ({roleCounts.manager})
            </ToggleButton>
          )}
        </ToggleButtonGroup>

        {/* Worker list */}
        {filteredWorkers.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              px: 2,
            }}
          >
            <Avatar
              sx={{
                width: 64,
                height: 64,
                mx: "auto",
                mb: 2,
                bgcolor: `${m3Tokens.colors.onSurface.variant}14`,
              }}
            >
              <PersonOutlined sx={{ fontSize: 32, color: m3Tokens.colors.onSurface.variant }} />
            </Avatar>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {search || roleFilter !== "all" ? "No matches found" : "No workers yet"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {search || roleFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Add your first worker to get started."}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {filteredWorkers.map((worker) => {
              const roleColor = getRoleColor(worker.role);
              return (
                <Card key={worker.id} sx={{ overflow: "visible" }}>
                  <CardContent sx={{ py: 2, px: 2, "&:last-child": { pb: 2 } }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 44,
                          height: 44,
                          bgcolor: `${m3Tokens.colors.primary.main}16`,
                          color: m3Tokens.colors.primary.main,
                          fontSize: "0.875rem",
                          fontWeight: 600,
                        }}
                      >
                        {getInitials(worker.full_name)}
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography
                            variant="body1"
                            fontWeight={600}
                            noWrap
                            sx={{ flex: 1 }}
                          >
                            {worker.full_name}
                          </Typography>
                          <Chip
                            label={worker.role}
                            size="small"
                            sx={{
                              bgcolor: roleColor.bg,
                              color: roleColor.text,
                              fontWeight: 600,
                              fontSize: "0.6875rem",
                              textTransform: "capitalize",
                              height: 24,
                            }}
                          />
                        </Box>
                        {worker.email && (
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {worker.email}
                          </Typography>
                        )}
                        {!worker.is_active && (
                          <Chip
                            label="Inactive"
                            size="small"
                            sx={{
                              mt: 0.5,
                              height: 20,
                              fontSize: "0.625rem",
                              bgcolor: `${m3Tokens.colors.error.main}14`,
                              color: m3Tokens.colors.error.main,
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Floating Add Button */}
      <Fab
        color="primary"
        aria-label="Add worker"
        onClick={() => setShowAddDialog(true)}
        sx={{
          position: "fixed",
          bottom: 80,
          right: 20,
          zIndex: 999,
          width: 56,
          height: 56,
          backgroundColor: theme.palette.mode === "light"
            ? m3Tokens.colors.primary.dark
            : m3Tokens.colors.primary.main,
          color: "#fff",
          "&:hover": {
            backgroundColor: theme.palette.mode === "light"
              ? m3Tokens.colors.primary.main
              : m3Tokens.colors.primary.light,
          },
        }}
      >
        <PersonAddOutlined />
      </Fab>

      {/* Add Worker Dialog */}
      <Dialog
        open={showAddDialog}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: `${m3Tokens.colors.primary.main}16`,
            }}
          >
            <PersonAddOutlined sx={{ color: m3Tokens.colors.primary.main, fontSize: 22 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Add New Worker
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Create a new account with a 6-digit PIN
            </Typography>
          </Box>
          <IconButton
            onClick={handleCloseDialog}
            size="small"
            sx={{ color: m3Tokens.colors.onSurface.variant }}
          >
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2 }}>
          {/* Full Name */}
          <TextField
            label="Full Name"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setAddError(null);
            }}
            placeholder="e.g. Jane Doe"
            disabled={isAdding}
            fullWidth
            autoFocus
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* 6-Digit PIN */}
          <TextField
            label="6-Digit PIN"
            value={newPin}
            onChange={(e) => handlePinChange(e.target.value)}
            placeholder="000000"
            disabled={isAdding}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
              htmlInput: {
                inputMode: "numeric",
                style: {
                  fontFamily: "monospace",
                  letterSpacing: "0.4em",
                  fontSize: "1.125rem",
                },
              },
            }}
            helperText="Used for kiosk clock in/out"
          />

          {/* Email (optional) */}
          <TextField
            label="Email (optional)"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="jane.doe@example.com"
            disabled={isAdding}
            fullWidth
            type="email"
          />

          {/* Role */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
              Role
            </Typography>
            <ToggleButtonGroup
              value={newRole}
              exclusive
              onChange={(_, val) => val && setNewRole(val)}
              disabled={isAdding}
              fullWidth
            >
              <ToggleButton value="worker">Worker</ToggleButton>
              <ToggleButton value="supervisor">Supervisor</ToggleButton>
              <ToggleButton value="manager">Manager</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Error */}
          {addError && <Alert severity="error">{addError}</Alert>}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={handleCloseDialog}
            disabled={isAdding}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddWorker}
            disabled={!isAddValid || isAdding}
            startIcon={
              isAdding ? <CircularProgress size={18} color="inherit" /> : <Check />
            }
          >
            {isAdding ? "Creating..." : "Add Worker"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
