CREATE TABLE profiles (id uuid PRIMARY KEY, name text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
INSERT INTO profiles(id, name) VALUES ('00000000-0000-4000-8000-000000000001', 'Default');
