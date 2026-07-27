-- 1) app_config: SELECT admin only (removes "always true" SELECT for authenticated)
DROP POLICY IF EXISTS app_config_read ON public.app_config;
CREATE POLICY app_config_read ON public.app_config
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- 2) clinica_insert: only admins may create clinics (removes "WITH CHECK true")
DROP POLICY IF EXISTS clinica_insert ON public.clinica;
CREATE POLICY clinica_insert ON public.clinica
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- 3) Remove permissive anon policies
DROP POLICY IF EXISTS clinica_public_by_slug ON public.clinica;
DROP POLICY IF EXISTS profissional_public_select ON public.profissional;
DROP POLICY IF EXISTS consulta_public_insert ON public.consulta;
DROP POLICY IF EXISTS paciente_public_insert ON public.paciente;

-- 4) Safe public views (only non-sensitive columns) for the public booking page
DROP VIEW IF EXISTS public.clinica_publica;
CREATE VIEW public.clinica_publica
WITH (security_invoker = true) AS
  SELECT id, nome, slug, cor_primaria, logo_url, moeda, telefone
  FROM public.clinica
  WHERE slug IS NOT NULL;

-- The view still applies RLS of the underlying table via security_invoker,
-- but we also need a matching anon SELECT policy on clinica limited to public columns.
-- Simpler: keep RLS strict on clinica, and instead make the view SECURITY DEFINER-style
-- by wrapping it as a function. We use a table-returning function for tight control.
DROP VIEW IF EXISTS public.clinica_publica;

CREATE OR REPLACE FUNCTION public.get_clinica_publica(p_slug text)
RETURNS TABLE (
  id uuid,
  nome text,
  slug text,
  cor_primaria text,
  logo_url text,
  moeda text,
  telefone text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.nome, c.slug, c.cor_primaria, c.logo_url, c.moeda, c.telefone
  FROM public.clinica c
  WHERE c.slug = p_slug
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_clinica_publica(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_clinica_publica(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.list_profissionais_publicos(p_clinica_id uuid)
RETURNS TABLE (
  id uuid,
  clinica_id uuid,
  nome text,
  especialidade especialidade_enum,
  foto_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.clinica_id, p.nome, p.especialidade, p.foto_url
  FROM public.profissional p
  WHERE p.clinica_id = p_clinica_id AND p.ativo = true
  ORDER BY p.nome;
$$;

REVOKE ALL ON FUNCTION public.list_profissionais_publicos(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_profissionais_publicos(uuid) TO anon, authenticated;

-- Procedimento already exposes only ativo=true via anon SELECT policy; nothing to change.

-- 5) Atomic, validated public booking (replaces anonymous INSERTs)
CREATE OR REPLACE FUNCTION public.create_public_booking(
  p_slug text,
  p_profissional_id uuid,
  p_procedimento_id uuid,
  p_data date,
  p_hora time,
  p_nome text,
  p_telefone text,
  p_email text DEFAULT NULL,
  p_data_nascimento date DEFAULT NULL,
  p_convenio text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clinica_id uuid;
  v_paciente_id uuid;
  v_consulta_id uuid;
  v_proc_id uuid;
  v_proc_nome text;
  v_proc_valor numeric;
  v_proc_dur integer;
BEGIN
  IF p_nome IS NULL OR length(btrim(p_nome)) < 2 THEN
    RAISE EXCEPTION 'Nombre inválido';
  END IF;
  IF p_telefone IS NULL OR length(btrim(p_telefone)) < 6 THEN
    RAISE EXCEPTION 'Teléfono inválido';
  END IF;
  IF p_data IS NULL OR p_data < CURRENT_DATE THEN
    RAISE EXCEPTION 'Fecha inválida';
  END IF;

  SELECT id INTO v_clinica_id FROM public.clinica WHERE slug = p_slug LIMIT 1;
  IF v_clinica_id IS NULL THEN
    RAISE EXCEPTION 'Clínica no encontrada';
  END IF;

  PERFORM 1 FROM public.profissional
    WHERE id = p_profissional_id AND clinica_id = v_clinica_id AND ativo = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profesional inválido';
  END IF;

  SELECT id, nome, valor, duracao_minutos
    INTO v_proc_id, v_proc_nome, v_proc_valor, v_proc_dur
  FROM public.procedimento
    WHERE id = p_procedimento_id AND clinica_id = v_clinica_id AND ativo = true;
  IF v_proc_id IS NULL THEN
    RAISE EXCEPTION 'Procedimiento inválido';
  END IF;

  INSERT INTO public.paciente (clinica_id, nome, telefone, email, data_nascimento, convenio)
  VALUES (
    v_clinica_id,
    btrim(p_nome),
    btrim(p_telefone),
    NULLIF(btrim(p_email), ''),
    p_data_nascimento,
    NULLIF(btrim(p_convenio), '')
  )
  RETURNING id INTO v_paciente_id;

  INSERT INTO public.consulta (
    clinica_id, paciente_id, paciente_nome,
    profissional_id, data, hora,
    duracao_minutos, tipo, status, valor_total, procedimentos
  ) VALUES (
    v_clinica_id, v_paciente_id, btrim(p_nome),
    p_profissional_id, p_data, p_hora,
    COALESCE(v_proc_dur, 60),
    'consulta'::tipo_consulta_enum,
    'programada'::status_consulta_enum,
    v_proc_valor,
    jsonb_build_array(jsonb_build_object('id', v_proc_id, 'nome', v_proc_nome, 'valor', v_proc_valor))
  )
  RETURNING id INTO v_consulta_id;

  RETURN v_consulta_id;
END $$;

REVOKE ALL ON FUNCTION public.create_public_booking(text,uuid,uuid,date,time,text,text,text,date,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_public_booking(text,uuid,uuid,date,time,text,text,text,date,text) TO anon, authenticated;

-- 6) Lock down internal SECURITY DEFINER helpers
-- Trigger functions: not called directly by clients
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.gen_clinica_slug() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_consulta_conflict() FROM PUBLIC;

-- RLS helpers: needed by authenticated role for policy evaluation; deny anon
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

REVOKE ALL ON FUNCTION public.is_clinica_admin(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_clinica_admin(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_clinica_admin(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.user_clinica_ids() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.user_clinica_ids() FROM anon;
GRANT EXECUTE ON FUNCTION public.user_clinica_ids() TO authenticated;