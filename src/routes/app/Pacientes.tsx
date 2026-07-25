import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { FormDialog } from "@/components/FormDialog";
import { SimpleForm } from "@/components/SimpleForm";
import { PatientFicha } from "@/components/PatientFicha";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { dateBR } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/app/Pacientes")({ component: Page });

function Page() {
  const { clinicaId } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [fichaId, setFichaId] = useState<string | null>(null);

  const { data: rows = [] } = useQuery({
    queryKey: ["paciente", clinicaId],
    enabled: !!clinicaId,
    queryFn: async () => {
      const { data, error } = await supabase.from("paciente").select("*").eq("clinica_id", clinicaId!).order("nome");
      if (error) throw error; return data ?? [];
    },
  });

  const save = async (v: any) => {
    setBusy(true);
    try {
      const payload: any = {
        ...v,
        alergias: v.alergias ? String(v.alergias).split(",").map((s: string) => s.trim()).filter(Boolean) : null,
        medicamentos_uso: v.medicamentos_uso ? String(v.medicamentos_uso).split(",").map((s: string) => s.trim()).filter(Boolean) : null,
      };
      if (edit?.id) {
        const { error } = await supabase.from("paciente").update(payload).eq("id", edit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("paciente").insert({ ...payload, clinica_id: clinicaId });
        if (error) throw error;
      }
      toast.success("Guardado"); setOpen(false); setEdit(null);
      qc.invalidateQueries({ queryKey: ["paciente", clinicaId] });
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar paciente?")) return;
    const { error } = await supabase.from("paciente").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Eliminado"); qc.invalidateQueries({ queryKey: ["paciente", clinicaId] }); }
  };

  const editInitial = edit ? {
    ...edit,
    alergias: Array.isArray(edit.alergias) ? edit.alergias.join(", ") : edit.alergias ?? "",
    medicamentos_uso: Array.isArray(edit.medicamentos_uso) ? edit.medicamentos_uso.join(", ") : edit.medicamentos_uso ?? "",
  } : {};

  return (
    <>
      <PageHeader title="Pacientes" description="Registro completo con anamnesis" actions={
        <Button onClick={() => { setEdit({}); setOpen(true); }}><Plus className="size-4 mr-1" />Nuevo paciente</Button>
      } />
      <DataTable
        rows={rows as any[]}
        searchKeys={["nome" as any, "cpf" as any, "telefone" as any]}
        columns={[
          { key: "nome", header: "Nombre" },
          { key: "cpf", header: "C.I / RUC" },
          { key: "telefone", header: "Teléfono" },
          { key: "convenio", header: "Convenio" },
          { key: "data_nascimento", header: "Nac.", render: (r: any) => dateBR(r.data_nascimento) },
          { key: "alergias", header: "Alergias", render: (r: any) => r.alergias?.length ? <Badge variant="destructive">{r.alergias.length}</Badge> : "—" },
          { key: "_a", header: "", className: "w-28 text-right", render: (r: any) => (
            <div className="flex justify-end gap-1">
              <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setFichaId(r.id); }}><Eye className="size-4" /></Button>
              <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setEdit(r); setOpen(true); }}><Pencil className="size-4" /></Button>
              <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); remove(r.id); }}><Trash2 className="size-4" /></Button>
            </div>
          ) },
        ]}
        onRowClick={(r: any) => setFichaId(r.id)}
      />
      <FormDialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEdit(null); }} title={edit?.id ? "Editar paciente" : "Nuevo paciente"} wide>
        <SimpleForm
          initial={editInitial}
          busy={busy}
          onSubmit={save}
          fields={[
            { name: "nome", label: "Nombre", required: true, col: 2 },
            { name: "cpf", label: "C.I / RUC" }, { name: "rg", label: "Documento secundario" },
            { name: "data_nascimento", label: "Nacimiento", type: "date" },
            { name: "telefone", label: "Teléfono", type: "tel" },
            { name: "email", label: "Email", type: "email" },
            { name: "profissao", label: "Profesión" },
            { name: "convenio", label: "Convenio" }, { name: "numero_convenio", label: "Nº del convenio" },
            { name: "alergias", label: "Alergias (separar por coma)", col: 2 },
            { name: "medicamentos_uso", label: "Medicamentos en uso (separar por coma)", col: 2 },
            { name: "doencas_preexistentes", label: "Enfermedades preexistentes", type: "textarea", col: 2 },
            { name: "observacoes_anamnese", label: "Observaciones de la anamnesis", type: "textarea", col: 2 },
          ]}
        />
      </FormDialog>
      <PatientFicha pacienteId={fichaId} open={!!fichaId} onOpenChange={(o) => !o && setFichaId(null)} />
    </>
  );
}
