
ALTER TYPE public.status_consulta_enum RENAME VALUE 'agendada' TO 'programada';
ALTER TYPE public.status_consulta_enum RENAME VALUE 'em_atendimento' TO 'en_atencion';
ALTER TYPE public.status_consulta_enum RENAME VALUE 'faltou' TO 'ausente';

ALTER TYPE public.tipo_consulta_enum RENAME VALUE 'avaliacao' TO 'evaluacion';
ALTER TYPE public.tipo_consulta_enum RENAME VALUE 'retorno' TO 'seguimiento';
ALTER TYPE public.tipo_consulta_enum RENAME VALUE 'procedimento' TO 'procedimiento';
ALTER TYPE public.tipo_consulta_enum RENAME VALUE 'urgencia' TO 'urgencia_odontologica';

ALTER TYPE public.tipo_historico_enum RENAME VALUE 'anamnese' TO 'anamnesis';
ALTER TYPE public.tipo_historico_enum RENAME VALUE 'exame' TO 'examen';
ALTER TYPE public.tipo_historico_enum RENAME VALUE 'procedimento' TO 'procedimiento';
ALTER TYPE public.tipo_historico_enum RENAME VALUE 'observacao' TO 'observacion';
ALTER TYPE public.tipo_historico_enum RENAME VALUE 'receita' TO 'receta';

CREATE OR REPLACE FUNCTION public.check_consulta_conflict()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  novo_inicio TIMESTAMP;
  novo_fim TIMESTAMP;
  conflito_count INT;
BEGIN
  IF NEW.status = 'cancelada' THEN
    RETURN NEW;
  END IF;
  novo_inicio := (NEW.data::text || ' ' || NEW.hora::text)::timestamp;
  novo_fim := novo_inicio + (COALESCE(NEW.duracao_minutos, 60) || ' minutes')::interval;

  SELECT COUNT(*) INTO conflito_count
  FROM public.consulta c
  WHERE c.profissional_id = NEW.profissional_id
    AND c.clinica_id = NEW.clinica_id
    AND c.id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND c.status <> 'cancelada'
    AND c.data = NEW.data
    AND tstzrange(
          (c.data::text || ' ' || c.hora::text)::timestamp,
          (c.data::text || ' ' || c.hora::text)::timestamp + (COALESCE(c.duracao_minutos, 60) || ' minutes')::interval,
          '[)'
        ) && tstzrange(novo_inicio, novo_fim, '[)');

  IF conflito_count > 0 THEN
    RAISE EXCEPTION 'Horario en conflicto con otra cita de este profesional.' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$function$;
