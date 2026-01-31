"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { NumericKeypad } from "@/components/NumericKeypad";
import {
  authenticateWorkerForDashboard,
  sendVerificationCode,
  verifyCode,
} from "@/lib/supabase";
import { cn } from "@/lib/utils";

type LoginStep = "pin" | "verify";

interface WorkerData {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export default function LoginPage() {
  const router = useRouter();
  
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
      
      setWorker({
        id: result.worker.id,
        full_name: result.worker.full_name,
        email: result.worker.email || "",
        role: result.worker.role || "worker",
      });
      
      // Send verification code
      const sendResult = await sendVerificationCode(
        result.worker.id,
        result.worker.email || ""
      );
      
      if (!sendResult.success) {
        setPinError(sendResult.error || "Failed to send code");
        setPin("");
        return;
      }
      
      setPin("");
      setStep("verify");
      setResendCooldown(60);
      
      toast.success("Code sent!", {
        description: `Check your email for the verification code.`,
      });
      
    } catch (error) {
      console.error("Login error:", error);
      setPinError("Unable to connect. Please try again.");
    } finally {
      setIsPinLoading(false);
    }
  }, [pin]);

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
      
      // Store session in localStorage
      localStorage.setItem("rome_session", JSON.stringify({
        workerId: worker.id,
        workerName: worker.full_name,
        email: worker.email,
        role: worker.role,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      }));
      
      toast.success("Welcome!", {
        description: `Logged in as ${worker.full_name}`,
      });
      
      // Redirect based on role
      if (worker.role === "manager" || worker.role === "supervisor") {
        router.push("/manager");
      } else {
        router.push("/dashboard");
      }
      
    } catch (error) {
      console.error("Verification error:", error);
      setVerifyError("Unable to verify. Please try again.");
      hasAutoSubmittedVerify.current = false;
    } finally {
      setIsVerifyLoading(false);
    }
  }, [verificationCode, worker, router]);

  // Handle resend code
  const handleResendCode = useCallback(async () => {
    if (resendCooldown > 0 || !worker) return;
    
    try {
      const result = await sendVerificationCode(worker.id, worker.email);
      
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
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
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

  // Back to PIN step
  const handleBack = () => {
    setStep("pin");
    setVerificationCode("");
    setVerifyError(null);
    setWorker(null);
  };

  return (
    <main className="min-h-dvh bg-warehouse-black flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-center py-4 border-b border-warehouse-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warehouse-orange flex items-center justify-center">
            <span className="text-warehouse-black font-bold text-xl">R</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-warehouse-white tracking-tight">
              ROME
            </h1>
            <p className="text-xs text-warehouse-gray-500 uppercase tracking-wider">
              Worker Login
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center py-6 px-4 mb-6">
        {step === "pin" && (
          <div className="flex flex-col items-center gap-4">
            <NumericKeypad
              value={pin}
              onChange={setPin}
              onSubmit={handlePinSubmit}
              maxLength={6}
              isLoading={isPinLoading}
              error={pinError}
            />
            
            {/* Link to kiosk */}
            <div className="mt-4 text-center">
              <p className="text-warehouse-gray-500 text-sm">
                Need to clock in?{" "}
                <a
                  href="/kiosk"
                  className="text-warehouse-orange hover:underline"
                >
                  Use the kiosk →
                </a>
              </p>
            </div>
          </div>
        )}

        {step === "verify" && worker && (
          <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
            {/* Welcome message */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-warehouse-orange/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-warehouse-orange" />
              </div>
              <h2 className="text-xl font-bold text-warehouse-white">
                Hi, {worker.full_name.split(" ")[0]}!
              </h2>
              <p className="text-warehouse-gray-400 text-sm mt-2">
                We sent a 6-digit code to:
              </p>
              <p className="text-warehouse-white font-mono mt-1">
                {maskEmail(worker.email)}
              </p>
            </div>

            {/* Verification code input - reuse NumericKeypad */}
            <div className="w-full">
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
              />
            </div>

            {/* Resend button */}
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendCooldown > 0}
              className={cn(
                "text-sm font-medium",
                resendCooldown > 0
                  ? "text-warehouse-gray-500 cursor-not-allowed"
                  : "text-warehouse-orange hover:underline"
              )}
            >
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : "Didn't receive it? Resend code"}
            </button>

            {/* Back button */}
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 text-warehouse-gray-400 hover:text-warehouse-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-4 mt-auto text-center border-t border-warehouse-gray-800">
        <p className="text-xs text-warehouse-gray-600">
          Personal device login • Secure verification
        </p>
      </footer>
    </main>
  );
}
