CREATE TABLE public.tg_users (
  id bigint PRIMARY KEY,
  username text,
  first_name text,
  photo_url text,
  language_code text,
  balance numeric NOT NULL DEFAULT 0,
  power_level int NOT NULL DEFAULT 0,
  mining_started_at timestamptz,
  wallet_address text,
  referred_by bigint,
  subscribed_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.tg_users TO service_role;
ALTER TABLE public.tg_users ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text,
  link text NOT NULL,
  reward numeric NOT NULL DEFAULT 10,
  active boolean NOT NULL DEFAULT true,
  sort int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.task_completions (
  user_id bigint NOT NULL,
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, task_id)
);
GRANT ALL ON public.task_completions TO service_role;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id bigint NOT NULL,
  amount numeric NOT NULL,
  to_address text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  tx_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.withdrawals TO service_role;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

INSERT INTO public.tasks (title, image_url, link, reward, sort) VALUES
('Join ORAI channel', NULL, 'https://t.me/c/2616088306', 50, 1),
('Buy ORAI on STON.fi', NULL, 'https://app.ston.fi/swap?chartVisible=false&ft=GRAM&tt=EQCY5dx1kTGT-r1RPXA-LTRyv73_LtfcaTl0g1E_WBlRdUyI', 100, 2);