"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import Link from "@mui/material/Link";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBack from "@mui/icons-material/ArrowBack";
import MailOutline from "@mui/icons-material/MailOutline";
import FingerprintOutlined from "@mui/icons-material/FingerprintOutlined";
import { NumericKeypad, ThemeModeToggle } from "@/components";
import { usePasskey } from "@/hooks/usePasskey";
import {
  authenticateWorkerForDashboard,
  sendVerificationCode,
  verifyCode,
} from "@/lib/supabase";
import { useM3Tokens } from "@/hooks/useM3Tokens";

type LoginStep = "pin" | "auth-choice" | "passkey" | "verify";

interface WorkerData {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export default function LoginPage() {
  const router = useRouter();
  const m3Tokens = useM3Tokens();
  const { isSupported: passkeysSupported, isLoading: isPasskeyLoading, error: passkeyError, register, authenticate, hasPasskeys, clearError } = usePasskey();

  // Step state
  const [step, setStep] = useState<LoginStep>("pin");

  // PIN state
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [isPinLoading, setIsPinLoading] = useState(false);

  // Verification state
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Worker data
  const [worker, setWorker] = useState<WorkerData | null>(null);

  // Passkey state
  const [workerHasPasskeys, setWorkerHasPasskeys] = useState(false);
  const [showPasskeyPrompt, setShowPasskeyPrompt] = useState(false);

  // Auto-submit ref for verification
  const hasAutoSubmittedVerify = useRef(false);

  // Mask email for display
  const maskEmail = (email: string) => {
    const [local, domain] = email.split("@");
    if (!domain) return email;
    const maskedLocal = local[0] + "●".repeat(Math.min(local.length - 1, 4));
    return `${maskedLocal}@${domain}`;
  };

  // Handle PIN submission
  const handlePinSubmit = useCallback(async () => {
    if (pin.length !== 6) return;

    setIsPinLoading(true);
    setPinError(null);

    try {
      const result = await authenticateWorkerForDashboard(pin);

      if (!result.success || !result.worker) {
        setPinError(result.error || "Invalid PIN");
        setPin("");
        return;
      }

      const workerData = {
        id: result.worker.id,
        full_name: result.worker.full_name,
        email: result.worker.email || "",
        role: result.worker.role || "worker",
      };
      setWorker(workerData);

      // Check if user has passkeys registered
      const userHasPasskeys = passkeysSupported && await hasPasskeys(workerData.id);
      setWorkerHasPasskeys(userHasPasskeys);

      setPin("");

      // If user has passkeys and device supports them, show choice
      if (userHasPasskeys) {
        setStep("auth-choice");
      } else {
        // Otherwise, go directly to email verification
        const sendResult = await sendVerificationCode(
          workerData.id,
          workerData.email,
          workerData.full_name
        );

        if (!sendResult.success) {
          setPinError(sendResult.error || "Failed to send code");
          return;
        }

        setStep("verify");
        setResendCooldown(60);

        toast.success("Code sent!", {
          description: `Check your email for the verification code.`,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setPinError("Unable to connect. Please try again.");
    } finally {
      setIsPinLoading(false);
    }
  }, [pin, passkeysSupported, hasPasskeys]);

  // Handle passkey authentication
  const handlePasskeyAuth = useCallback(async () => {
    if (!worker) return;

    clearError();
    const success = await authenticate(worker.id);

    if (success) {
      // Store session and redirect
      localStorage.setItem(
        "rome_session",
        JSON.stringify({
          workerId: worker.id,
          workerName: worker.full_name,
          email: worker.email,
          role: worker.role,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        })
      );

      toast.success("Welcome!", {
        description: `Logged in as ${worker.full_name}`,
      });

      if (worker.role === "manager" || worker.role === "supervisor") {
        router.push("/manager");
      } else {
        router.push("/dashboard");
      }
    }
  }, [worker, authenticate, clearError, router]);

  // Handle choosing email verification from auth choice screen
  const handleChooseEmailVerification = useCallback(async () => {
    if (!worker) return;

    setIsPinLoading(true);

    const sendResult = await sendVerificationCode(
      worker.id,
      worker.email,
      worker.full_name
    );

    setIsPinLoading(false);

    if (!sendResult.success) {
      toast.error(sendResult.error || "Failed to send code");
      return;
    }

    setStep("verify");
    setResendCooldown(60);

    toast.success("Code sent!", {
      description: `Check your email for the verification code.`,
    });
  }, [worker]);

  // Complete login (called after successful verification)
  const completeLogin = useCallback((workerData: WorkerData) => {
    // Store session in localStorage
    localStorage.setItem(
      "rome_session",
      JSON.stringify({
        workerId: workerData.id,
        workerName: workerData.full_name,
        email: workerData.email,
        role: workerData.role,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      })
    );

    toast.success("Welcome!", {
      description: `Logged in as ${workerData.full_name}`,
    });

    // Redirect based on role
    if (workerData.role === "manager" || workerData.role === "supervisor") {
      router.push("/manager");
    } else {
      router.push("/dashboard");
    }
  }, [router]);

  // Handle verification code submission
  const handleVerifySubmit = useCallback(async () => {
    if (verificationCode.length !== 6 || !worker) return;

    setIsVerifyLoading(true);
    setVerifyError(null);

    try {
      const result = await verifyCode(worker.id, verificationCode);

      if (!result.success) {
        setVerifyError(result.error || "Invalid code");
        setVerificationCode("");
        hasAutoSubmittedVerify.current = false;
        return;
      }

      // If passkeys are supported and user doesn't have any, offer to register
      if (passkeysSupported && !workerHasPasskeys) {
        setShowPasskeyPrompt(true);
      } else {
        completeLogin(worker);
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerifyError("Unable to verify. Please try again.");
      hasAutoSubmittedVerify.current = false;
    } finally {
      setIsVerifyLoading(false);
    }
  }, [verificationCode, worker, passkeysSupported, workerHasPasskeys, completeLogin]);

  // Handle passkey registration from prompt
  const handleRegisterPasskey = useCallback(async () => {
    if (!worker) return;

    const success = await register(worker.id, worker.full_name, worker.email);

    if (success) {
      toast.success("Passkey registered! You can use it to log in faster next time.");
    }

    completeLogin(worker);
  }, [worker, register, completeLogin]);

  // Skip passkey registration
  const handleSkipPasskey = useCallback(() => {
    if (worker) {
      completeLogin(worker);
    }
  }, [worker, completeLogin]);

  // Handle resend code
  const handleResendCode = useCallback(async () => {
    if (resendCooldown > 0 || !worker) return;

    try {
      const result = await sendVerificationCode(
        worker.id,
        worker.email,
        worker.full_name
      );

      if (result.success) {
        setResendCooldown(60);
        toast.success("Code resent!");
      } else {
        toast.error(result.error || "Failed to resend");
      }
    } catch {
      toast.error("Failed to resend code");
    }
  }, [worker, resendCooldown]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto-submit verification code
  useEffect(() => {
    if (
      verificationCode.length === 6 &&
      !isVerifyLoading &&
      !hasAutoSubmittedVerify.current
    ) {
      hasAutoSubmittedVerify.current = true;
      handleVerifySubmit();
    }
    if (verificationCode.length < 6) {
      hasAutoSubmittedVerify.current = false;
    }
  }, [verificationCode, isVerifyLoading, handleVerifySubmit]);

  // Back to previous step
  const handleBack = () => {
    if (step === "verify" && workerHasPasskeys) {
      // Go back to auth choice
      setStep("auth-choice");
      setVerificationCode("");
      setVerifyError(null);
    } else if (step === "auth-choice") {
      // Go back to PIN
      setStep("pin");
      setWorker(null);
      setWorkerHasPasskeys(false);
    } else {
      // Default: go back to PIN
      setStep("pin");
      setVerificationCode("");
      setVerifyError(null);
      setWorker(null);
      setWorkerHasPasskeys(false);
    }
    clearError();
  };

  return (
    <Box
      component="main"
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
          py: 2,
          px: 2,
          borderBottom: `1px solid ${m3Tokens.colors.outline.variant}`,
        }}
      >
        {/* Spacer for symmetry */}
        <Box sx={{ width: 32 }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: m3Tokens.colors.primary.main,
              fontWeight: "bold",
              fontSize: "1.25rem",
            }}
          >
            R
          </Avatar>
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, lineHeight: 1.2 }}
            >
              ROME
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: m3Tokens.colors.onSurface.variant,
                letterSpacing: 1,
              }}
            >
              WORKER LOGIN
            </Typography>
          </Box>
        </Box>

        {/* Theme toggle */}
        <ThemeModeToggle
          size="small"
          sx={{ color: m3Tokens.colors.onSurface.variant }}
        />
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          py: 4,
          px: 2,
          mb: 4,
        }}
      >
        {step === "pin" && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            <NumericKeypad
              value={pin}
              onChange={setPin}
              onSubmit={handlePinSubmit}
              maxLength={6}
              isLoading={isPinLoading}
              error={pinError}
            />

            {/* Link to kiosk */}
            <Typography variant="body2" color="text.secondary">
              Need to clock in?{" "}
              <Link
                href="/kiosk"
                sx={{
                  color: m3Tokens.colors.primary.main,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Use the kiosk →
              </Link>
            </Typography>
          </Box>
        )}

        {step === "auth-choice" && worker && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              width: "100%",
              maxWidth: 400,
              mx: "auto",
            }}
          >
            {/* Welcome Card */}
            <Card
              sx={{
                width: "100%",
                textAlign: "center",
                backgroundColor: m3Tokens.colors.surface.container,
              }}
            >
              <CardContent sx={{ py: 4 }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    mx: "auto",
                    mb: 2,
                    bgcolor: `${m3Tokens.colors.primary.main}20`,
                    fontSize: "1.5rem",
                    fontWeight: 600,
                  }}
                >
                  {worker.full_name.charAt(0)}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  Welcome back, {worker.full_name.split(" ")[0]}!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  How would you like to sign in?
                </Typography>
              </CardContent>
            </Card>

            {/* Auth Options */}
            <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handlePasskeyAuth}
                disabled={isPasskeyLoading}
                startIcon={isPasskeyLoading ? <CircularProgress size={20} color="inherit" /> : <FingerprintOutlined />}
                sx={{
                  py: 2,
                  borderRadius: m3Tokens.shape.large,
                }}
              >
                Use Passkey
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={handleChooseEmailVerification}
                disabled={isPinLoading}
                startIcon={isPinLoading ? <CircularProgress size={20} /> : <MailOutline />}
                sx={{
                  py: 2,
                  borderRadius: m3Tokens.shape.large,
                }}
              >
                Send Email Code
              </Button>
            </Box>

            {passkeyError && (
              <Typography variant="body2" color="error" sx={{ textAlign: "center" }}>
                {passkeyError}
              </Typography>
            )}

            {/* Back button */}
            <IconButton
              onClick={handleBack}
              sx={{ color: m3Tokens.colors.onSurface.variant }}
            >
              <ArrowBack />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Back
              </Typography>
            </IconButton>
          </Box>
        )}

        {step === "verify" && worker && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              width: "100%",
              maxWidth: 400,
              mx: "auto",
            }}
          >
            {/* Welcome Card */}
            <Card
              sx={{
                width: "100%",
                textAlign: "center",
                backgroundColor: m3Tokens.colors.surface.container,
              }}
            >
              <CardContent sx={{ py: 4 }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    mx: "auto",
                    mb: 2,
                    bgcolor: `${m3Tokens.colors.primary.main}20`,
                  }}
                >
                  <MailOutline
                    sx={{
                      fontSize: 32,
                      color: m3Tokens.colors.primary.main,
                    }}
                  />
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  Hi, {worker.full_name.split(" ")[0]}!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We sent a 6-digit code to:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: "monospace",
                    mt: 0.5,
                    color: m3Tokens.colors.onSurface.main,
                  }}
                >
                  {maskEmail(worker.email)}
                </Typography>
              </CardContent>
            </Card>

            {/* Verification code input */}
            <NumericKeypad
              value={verificationCode}
              onChange={(val) => {
                setVerificationCode(val);
                setVerifyError(null);
              }}
              onSubmit={handleVerifySubmit}
              maxLength={6}
              isLoading={isVerifyLoading}
              error={verifyError}
              label="Enter Code"
            />

            {/* Resend button */}
            <Button
              variant="text"
              onClick={handleResendCode}
              disabled={resendCooldown > 0}
              sx={{
                color:
                  resendCooldown > 0
                    ? m3Tokens.colors.onSurface.variant
                    : m3Tokens.colors.primary.main,
              }}
            >
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : "Didn't receive it? Resend code"}
            </Button>

            {/* Back button */}
            <IconButton
              onClick={handleBack}
              sx={{ color: m3Tokens.colors.onSurface.variant }}
            >
              <ArrowBack />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Back
              </Typography>
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          mt: "auto",
          textAlign: "center",
          borderTop: `1px solid ${m3Tokens.colors.outline.variant}`,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Personal device login • Secure verification
        </Typography>
      </Box>

      {/* Passkey Registration Prompt */}
      <Dialog open={showPasskeyPrompt} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: "center", pt: 3 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              mx: "auto",
              mb: 2,
              bgcolor: `${m3Tokens.colors.primary.main}20`,
            }}
          >
            <FingerprintOutlined
              sx={{ fontSize: 28, color: m3Tokens.colors.primary.main }}
            />
          </Avatar>
          Enable Quick Login?
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Register a passkey to sign in faster next time using your fingerprint, face, or device PIN.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ flexDirection: "column", gap: 1, px: 3, pb: 3 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleRegisterPasskey}
            disabled={isPasskeyLoading}
            startIcon={isPasskeyLoading ? <CircularProgress size={18} color="inherit" /> : <FingerprintOutlined />}
          >
            Register Passkey
          </Button>
          <Button
            variant="text"
            fullWidth
            onClick={handleSkipPasskey}
            disabled={isPasskeyLoading}
          >
            Maybe Later
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
