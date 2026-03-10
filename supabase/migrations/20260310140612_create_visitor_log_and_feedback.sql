/*
  # Create visitor_log and feedback tables

  ## Summary
  Sets up two tables to capture who accessed the demo app and collect their feedback.

  ## New Tables

  ### visitor_log
  Records every visitor who enters their email to access the app.
  - `id` (uuid, primary key)
  - `email` (text, not null) - visitor's email address
  - `user_agent` (text) - browser/device info
  - `accessed_at` (timestamptz) - when they first accessed the app

  ### feedback
  Stores post-demo feedback submitted by visitors.
  - `id` (uuid, primary key)
  - `email` (text, not null) - visitor's email (links back to visitor_log logically)
  - `rating` (integer, 1-5) - experience rating
  - `comment` (text) - optional free-text feedback
  - `submitted_at` (timestamptz) - when feedback was submitted

  ## Security
  - RLS enabled on both tables
  - Anonymous users (visitors) can INSERT only (no read access)
  - No authenticated user access needed (service role handles reads via Supabase dashboard)
*/

CREATE TABLE IF NOT EXISTS visitor_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  user_agent text DEFAULT '',
  accessed_at timestamptz DEFAULT now()
);

ALTER TABLE visitor_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visitors can log their access"
  ON visitor_log
  FOR INSERT
  TO anon
  WITH CHECK (email IS NOT NULL AND email <> '');

CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  submitted_at timestamptz DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visitors can submit feedback"
  ON feedback
  FOR INSERT
  TO anon
  WITH CHECK (
    email IS NOT NULL
    AND email <> ''
    AND rating >= 1
    AND rating <= 5
  );
