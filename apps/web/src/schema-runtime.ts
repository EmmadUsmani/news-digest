import { z } from 'zod';

// Load before contracts/router schemas: browser validation must not generate code.
z.config({ jitless: true });
