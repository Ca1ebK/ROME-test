/**
 * Component exports organized by domain
 * 
 * Structure:
 * - shared/: Components used by both kiosk and dashboard
 * - kiosk/: Kiosk-specific components
 * - dashboard/: Dashboard-specific components
 */

// ============================================
// Shared Components
// ============================================
export { NumericKeypad } from "./shared/NumericKeypad";

// ============================================
// Kiosk Components
// ============================================
export { ActionButtons } from "./kiosk/ActionButtons";
export { ProductionLog } from "./kiosk/ProductionLog";
export { ErrorRetry } from "./kiosk/ErrorRetry";
export { AddWorker } from "./kiosk/AddWorker";

// ============================================
// Dashboard Components
// ============================================
export { DateRangePicker } from "./dashboard/DateRangePicker";
export { HoursSlider } from "./dashboard/HoursSlider";
export { PasskeyManagement } from "./dashboard/PasskeyManagement";
