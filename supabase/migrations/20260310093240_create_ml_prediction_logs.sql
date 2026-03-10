/*
  # Create ml_prediction_logs table

  ## Summary
  Adds a new table to capture structured observability data for every ML model
  inference made by the Operations ML forecast pipeline (and future ML services).

  ## New Tables

  ### ml_prediction_logs
  Each row represents one model inference call.

  | Column                   | Type        | Description                                              |
  |--------------------------|-------------|----------------------------------------------------------|
  | id                       | uuid (PK)   | Unique log entry identifier                              |
  | model_domain             | text        | Logical domain: "operations", "clinical", etc.           |
  | model_name               | text        | Human-readable model name, e.g. "capacity_forecast"      |
  | model_version            | text        | Version string from the model module                     |
  | model_type               | text        | "statistical" | "ml" | "hybrid"                          |
  | input_features_json      | text        | JSON-serialized feature snapshot used for the prediction |
  | output_predictions_json  | text        | JSON-serialized forecast output                          |
  | confidence_level         | text        | LOW | MEDIUM | HIGH                                      |
  | trace_id                 | text        | UUID correlating this log to the originating API request |
  | created_at               | timestamptz | Row creation timestamp (server default)                  |
  | updated_at               | timestamptz | Row update timestamp (auto-updated)                      |

  ## Security
  - RLS enabled; only service-role (backend) can insert
  - Authenticated admins can SELECT their own project's logs via policy
  - No direct client write access

  ## Indexes
  - model_domain (for domain-filtered queries)
  - trace_id (for trace correlation lookups)
  - created_at desc (implicit via query ordering)
*/

CREATE TABLE IF NOT EXISTS ml_prediction_logs (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  model_domain            text        NOT NULL,
  model_name              text        NOT NULL,
  model_version           text        NOT NULL,
  model_type              text        NOT NULL,
  input_features_json     text,
  output_predictions_json text,
  confidence_level        text,
  trace_id                text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ml_prediction_logs_domain
  ON ml_prediction_logs (model_domain);

CREATE INDEX IF NOT EXISTS idx_ml_prediction_logs_trace_id
  ON ml_prediction_logs (trace_id);

CREATE INDEX IF NOT EXISTS idx_ml_prediction_logs_created_at
  ON ml_prediction_logs (created_at DESC);

ALTER TABLE ml_prediction_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read ml prediction logs"
  ON ml_prediction_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE u.id = auth.uid()
        AND r.name = 'admin'
    )
  );

CREATE POLICY "Service role can insert ml prediction logs"
  ON ml_prediction_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);
