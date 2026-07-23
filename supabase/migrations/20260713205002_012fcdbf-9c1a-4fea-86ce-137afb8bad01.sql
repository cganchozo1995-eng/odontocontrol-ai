
CREATE TABLE public.hotmart_plano (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  valor NUMERIC NOT NULL DEFAULT 0,
  moeda TEXT NOT NULL DEFAULT 'BRL',
  ciclo TEXT NOT NULL DEFAULT 'mensal',
  url_checkout TEXT NOT NULL,
  hotmart_product_id TEXT,
  hotmart_offer_code TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hotmart_plano TO anon, authenticated;
GRANT ALL ON public.hotmart_plano TO service_role;
ALTER TABLE public.hotmart_plano ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos pueden ver planes activos" ON public.hotmart_plano FOR SELECT USING (ativo = true OR public.is_admin());
CREATE POLICY "Solo super admin administra planes" ON public.hotmart_plano FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER update_hotmart_plano_updated_at BEFORE UPDATE ON public.hotmart_plano FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.hotmart_pagamento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinica_id UUID REFERENCES public.clinica(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  transaction_id TEXT UNIQUE,
  product_id TEXT,
  offer_code TEXT,
  event TEXT NOT NULL,
  status TEXT NOT NULL,
  valor NUMERIC,
  moeda TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hotmart_pagamento TO authenticated;
GRANT ALL ON public.hotmart_pagamento TO service_role;
ALTER TABLE public.hotmart_pagamento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Solo super admin ve pagos" ON public.hotmart_pagamento FOR SELECT USING (public.is_admin());
CREATE INDEX idx_hotmart_pagamento_email ON public.hotmart_pagamento (email);
CREATE INDEX idx_hotmart_pagamento_clinica ON public.hotmart_pagamento (clinica_id);
