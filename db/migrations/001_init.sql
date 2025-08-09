CREATE TABLE IF NOT EXISTS public.users (
  id               BIGSERIAL PRIMARY KEY,
  first_name       TEXT        NOT NULL,
  last_name        TEXT        NOT NULL,
  email            TEXT        NOT NULL UNIQUE,
  password_hash    TEXT        NOT NULL,
  membership_status TEXT       NOT NULL DEFAULT 'guest',
  is_admin         BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_membership_status_chk
    CHECK (membership_status IN ('guest','member'))
);

CREATE TABLE IF NOT EXISTS public.messages (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT      NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL,
  body       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);