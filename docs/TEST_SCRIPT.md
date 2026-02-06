# ROME Test Script

A comprehensive manual testing guide for the ROME warehouse management system.

---

## Test Environment Setup

### Test Accounts (Demo Mode)

| PIN | Name | Role | Email |
|-----|------|------|-------|
| `123456` | John Smith | Worker | john.smith@example.com |
| `234567` | Maria Garcia | Worker | maria.garcia@example.com |
| `345678` | James Wilson | Manager | james.wilson@example.com |
| `456789` | Sarah Johnson | Worker | sarah.johnson@example.com |
| `567890` | Michael Brown | Worker | michael.brown@example.com |

### URLs

| Page | URL | Purpose |
|------|-----|---------|
| Kiosk | `/kiosk` | Shared terminal for clock in/out |
| Personal Login | `/login` | Personal device login |
| Worker Dashboard | `/dashboard` | View hours, request time off |
| Manager Dashboard | `/manager` | Approve/deny requests |

---

## Test Suite 1: Kiosk Flow

### 1.1 PIN Entry

| # | Test Case | Steps | Expected Result | Pass? |
|---|-----------|-------|-----------------|-------|
| 1.1.1 | Valid PIN login | Enter `123456` | Shows "Welcome, John Smith" with action buttons | ☐ |
| 1.1.2 | Invalid PIN | Enter `000000` | Shows error "Invalid PIN", clears input | ☐ |
| 1.1.3 | Partial PIN | Enter `123` then wait | Nothing happens (no auto-submit) | ☐ |
| 1.1.4 | Keyboard input | Type `123456` on keyboard | Same as tapping keypad | ☐ |
| 1.1.5 | Backspace/Delete | Enter `1234`, press Backspace | Shows `123`, can continue typing | ☐ |
| 1.1.6 | Clear button | Enter `123`, tap Clear | Input clears completely | ☐ |
| 1.1.7 | Visual feedback | Tap any number | Button flashes/highlights briefly | ☐ |

### 1.2 Clock In

| # | Test Case | Steps | Expected Result | Pass? |
|---|-----------|-------|-----------------|-------|
| 1.2.1 | First clock in | Login as John (123456), tap "Clock In" | Success message, returns to PIN screen | ☐ |
| 1.2.2 | Already clocked in | Login as John again | Shows "Clock Out" button (not Clock In) | ☐ |
| 1.2.3 | Clock in timestamp | Check dashboard after clock in | Shows correct current time | ☐ |

### 1.3 Clock Out

| # | Test Case | Steps | Expected Result | Pass? |
|---|-----------|-------|-----------------|-------|
| 1.3.1 | Normal clock out | Login as clocked-in worker, tap "Clock Out" | Shows time worked summary, returns to PIN | ☐ |
| 1.3.2 | Time worked display | Clock out after being clocked in | Shows duration (e.g., "4h 32m") | ☐ |
| 1.3.3 | Not clocked in | Login as worker who hasn't clocked in | Shows "Clock In" button (not Clock Out) | ☐ |

### 1.4 Production Logging

| # | Test Case | Steps | Expected Result | Pass? |
|---|-----------|-------|-----------------|-------|
| 1.4.1 | Access production log | Login, tap "Log Production" | Shows task list with quantity inputs | ☐ |
| 1.4.2 | Increment quantity | Tap + button on "Box Packing" | Quantity increases by 1 | ☐ |
| 1.4.3 | Decrement quantity | Tap - button when quantity > 0 | Quantity decreases by 1 | ☐ |
| 1.4.4 | Cannot go negative | Tap - when quantity is 0 | Stays at 0 | ☐ |
| 1.4.5 | Submit production | Set quantities, tap Submit | Success message, returns to PIN | ☐ |

---

## Test Suite 2: Personal Login Flow

### 2.1 PIN Verification

| # | Test Case | Steps | Expected Result | Pass? |
|---|-----------|-------|-----------------|-------|
| 2.1.1 | Valid PIN | Go to `/login`, enter `123456` | Proceeds to email verification step | ☐ |
| 2.1.2 | Invalid PIN | Enter `000000` | Shows error, stays on PIN screen | ☐ |
| 2.1.3 | Shows masked email | Enter valid PIN | Shows "Code sent to j●●●●@example.com" | ☐ |

### 2.2 Email Verification

| # | Test Case | Steps | Expected Result | Pass? |
|---|-----------|-------|-----------------|-------|
| 2.2.1 | Code appears in console | After PIN, check browser console | 6-digit code logged | ☐ |
| 2.2.2 | Valid code | Enter the 6-digit code | Redirects to dashboard | ☐ |
| 2.2.3 | Invalid code | Enter `000000` | Shows error, clears input | ☐ |
| 2.2.4 | Resend code | Wait for cooldown, tap "Resend" | New code in console, cooldown resets | ☐ |
| 2.2.5 | Back button | Tap back arrow | Returns to PIN entry | ☐ |

### 2.3 Role-Based Redirect

| # | Test Case | Steps | Expected Result | Pass? |
|---|-----------|-------|-----------------|-------|
| 2.3.1 | Worker login | Login as John (123456) | Redirects to `/dashboard` | ☐ |
| 2.3.2 | Manager login | Login as James (345678) | Redirects to `/manager` | ☐ |

---

## Test Suite 3: Worker Dashboard

### 3.1 Hours Display

| # | Test Case | Steps | Expected Result | Pass? |
|---|-----------|-------|-----------------|-------|
| 3.1.1 | Weekly hours | View dashboard home | Shows "This Week" with total hours | ☐ |
| 3.1.2 | Daily breakdown | View dashboard home | Shows each day with hours worked | ☐ |
| 3.1.3 | Today's status | View when clocked in | Shows "Currently working" with timer | ☐ |
| 3.1.4 | Today's status | View when clocked out | Shows "Not clocked in" | ☐ |

### 3.2 Punch History

| # | Test Case | Steps | Expected Result | Pass? |
|---|-----------|-------|-----------------|-------|
| 3.2.1 | View history | Tap "See All" or go to history page | Shows list of all punches | ☐ |
| 3.2.2 | Punch format | View punch entry | Shows date, time in/out, duration | ☐ |
| 3.2.3 | Filter: This Week | Tap "This Week" filter | Shows only current week punches | ☐ |
| 3.2.4 | Filter: This Month | Tap "This Month" filter | Shows current month punches | ☐ |
| 3.2.5 | Filter: All Time | Tap "All Time" filter | Shows all historical punches | ☐ |

### 3.3 Navigation

| # | Test Case | Steps | Expected Result | Pass? |
|---|-----------|-------|-----------------|-------|
| 3.3.1 | Bottom nav: Home | Tap Home icon | Goes to `/dashboard` | ☐ |
| 3.3.2 | Bottom nav: Time Off | Tap Time Off icon | Goes to `/dashboard/time-off` | ☐ |
| 3.3.3 | Bottom nav: Settings | Tap Settings icon | Goes to `/dashboard/settings` | ☐ |
| 3.3.4 | Logout | Tap logout icon in header | Redirects to `/login` | ☐ |

---

## Test Suite 4: Time Off Requests

### 4.1 Submit Request (Worker)

| # | Test Case | Steps | Expected Result | Pass? |
|---|-----------|-------|-----------------|-------|
| 4.1.1 | Access form | Go to Time Off, tap "Request Time Off" | Shows request form | ☐ |
| 4.1.2 | Select type | Tap "Vacation" | Type is selected, highlighted | ☐ |
| 4.1.3 | Select dates | Pick start and end date | Dates appear in form | ☐ |
| 4.1.4 | Invalid dates | Set end date before start | Submit button disabled or shows error | ☐ |
| 4.1.5 | Set hours | Adjust paid/unpaid hours | Values update correctly | ☐ |
| 4.1.6 | Add comment | Type in comments field | Text appears | ☐ |
| 4.1.7 | Submit valid request | Fill all required fields, submit | Success screen, request appears in list | ☐ |
| 4.1.8 | View pending | Go back to Time Off list | New request shows as "Pending" | ☐ |

### 4.2 Manage Requests (Manager)

| # | Test Case | Steps | Expected Result | Pass? |
|---|-----------|-------|-----------------|-------|
| 4.2.1 | View pending | Login as manager (345678) | Shows pending requests list | ☐ |
| 4.2.2 | Request details | View a pending request | Shows worker name, dates, type, hours, comments | ☐ |
| 4.2.3 | Approve request | Tap "Approve" | Success toast, request removed from list | ☐ |
| 4.2.4 | Deny request | Tap "Deny" | Modal appears for reason | ☐ |
| 4.2.5 | Deny with reason | Enter reason, confirm | Success toast, request removed | ☐ |
| 4.2.6 | View history | Go to History tab | Shows approved/denied requests | ☐ |
| 4.2.7 | Filter history | Tap filter buttons | Filters work correctly | ☐ |

### 4.3 Status Updates (Worker)

| # | Test Case | Steps | Expected Result | Pass? |
|---|-----------|-------|-----------------|-------|
| 4.3.1 | See approved | After manager approves, check worker's list | Request shows "Approved" | ☐ |
| 4.3.2 | See denied | After manager denies, check worker's list | Request shows "Denied" with reason | ☐ |

---

## Test Suite 5: Settings

| # | Test Case | Steps | Expected Result | Pass? |
|---|-----------|-------|-----------------|-------|
| 5.1 | View profile | Go to Settings | Shows name, role, masked PIN, email | ☐ |
| 5.2 | Logout | Tap "Log Out" button | Clears session, redirects to login | ☐ |

---

## Test Suite 6: Edge Cases & Error Handling

### 6.1 Network Errors

| # | Test Case | Steps | Expected Result | Pass? |
|---|-----------|-------|-----------------|-------|
| 6.1.1 | Offline clock in | Disable network, try to clock in | Shows error with retry button | ☐ |
| 6.1.2 | Retry works | Re-enable network, tap retry | Action succeeds | ☐ |

### 6.2 Session Management

| # | Test Case | Steps | Expected Result | Pass? |
|---|-----------|-------|-----------------|-------|
| 6.2.1 | Session persists | Login, close browser, reopen | Still logged in | ☐ |
| 6.2.2 | Direct URL access | Go to `/dashboard` without login | Redirects to `/login` | ☐ |
| 6.2.3 | Worker accessing manager | Login as worker, go to `/manager` | Redirects to `/dashboard` | ☐ |

### 6.3 Demo Mode Fallback

| # | Test Case | Steps | Expected Result | Pass? |
|---|-----------|-------|-----------------|-------|
| 6.3.1 | Supabase table missing | With Supabase configured but tables missing | Falls back to demo data gracefully | ☐ |

---

## Test Suite 7: UI/UX Quality

### 7.1 Visual Consistency

| # | Check | Location | Pass? |
|---|-------|----------|-------|
| 7.1.1 | Orange accent color consistent | All buttons, highlights | ☐ |
| 7.1.2 | Text readable on dark background | All pages | ☐ |
| 7.1.3 | Touch targets ≥ 44px | Buttons, nav items | ☐ |
| 7.1.4 | Loading states present | All async actions | ☐ |
| 7.1.5 | Error states styled | All error messages | ☐ |

### 7.2 Mobile Responsiveness

| # | Check | Device/Width | Pass? |
|---|-------|--------------|-------|
| 7.2.1 | Kiosk usable | Mobile (375px) | ☐ |
| 7.2.2 | Dashboard usable | Mobile (375px) | ☐ |
| 7.2.3 | No horizontal scroll | All pages | ☐ |
| 7.2.4 | Bottom nav accessible | Mobile | ☐ |

### 7.3 Accessibility

| # | Check | Location | Pass? |
|---|-------|----------|-------|
| 7.3.1 | Focus visible | Keyboard navigation | ☐ |
| 7.3.2 | Color contrast | Text on backgrounds | ☐ |
| 7.3.3 | Screen reader labels | Interactive elements | ☐ |

---

## Bug Tracking

### Found Issues

| # | Severity | Page | Description | Status |
|---|----------|------|-------------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

### Severity Levels
- **Critical**: App crashes, data loss, security issue
- **High**: Feature broken, blocking workflow
- **Medium**: Feature partially works, workaround exists
- **Low**: Visual glitch, minor inconvenience

---

## Test Run Log

| Date | Tester | Suites Completed | Bugs Found | Notes |
|------|--------|------------------|------------|-------|
| | | | | |

---

## Quick Smoke Test (5 min)

For rapid validation, run through these key flows:

1. ☐ `/kiosk` → Enter `123456` → Clock In → Returns to PIN
2. ☐ `/kiosk` → Enter `123456` → Clock Out → Shows time worked
3. ☐ `/login` → Enter `123456` → Get code from console → Enter code → Dashboard loads
4. ☐ Dashboard → Time Off → Request Time Off → Submit → See pending request
5. ☐ `/login` → Enter `345678` (manager) → See pending request → Approve
6. ☐ Back to worker dashboard → Request shows "Approved"

If all 6 pass, core functionality is working.
