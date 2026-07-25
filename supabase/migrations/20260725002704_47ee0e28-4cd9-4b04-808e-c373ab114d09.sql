
ALTER TYPE public.status_orcamento_enum RENAME VALUE 'pendente' TO 'pendiente';
ALTER TYPE public.status_orcamento_enum RENAME VALUE 'aprovado' TO 'aprobado';
ALTER TYPE public.status_orcamento_enum RENAME VALUE 'recusado' TO 'rechazado';
ALTER TYPE public.status_orcamento_enum RENAME VALUE 'em_negociacao' TO 'en_negociacion';

ALTER TYPE public.status_tratamento_enum RENAME VALUE 'planejado' TO 'planificado';
ALTER TYPE public.status_tratamento_enum RENAME VALUE 'em_andamento' TO 'en_curso';

ALTER TYPE public.status_financeiro_enum RENAME VALUE 'pendente' TO 'pendiente';
ALTER TYPE public.tipo_financeiro_enum RENAME VALUE 'receita' TO 'ingreso';
ALTER TYPE public.tipo_financeiro_enum RENAME VALUE 'despesa' TO 'egreso';

ALTER TABLE public.orcamento ALTER COLUMN status SET DEFAULT 'pendiente'::public.status_orcamento_enum;
ALTER TABLE public.tratamento ALTER COLUMN status SET DEFAULT 'planificado'::public.status_tratamento_enum;
ALTER TABLE public.financeiro ALTER COLUMN status SET DEFAULT 'pendiente'::public.status_financeiro_enum;
ALTER TABLE public.financeiro ALTER COLUMN tipo SET DEFAULT 'ingreso'::public.tipo_financeiro_enum;

ALTER TABLE public.clinica ADD COLUMN IF NOT EXISTS moeda TEXT NOT NULL DEFAULT 'USD';
