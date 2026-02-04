/**
 * Email Service - Server-only module
 * This file should only be imported from API routes or server components
 */
import "server-only";
import { Resend } from "resend";

// ============================================
// Email Service Configuration
// ============================================

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "ROME <noreply@resend.dev>";

// Check if email service is configured
const EMAIL_ENABLED = !!RESEND_API_KEY;

// Initialize Resend client
let resend: Resend | null = null;
if (EMAIL_ENABLED) {
  resend = new Resend(RESEND_API_KEY);
}

// Log email service status
if (typeof window === "undefined") {
  if (EMAIL_ENABLED) {
    console.log("📧 Email service configured (Resend)");
  } else {
    console.log("📧 Email service not configured - codes will be logged to console");
  }
}

// ============================================
// Email Templates
// ============================================

interface VerificationEmailProps {
  code: string;
  workerName: string;
}

function getVerificationEmailHtml({ code, workerName }: VerificationEmailProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ROME Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: 'Inter', system-ui, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0A0A0A; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 400px; background-color: #171717; border-radius: 16px; border: 1px solid #262626;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 24px 24px; text-align: center; border-bottom: 1px solid #262626;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #FF6B00;">ROME</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #737373;">Warehouse Management</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 24px;">
              <p style="margin: 0 0 8px; font-size: 16px; color: #FAFAFA;">
                Hi ${workerName},
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #A3A3A3;">
                Use this code to verify your login:
              </p>
              
              <!-- Code Box -->
              <div style="background-color: #262626; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #FF6B00; font-family: 'JetBrains Mono', monospace;">
                  ${code}
                </span>
              </div>
              
              <p style="margin: 0; font-size: 12px; color: #737373; text-align: center;">
                This code expires in <strong style="color: #A3A3A3;">10 minutes</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; border-top: 1px solid #262626;">
              <p style="margin: 0; font-size: 11px; color: #525252; text-align: center;">
                If you didn't request this code, you can safely ignore this email.
              </p>
              <p style="margin: 12px 0 0; font-size: 11px; color: #525252; text-align: center;">
                &copy; ${new Date().getFullYear()} ROME Warehouse Management System
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function getVerificationEmailText({ code, workerName }: VerificationEmailProps): string {
  return `
Hi ${workerName},

Your ROME verification code is: ${code}

This code expires in 10 minutes.

If you didn't request this code, you can safely ignore this email.

- ROME Warehouse Management System
  `.trim();
}

// ============================================
// Email Sending Functions
// ============================================

export interface SendVerificationEmailResult {
  success: boolean;
  error?: string;
}

export async function sendVerificationEmail(
  to: string,
  code: string,
  workerName: string
): Promise<SendVerificationEmailResult> {
  // If email service not configured, just log to console
  if (!EMAIL_ENABLED || !resend) {
    console.log(`📧 [Demo] Verification code for ${to}: ${code}`);
    return { success: true };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `${code} is your ROME verification code`,
      html: getVerificationEmailHtml({ code, workerName }),
      text: getVerificationEmailText({ code, workerName }),
    });

    if (error) {
      // Check if this is the "testing emails" restriction from Resend
      // In this case, fall back to console logging instead of failing
      if (error.message?.includes("testing emails") || error.message?.includes("verify a domain")) {
        console.log(`📧 [Resend Test Mode] Cannot send to ${to} - logging code instead: ${code}`);
        return { success: true }; // Don't fail the login flow
      }
      
      console.error("Failed to send verification email:", error);
      return { success: false, error: error.message };
    }

    console.log(`📧 Verification email sent to ${to}`);
    return { success: true };
  } catch (err) {
    console.error("Error sending verification email:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Failed to send email" 
    };
  }
}

// ============================================
// Time Off Notification Emails
// ============================================

interface TimeOffNotificationProps {
  workerName: string;
  type: string;
  startDate: string;
  endDate: string;
  status: "approved" | "denied";
  reviewerName?: string;
  denialReason?: string;
}

function getTimeOffNotificationHtml(props: TimeOffNotificationProps): string {
  const statusColor = props.status === "approved" ? "#22C55E" : "#EF4444";
  const statusText = props.status === "approved" ? "Approved" : "Denied";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Time Off Request ${statusText}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: 'Inter', system-ui, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0A0A0A; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 400px; background-color: #171717; border-radius: 16px; border: 1px solid #262626;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 24px 24px; text-align: center; border-bottom: 1px solid #262626;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #FF6B00;">ROME</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #737373;">Time Off Update</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 24px;">
              <p style="margin: 0 0 16px; font-size: 16px; color: #FAFAFA;">
                Hi ${props.workerName},
              </p>
              
              <!-- Status Badge -->
              <div style="background-color: ${statusColor}20; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 18px; font-weight: bold; color: ${statusColor};">
                  ${statusText.toUpperCase()}
                </span>
              </div>
              
              <p style="margin: 0 0 16px; font-size: 14px; color: #A3A3A3;">
                Your <strong style="color: #FAFAFA;">${props.type}</strong> request has been ${props.status.toLowerCase()}.
              </p>
              
              <!-- Details -->
              <div style="background-color: #262626; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <p style="margin: 0 0 8px; font-size: 13px; color: #737373;">Dates</p>
                <p style="margin: 0; font-size: 14px; color: #FAFAFA;">
                  ${props.startDate}${props.startDate !== props.endDate ? ` - ${props.endDate}` : ""}
                </p>
              </div>
              
              ${props.reviewerName ? `
              <p style="margin: 0; font-size: 13px; color: #737373;">
                Reviewed by: <span style="color: #A3A3A3;">${props.reviewerName}</span>
              </p>
              ` : ""}
              
              ${props.denialReason ? `
              <div style="margin-top: 16px; padding: 12px; background-color: #EF444420; border-radius: 8px;">
                <p style="margin: 0 0 4px; font-size: 12px; color: #EF4444;">Reason</p>
                <p style="margin: 0; font-size: 14px; color: #FAFAFA;">${props.denialReason}</p>
              </div>
              ` : ""}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; border-top: 1px solid #262626;">
              <p style="margin: 0; font-size: 11px; color: #525252; text-align: center;">
                &copy; ${new Date().getFullYear()} ROME Warehouse Management System
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendTimeOffNotification(
  to: string,
  props: TimeOffNotificationProps
): Promise<SendVerificationEmailResult> {
  if (!EMAIL_ENABLED || !resend) {
    console.log(`📧 [Demo] Time off ${props.status} notification for ${to}`);
    return { success: true };
  }

  try {
    const statusText = props.status === "approved" ? "Approved" : "Denied";
    
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Time Off Request ${statusText} - ${props.type}`,
      html: getTimeOffNotificationHtml(props),
    });

    if (error) {
      // Check if this is the "testing emails" restriction from Resend
      if (error.message?.includes("testing emails") || error.message?.includes("verify a domain")) {
        console.log(`📧 [Resend Test Mode] Cannot send time off notification to ${to}`);
        return { success: true }; // Don't fail silently
      }
      
      console.error("Failed to send time off notification:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Error sending time off notification:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Failed to send email" 
    };
  }
}
