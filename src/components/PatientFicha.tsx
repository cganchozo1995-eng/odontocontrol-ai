import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { money, fechaES } from "@/lib/format";
import { Mail, Phone, IdCard, Heart, Pill, FileText, Stethoscope, ClipboardList, Receipt, Activity } from "lucide-react";

const ini = (s?: string | null) => (s ?? "?").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

export function PatientFicha({ pacienteId, open, onOpenChange }: {
  pacienteId: string | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { data } = useQuery({
    queryKey: ["ficha", pacienteId],
    enabled: !!pacienteId && open,
    queryFn: async () => {
      const [p, hist, trat, orc, cons] = await Promise.all([
        supabase.from("paciente").select("*").eq("id", pacienteId!).maybeSingle(),
        supabase.from("historico_clinica").select("*").eq("paciente_id", pacienteId!).order("data", { ascending: false }),
        supabase.from("tratamento").select("*").eq("paciente_id", pacienteId!).order("data_inicio", { ascending: false }),
        supabase.from("orcamento").select("*").eq("paciente_id", pacienteId!).order("data", { ascending: false }),
        supabase.from("consulta").select("*").eq("paciente_id", pacienteId!).order("data", { ascending: false }).limit(50),
      ]);
      return { p: p.data as any, hist: hist.data ?? [], trat: trat.data ?? [], orc: orc.data ?? [], cons: cons.data ?? [] };
    },
  });

  const p = data?.p;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader><SheetTitle>Ficha del Paciente</SheetTitle></SheetHeader>
        {!p ? (
          <div className="py-12 text-center text-muted-foreground">Cargando...</div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-accent/40 border">
              <Avatar className="size-16"><AvatarFallback className="bg-primary text-primary-foreground">{ini(p.nome)}</AvatarFallback></Avatar>
              <div className="flex-1">
                <div className="text-lg font-semibold">{p.nome}</div>
                <div className="text-sm text-muted-foreground flex flex-wrap gap-3 mt-1">
                  {p.telefone && <span className="flex items-center gap-1"><Phone className="size-3" />{p.telefone}</span>}
                  {p.email && <span className="flex items-center gap-1"><Mail className="size-3" />{p.email}</span>}
                  {p.cpf && <span className="flex items-center gap-1"><IdCard className="size-3" />{p.cpf}</span>}
                </div>
                <div className="flex gap-2 mt-2">
                  {p.convenio && <Badge variant="outline">{p.convenio}</Badge>}
                  {!!p.alergias?.length && <Badge variant="destructive">{p.alergias.length} alergia(s)</Badge>}
                  <Badge variant="secondary">{data.cons.length} citas</Badge>
                </div>
              </div>
            </div>
            <Tabs defaultValue="dados">
              <TabsList className="grid grid-cols-6 w-full">
                <TabsTrigger value="datos"><IdCard className="size-3 mr-1" />Datos</TabsTrigger>
                <TabsTrigger value="anamnese"><Heart className="size-3 mr-1" />Anamnesis</TabsTrigger>
                <TabsTrigger value="historico"><ClipboardList className="size-3 mr-1" />Historial</TabsTrigger>
                <TabsTrigger value="prontuario"><Stethoscope className="size-3 mr-1" />Expediente</TabsTrigger>
                <TabsTrigger value="orcamentos"><Receipt className="size-3 mr-1" />Presupuestos</TabsTrigger>
                <TabsTrigger value="tratamentos"><Activity className="size-3 mr-1" />Tratamientos</TabsTrigger>
              </TabsList>

              <TabsContent value="datos" className="space-y-2 text-sm pt-4">
                <Row k="Nacimiento" v={fechaES(p.data_nascimento)} />
                <Row k="RG" v={p.rg} />
                <Row k="Profesión" v={p.profissao} />
                <Row k="Convenio" v={p.convenio} />
                <Row k="Nº del convenio" v={p.numero_convenio} />
                {p.endereco && <Row k="Dirección" v={typeof p.endereco === "string" ? p.endereco : JSON.stringify(p.endereco)} />}
              </TabsContent>

              <TabsContent value="anamnese" className="space-y-3 text-sm pt-4">
                <div>
                  <div className="font-medium flex items-center gap-1 mb-1"><Heart className="size-3 text-destructive" />Alergias</div>
                  {p.alergias?.length ? <div className="flex flex-wrap gap-1">{p.alergias.map((a: string) => <Badge key={a} variant="destructive">{a}</Badge>)}</div> : <span className="text-muted-foreground">Ninguna</span>}
                </div>
                <div>
                  <div className="font-medium flex items-center gap-1 mb-1"><Pill className="size-3" />Medicamentos en uso</div>
                  {p.medicamentos_uso?.length ? <div className="flex flex-wrap gap-1">{p.medicamentos_uso.map((m: string) => <Badge key={m} variant="secondary">{m}</Badge>)}</div> : <span className="text-muted-foreground">Ninguno</span>}
                </div>
                <Row k="Enfermedades preexistentes" v={p.doencas_preexistentes} />
                <Row k="Observaciones" v={p.observacoes_anamnese} />
              </TabsContent>

              <TabsContent value="historico" className="space-y-2 pt-4">
                {data.hist.length === 0 && data.cons.length === 0 && <Empty label="Sin historial." />}
                {data.cons.map((c: any) => (
                  <div key={c.id} className="border-l-4 border-l-primary rounded-md p-3 text-sm bg-card border">
                    <div className="flex justify-between"><span className="font-medium">Cita · {c.tipo}</span><span className="text-muted-foreground">{fechaES(c.data)} {c.hora?.slice(0, 5)}</span></div>
                    <div className="text-muted-foreground">{c.profissional_nome} — <Badge variant="outline" className="ml-1">{c.status}</Badge></div>
                    {c.observacoes && <div className="mt-1 text-muted-foreground italic">{c.observacoes}</div>}
                  </div>
                ))}
                {data.hist.map((h: any) => (
                  <div key={h.id} className="border rounded-md p-3 text-sm bg-card">
                    <div className="flex justify-between"><span className="font-medium">{h.tipo}</span><span className="text-muted-foreground">{fechaES(h.data)}</span></div>
                    <div>{h.descricao}</div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="prontuario" className="space-y-2 pt-4">
                {data.cons.filter((c: any) => c.prontuario).length === 0 && <Empty label="Sin notas en el expediente." />}
                {data.cons.filter((c: any) => c.prontuario).map((c: any) => (
                  <div key={c.id} className="border rounded-md p-3 text-sm bg-card">
                    <div className="flex justify-between text-xs text-muted-foreground"><span><FileText className="size-3 inline mr-1" />{fechaES(c.data)} · {c.profissional_nome}</span><Badge variant="outline">{c.tipo}</Badge></div>
                    <div className="mt-2 whitespace-pre-wrap">{c.prontuario}</div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="orcamentos" className="space-y-2 pt-4">
                {data.orc.length === 0 && <Empty label="Ninguno orçamento." />}
                {data.orc.map((o: any) => (
                  <div key={o.id} className="border rounded-md p-3 text-sm bg-card flex justify-between items-center">
                    <div>
                      <div className="font-medium">{o.numero ?? "—"} · {fechaES(o.data)}</div>
                      <div className="text-xs text-muted-foreground">{Array.isArray(o.itens) ? `${o.itens.length} ítem(s)` : "—"} · {o.parcelas}x</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{money(o.total_com_desconto ?? o.total)}</div>
                      <Badge variant="outline">{o.status}</Badge>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="tratamentos" className="space-y-2 pt-4">
                {data.trat.length === 0 && <Empty label="Ninguno tratamento." />}
                {data.trat.map((t: any) => (
                  <div key={t.id} className="border rounded-md p-3 text-sm bg-card">
                    <div className="flex justify-between"><span className="font-medium">{t.descricao}</span><Badge>{t.status}</Badge></div>
                    <div className="text-xs text-muted-foreground">Diente: {t.dente ?? "—"} · {fechaES(t.data_inicio)} → {fechaES(t.data_conclusao)}</div>
                    <div className="mt-1 font-semibold">{money(t.valor_total)}</div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Row({ k, v }: { k: string; v: any }) {
  return <div className="flex justify-between gap-4 py-1.5 border-b last:border-0"><span className="text-muted-foreground">{k}</span><span className="text-right">{v ?? "—"}</span></div>;
}
function Empty({ label }: { label: string }) {
  return <div className="text-center text-muted-foreground text-sm py-8">{label}</div>;
}
