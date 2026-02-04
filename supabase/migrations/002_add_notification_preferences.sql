-- ============================================
-- ROME Migration 002: Notification Preferences
-- Adds email_notifications_enabled to workers
-- ============================================

-- Add notification preference column
ALTER TABLE workers 
ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true;

-- Add update policy for workers table (needed for profile updates)
DROP POLICY IF EXISTS "Allow updates on workers" ON workers;
CREATE POLICY "Allow updates on workers" ON workers
    FOR UPDATE USING (true);

-- ============================================
-- CONFIRMATION
-- ============================================
SELECT 'Migration 002 complete! Added email_notifications_enabled column' as status;
