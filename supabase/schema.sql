-- ============================================
-- ROME Warehouse Management System
-- Database Schema for Supabase
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- WORKERS TABLE
-- Stores worker information with 6-digit PIN
-- ============================================
CREATE TABLE workers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pin CHAR(6) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'worker',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast PIN lookups (used during clock-in)
CREATE INDEX idx_workers_pin ON workers(pin);

-- ============================================
-- PUNCHES TABLE
-- Tracks clock in/out events
-- ============================================
CREATE TYPE punch_type AS ENUM ('IN', 'OUT');

CREATE TABLE punches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    type punch_type NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying punches by worker and date
CREATE INDEX idx_punches_worker_id ON punches(worker_id);
CREATE INDEX idx_punches_timestamp ON punches(timestamp DESC);
CREATE INDEX idx_punches_worker_timestamp ON punches(worker_id, timestamp DESC);

-- ============================================
-- PRODUCTION LOGS TABLE
-- Tracks task completion quantities
-- ============================================
CREATE TABLE production_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    task_name VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying production by worker and date
CREATE INDEX idx_production_logs_worker_id ON production_logs(worker_id);
CREATE INDEX idx_production_logs_timestamp ON production_logs(timestamp DESC);
CREATE INDEX idx_production_logs_task ON production_logs(task_name);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Basic policies for security
-- ============================================

-- Enable RLS
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE punches ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read/insert for kiosk operations
-- In production, you'd want more restrictive policies
CREATE POLICY "Allow anonymous read on workers" ON workers
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert on punches" ON punches
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous read on punches" ON punches
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert on production_logs" ON production_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous read on production_logs" ON production_logs
    FOR SELECT USING (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get worker's current clock status
CREATE OR REPLACE FUNCTION get_worker_status(worker_uuid UUID)
RETURNS TABLE(is_clocked_in BOOLEAN, last_punch_type punch_type, last_punch_time TIMESTAMPTZ) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE WHEN p.type = 'IN' THEN true ELSE false END,
        p.type,
        p.timestamp
    FROM punches p
    WHERE p.worker_id = worker_uuid
    ORDER BY p.timestamp DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================
INSERT INTO workers (pin, full_name, role) VALUES
    ('123456', 'John Smith', 'worker'),
    ('234567', 'Maria Garcia', 'worker'),
    ('345678', 'James Wilson', 'supervisor'),
    ('456789', 'Sarah Johnson', 'worker'),
    ('567890', 'Michael Brown', 'worker');
