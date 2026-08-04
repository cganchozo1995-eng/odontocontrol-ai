-- 1) Remove cross-tenant public read of procedimento
DROP POLICY IF EXISTS "procedimento_public_select" ON public.procedimento;
REVOKE SELECT ON public.procedimento FROM anon;

-- Clinic-scoped public catalog via definer function
CREATE OR REPLACE FUNCTION public.list_procedimentos_publicos(p_clinica_id uuid)
RETURNS TABLE(id uuid, clinica_id uuid, nome text, descricao text, valor numeric, duracao_minutos integer, categoria text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.id, p.clinica_id, p.nome, p.descricao, p.valor, p.duracao_minutos, p.categoria
  FROM public.procedimento p
  WHERE p.clinica_id = p_clinica_id AND p.ativo = true
  ORDER BY p.nome;
$$;

-- 2) Remove JWT-email-based clinic access (membership/admin policies remain)
DROP POLICY IF EXISTS "clinica_select_own_owner" ON public.clinica;

-- 3) hotmart_pagamento: explicit deny of writes for anon/authenticated
REVOKE INSERT, UPDATE, DELETE ON public.hotmart_pagamento FROM anon, authenticated;
REVOKE SELECT ON public.hotmart_pagamento FROM anon;
GRANT SELECT ON public.hotmart_pagamento TO authenticated;
GRANT ALL ON public.hotmart_pagamento TO service_role;
DROP POLICY IF EXISTS "Solo super admin ve pagos" ON public.hotmart_pagamento;
CREATE POLICY "hotmart_pagamento_admin_select" ON public.hotmart_pagamento
  FOR SELECT TO authenticated USING (public.is_admin());

-- 4) SECURITY DEFINER function execute grants: least privilege
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_clinica_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.user_clinica_ids() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_clinica_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_clinica_ids() TO authenticated;

REVOKE ALL ON FUNCTION public.get_clinica_publica(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.list_profissionais_publicos(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.list_procedimentos_publicos(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_public_booking(text, uuid, uuid, date, time without time zone, text, text, text, date, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_clinica_publica(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_profissionais_publicos(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_procedimentos_publicos(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_public_booking(text, uuid, uuid, date, time without time zone, text, text, text, date, text) TO anon, authenticated;

-- trigger functions must not be callable via the API
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.gen_clinica_slug() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_consulta_conflict() FROM PUBLIC, anon, authenticated;