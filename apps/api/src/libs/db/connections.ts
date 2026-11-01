import { Pool } from 'pg';
import Redis from 'ioredis';
export function database() { return new Pool({ connectionString: process.env.DATABASE_URL ?? 'postgres://postgres@127.0.0.1:5432/news_digest', connectionTimeoutMillis: 3000 }); }
export function redis() { return new Redis(process.env.REDIS_URL ?? 'redis://127.0.0.1:6379', { maxRetriesPerRequest: 1, connectTimeout: 3000 }); }
