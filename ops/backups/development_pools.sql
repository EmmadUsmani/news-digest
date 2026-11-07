-- Candidate only: not registered as a migration or applied to production.
CREATE TABLE development_spend_pools (
  provider text PRIMARY KEY CHECK (provider IN ('anthropic', 'xai')),
  cap_micros integer NOT NULL CHECK (cap_micros >= 0 AND
    cap_micros <= CASE provider WHEN 'anthropic' THEN 5000000 ELSE 2000000 END)
);
INSERT INTO development_spend_pools VALUES ('anthropic', 5000000), ('xai', 2000000);
CREATE TABLE development_spend_reservations (
  id uuid PRIMARY KEY,
  provider text NOT NULL REFERENCES development_spend_pools(provider),
  reserved_micros integer NOT NULL CHECK (reserved_micros > 0),
  cost_micros integer CHECK (cost_micros >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX development_spend_provider ON development_spend_reservations(provider);
