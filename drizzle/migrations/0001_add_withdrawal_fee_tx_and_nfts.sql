ALTER TABLE public.withdrawals ADD COLUMN fee_tx text;

CREATE TABLE public.nfts (
  id uuid primary key default gen_random_uuid(),
  user_id bigint not null,
  item_index integer,
  nft_address text,
  price_gram numeric not null default 0,
  created_at timestamptz not null default now()
);

GRANT ALL ON public.nfts TO service_role;

ALTER TABLE public.nfts ENABLE ROW LEVEL SECURITY;