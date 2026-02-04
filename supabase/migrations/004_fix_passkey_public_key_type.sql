-- Fix public_key column type from BYTEA to TEXT
-- The public key is stored as a base64-encoded string, not raw bytes
-- This avoids double-encoding issues with Supabase

ALTER TABLE passkey_credentials 
  ALTER COLUMN public_key TYPE TEXT 
  USING encode(public_key, 'base64');
