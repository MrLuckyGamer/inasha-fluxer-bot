import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error('[db] FATAL: DATABASE_URL env var is not set.');
  process.exit(1);
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('[db] Unexpected pool error:', err);
});

export async function initDb() {
  console.log('[db] Connecting to PostgreSQL...');
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fish_scores (
        guild_id  TEXT    NOT NULL,
        user_id   TEXT    NOT NULL,
        score     INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (guild_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS fish_cooldowns (
        guild_id    TEXT   NOT NULL,
        user_id     TEXT   NOT NULL,
        last_fished BIGINT NOT NULL DEFAULT 0,
        PRIMARY KEY (guild_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS warnings (
        id            SERIAL PRIMARY KEY,
        guild_id      TEXT   NOT NULL,
        user_id       TEXT   NOT NULL,
        moderator_id  TEXT   NOT NULL,
        moderator_tag TEXT   NOT NULL,
        reason        TEXT   NOT NULL,
        warned_at     BIGINT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS warnings_guild_user ON warnings (guild_id, user_id);

      CREATE TABLE IF NOT EXISTS family (
        guild_id  TEXT NOT NULL,
        user_id   TEXT NOT NULL,
        target_id TEXT NOT NULL,
        relation  TEXT NOT NULL CHECK (relation IN ('parent','child')),
        PRIMARY KEY (guild_id, user_id, target_id, relation)
      );

      CREATE TABLE IF NOT EXISTS serverstats (
        guild_id    TEXT PRIMARY KEY,
        category_id TEXT NOT NULL,
        users_id    TEXT NOT NULL,
        bots_id     TEXT NOT NULL,
        channels_id TEXT NOT NULL
      );
    `);
    console.log('[db] Tables ready.');
  } catch (err) {
    console.error('[db] Failed to initialise database:', err.message);
    console.error(err);
    process.exit(1);
  }
}
