-- Preserve existing rows while isolating new challenges and guesses by client.
ALTER TABLE login_codes ADD COLUMN client_key text NOT NULL DEFAULT '';
ALTER TABLE login_codes DROP CONSTRAINT login_codes_pkey;
ALTER TABLE login_codes ADD PRIMARY KEY (email, client_key);
