/*
  # Create access_requests table

  1. New Tables
    - `access_requests`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `email` (text, not null)
      - `institution` (text, not null)
      - `role` (text, not null) - clinician / pharmacist / admin / data_scientist
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `access_requests` table
    - Add insert policy for anonymous users (public form submission)
    - No select/update/delete policies (admin-only via service role)
*/

CREATE TABLE IF NOT EXISTS access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  institution text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'clinician',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert for access requests"
  ON access_requests
  FOR INSERT
  TO anon
  WITH CHECK (
    length(name) > 0
    AND length(email) > 0
    AND length(institution) > 0
    AND role IN ('clinician', 'pharmacist', 'admin', 'data_scientist')
  );
