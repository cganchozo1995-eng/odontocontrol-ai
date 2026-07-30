import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { FormDialog } from "@/components/FormDialog";
import { SimpleForm } from "@/components/SimpleForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Plus, Mail, Phone, IdCard, Pencil, Trash2, CalendarDays } from "lucide-react";
import { brl, initials } from "@/lib/format";
import { addDays, format, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

export const Route = createFileRoute("/app/Profissionais")({ component: Page });

const ESPS: { value: string; label: string }[] = [
  { value: "odontologia_general", label: "Odontología General" },
  { value: "ortodoncia", label: "Ortodoncia" },
  { value: "endodoncia", label: "Endodoncia" },
  { value: "periodoncia", label: "Periodoncia" },
  { value: "implantologia", label: "Implantología" },
  { value: "odontopediatria", label: "Odontopediatría" },
  { value: "protesis", label: "Prótesis" },
  { value: "cirugia_oral", label: "Cirugía Oral" },
  { value: "estetica", label: "Estética" },
  { value: "otra", label: "Otra" },
];
const ESPS_LABEL: Record<string, string> = Object.fromEntries(ESPS.map((e) => [e.value, e.label]));

function Page() {
  const { clinicaId } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const ws = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(ws, i));
  const from = format(weekDays[0], "yyyy-MM-dd");
  const to = format(weekDays[6], "yyyy-MM-dd");

  const { data: rows = [] } = useQuery({
    queryKey: ["profissional", clinicaId], enabled: !!clinicaId,
    queryFn: async () => (await supabase.from("profissional").select("*").eq("clinica_id", clinicaId!).order("nome")).data ?? [],
  });
  const { data: cons = [] } = useQuery({
    queryKey: ["prof-cons", clinicaId, from, to], enabled: !!clinicaId,
    queryFn: async () => (await supabase.from("consulta").select("profissional_id,data,status,valor_total").eq("clinica_id", clinicaId!).gte("data", from).lte("data", to)).data ?? [],
  });

  const save = async (v: any) => {
    setBusy(true);
    try {
      if (edit?.id) {
        const { error } = await supabase.from("profissional").update(v).eq("id", edit.id); if (error) throw error;
      } else {
        const { error } = await supabase.from("profissional").insert({ ...v, clinica_id: clinicaId, ativo: true }); if (error) throw error;
      }
      toast.success("Guardado"); setOpen(false); setEdit(null);
      qc.invalidateQueries({ queryKey: ["profissional", clinicaId] });
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar?")) return;
    const { error } = await supabase.from("profissional").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Eliminado"); qc.invalidateQueries({ queryKey: ["profissional", clinicaId] }); }
  };

  const filtered = rows.filter((r: any) => !q || (r.nome + " " + r.especialidade + " " + (r.cro_numero ?? "")).toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader title="Profesionales" description="Equipo clínico con KPIs y agenda" actions={
        <Button onClick={() => { setEdit({ percentual_repasse: 50 }); setOpen(true); }}><Plus className="size-4 mr-1" />Nuevo</Button>
      } />
      <Input placeholder="Buscar nombre, especialidad, CRO..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md mb-4" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((r: any) => {
          const meus = cons.filter((c: any) => c.profissional_id === r.id);
          const realizadas = meus.filter((c: any) => c.status === "concluida").length;
          const fat = meus.filter((c: any) => c.status === "concluida").reduce((a: number, c: any) => a + Number(c.valor_total ?? 0), 0);
          const noShow = meus.filter((c: any) => c.status === "ausente").length;
          return (
            <Card key={r.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar className="size-14"><AvatarFallback className="bg-primary text-primary-foreground">{initials(r.nome)}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{r.nome}</div>
                    <div className="text-xs text-muted-foreground">{ESPS_LABEL[r.especialidade] ?? "—"}</div>
                    <div className="flex gap-1 mt-1">
                      {r.ativo ? <Badge>Activo</Badge> : <Badge variant="secondary">Inactivo</Badge>}
                      {r.cro_numero && <Badge variant="outline"><IdCard className="size-3 mr-1" />Matrícula {r.cro_numero}{r.cro_uf ? ` / ${r.cro_uf}` : ""}</Badge>}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  {r.telefone && <div className="flex items-center gap-1"><Phone className="size-3" />{r.telefone}</div>}
                  {r.email && <div className="flex items-center gap-1"><Mail className="size-3" />{r.email}</div>}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t">
                  <Kpi label="Semana" value={meus.length} />
                  <Kpi label="Realizadas" value={realizadas} />
                  <Kpi label="Facturado" value={brl(fat)} />
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><CalendarDays className="size-3" />Semana</div>
                  <div className="flex gap-1">
                    {weekDays.map((d) => {
                      const day = format(d, "yyyy-MM-dd");
                      const n = meus.filter((c: any) => c.data === day).length;
                      return (
                        <div key={day} className="flex-1 text-center">
                          <div className="text-[10px] text-muted-foreground">{format(d, "EEEEEE", { locale: es })}</div>
                          <div className={`h-7 rounded text-xs font-medium flex items-center justify-center ${n > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{n}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">Comisión {r.percentual_repasse}% · No-shows: {noShow}</span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEdit(r); setOpen(true); }}><Pencil className="size-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="size-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && <div className="col-span-full text-center text-muted-foreground py-10">Ningún profesional.</div>}
      </div>

      <FormDialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEdit(null); }} title={edit?.id ? "Editar profesional" : "Nuevo profesional"} wide>
        <SimpleForm
          initial={edit ?? {}}
          busy={busy}
          onSubmit={save}
          fields={[
            { name: "nome", label: "Nombre", required: true, col: 2 },
            { name: "especialidade", label: "Especialidad", type: "select", options: ESPS },
            { name: "cro_numero", label: "Nº de matrícula profesional" },
            { name: "cro_uf", label: "Provincia / Región" },
            { name: "telefone", label: "Teléfono", type: "tel" },
            { name: "email", label: "Email", type: "email" },
            { name: "percentual_repasse", label: "Comisión %", type: "number", step: "0.01" },
          ]}
        />
      </FormDialog>
    </>
  );
}

function Kpi({ label, value }: { label: string; value: any }) {
  return <div><div className="text-base font-bold text-primary">{value}</div><div className="text-[10px] uppercase text-muted-foreground">{label}</div></div>;
}
