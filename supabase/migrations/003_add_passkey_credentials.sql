-- Add passkey credentials table for WebAuthn authentication
-- This allows users to register multiple passkeys (multi-device support)

CREATE TABLE IF NOT EXISTS passkey_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    
    -- WebAuthn credential data
    credential_id TEXT NOT NULL UNIQUE,  -- Base64URL encoded credential ID
    public_key BYTEA NOT NULL,           -- COSE-encoded public key
    counter BIGINT DEFAULT 0,            -- Signature counter for replay protection
    
    -- Metadata
    device_name VARCHAR(255),            -- User-friendly device name (e.g., "iPhone 15")
    transports TEXT[],                   -- Authenticator transports (usb, ble, nfc, internal)
    last_used_at TIMESTAMPTZ,            -- Last successful authentication
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_passkey_worker_id ON passkey_credentials(worker_id);
CREATE INDEX IF NOT EXISTS idx_passkey_credential_id ON passkey_credentials(credential_id);

-- RLS Policies
ALTER TABLE passkey_credentials ENABLE ROW LEVEL SECURITY;

-- Allow public access for the anonymous auth flow
CREATE POLICY "Allow public read on passkey_credentials" ON passkey_credentials
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on passkey_credentials" ON passkey_credentials
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on passkey_credentials" ON passkey_credentials
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on passkey_credentials" ON passkey_credentials
    FOR DELETE USING (true);
