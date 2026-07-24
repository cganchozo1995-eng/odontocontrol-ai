-- Rename especialidade_enum values from Portuguese to Spanish, and add missing ones.
ALTER TYPE public.especialidade_enum RENAME VALUE 'Clinico_geral' TO 'odontologia_general';
ALTER TYPE public.especialidade_enum RENAME VALUE 'Ortodontia' TO 'ortodoncia';
ALTER TYPE public.especialidade_enum RENAME VALUE 'Implantodontia' TO 'implantologia';
ALTER TYPE public.especialidade_enum RENAME VALUE 'Endodontia' TO 'endodoncia';
ALTER TYPE public.especialidade_enum RENAME VALUE 'Periodontia' TO 'periodoncia';
ALTER TYPE public.especialidade_enum RENAME VALUE 'Estetica' TO 'estetica';
ALTER TYPE public.especialidade_enum RENAME VALUE 'Cirurgia' TO 'cirugia_oral';
ALTER TYPE public.especialidade_enum RENAME VALUE 'Outro' TO 'otra';
ALTER TYPE public.especialidade_enum ADD VALUE IF NOT EXISTS 'odontopediatria';
ALTER TYPE public.especialidade_enum ADD VALUE IF NOT EXISTS 'protesis';