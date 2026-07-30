import { useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GripVertical, Plus, Trash2, Printer, CheckCircle2, Save } from "lucide-react";
import { useMoney } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { PresupuestoPdf } from "./PresupuestoPdf";

type Item = { id: string; nome: string; valor: number; cant: number };

export function PresupuestoSheet({
  open, onOpenChange, presupuesto, procs, pacs, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  presupuesto: any | null;
  procs: any[];
  pacs: any[];
  onSaved: () => void;
}) {
  const { clinicaId, clinica } = useAuth();
  const money = useMoney();
  const [draft, setDraft] = useState<any>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [showPrint, setShowPrint] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!presupuesto) return;
    setDraft({
      ...presupuesto,
      data: presupuesto.data ?? new Date().toISOString().slice(0, 10),
      desconto_pct: Number(presupuesto.desconto_pct ?? 0),
      parcelas: Number(presupuesto.parcelas ?? 1),
      status: presupuesto.status ?? "pendiente",
    });
    const raw = Array.isArray(presupuesto.itens) ? presupuesto.itens : [];
    setItems(raw.map((it: any, i: number) => ({
      id: it.id ?? `i-${i}-${Date.now()}`,
      nome: it.nome ?? "",
      valor: Number(it.valor ?? 0),
      cant: Number(it.cant ?? it.qtd ?? 1),
    })));
  }, [presupuesto]);

  const total = useMemo(() => items.reduce((a, it) => a + it.valor * it.cant, 0), [items]);
  const desc = Number(draft?.desconto_pct ?? 0);
  const totalDesc = total - (total * desc) / 100;

  const onDrag = (r: DropResult) => {
    if (!r.destination) return;
    const next = [...items];
    const [m] = next.splice(r.source.index, 1);
    next.splice(r.destination.index, 0, m);
    setItems(next);
  };

  const addItem = (procId?: string) => {
    if (procId) {
      const p = procs.find((x) => x.id === procId);
      if (!p) return;
      setItems([...items, { id: `i-${Date.now()}`, nome: p.nome, valor: Number(p.valor ?? 0), cant: 1 }]);
    } else {
      setItems([...items, { id: `i-${Date.now()}`, nome: "", valor: 0, cant: 1 }]);
    }
  };

  const save = async () => {
    if (!draft?.paciente_id) { toast.error("Seleccione paciente"); return; }
    setBusy(true);
    try {
      const pac = pacs.find((p: any) => p.id === draft.paciente_id);
      const payload = {
        paciente_id: draft.paciente_id, paciente_nome: pac?.nome,
        numero: draft.numero || `ORC-${Date.now().toString().slice(-6)}`,
        data: draft.data, validade: draft.validade ?? null,
        status: draft.status, parcelas: Number(draft.parcelas), desconto_pct: desc,
        total, total_com_desconto: totalDesc,
        itens: items.map(({ id: _id, ...rest }) => rest),
        observacoes: draft.observacoes ?? null,
      };
      if (draft.id) {
        const { error } = await supabase.from("orcamento").update(payload).eq("id", draft.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("orcamento").insert({ ...payload, clinica_id: clinicaId! });
        if (error) throw error;
      }
      toast.success("Presupuesto guardado");
      onSaved(); onOpenChange(false);
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const aprovar = async () => {
    if (!draft?.id) { toast.error("Guarde primero"); return; }
    if (!confirm("¿Aprobar y generar tratamiento + lanzamiento financiero?")) return;
    try {
      const descTxt = items.map((it) => `${it.cant}x ${it.nome}`).join("; ");
      await supabase.from("orcamento").update({ status: "aprobado" }).eq("id", draft.id);
      await supabase.from("tratamento").insert({
        clinica_id: clinicaId!, paciente_id: draft.paciente_id, paciente_nome: draft.paciente_nome,
        profissional_id: draft.profissional_id ?? null, descricao: descTxt || draft.numero,
        status: "planificado", data_inicio: new Date().toISOString().slice(0, 10),
        valor_total: totalDesc,
      });
      await supabase.from("financeiro").insert({
        clinica_id: clinicaId!, paciente_id: draft.paciente_id, orcamento_id: draft.id,
        tipo: "ingreso", status: "pendiente", descricao: `Presupuesto ${draft.numero ?? ""}`.trim(),
        valor: totalDesc, data: new Date().toISOString().slice(0, 10),
        categoria: "Tratamiento", total_parcelas: Number(draft.parcelas), parcela_atual: 1,
      });
      toast.success("Presupuesto aprobado y tratamiento creado");
      onSaved(); onOpenChange(false);
    } catch (e: any) { toast.error(e.message); }
  };

  if (!draft) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader><SheetTitle>{draft.id ? `Presupuesto ${draft.numero ?? ""}` : "Nuevo presupuesto"}</SheetTitle></SheetHeader>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Paciente</Label>
                <Select value={draft.paciente_id ?? ""} onValueChange={(v) => setDraft({ ...draft, paciente_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                  <SelectContent>{pacs.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Fecha</Label><Input type="date" value={draft.data ?? ""} onChange={(e) => setDraft({ ...draft, data: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Validez</Label><Input type="date" value={draft.validade ?? ""} onChange={(e) => setDraft({ ...draft, validade: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Cuotas</Label><Input type="number" value={draft.parcelas} onChange={(e) => setDraft({ ...draft, parcelas: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Descuento %</Label><Input type="number" step="0.01" value={draft.desconto_pct} onChange={(e) => setDraft({ ...draft, desconto_pct: e.target.value })} /></div>
              <div className="col-span-2 space-y-1.5">
                <Label>Estado</Label>
                <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[
                      { v: "pendiente", l: "Pendiente" },
                      { v: "en_negociacion", l: "En negociación" },
                      { v: "aprobado", l: "Aprobado" },
                      { v: "rechazado", l: "Rechazado" },
                    ].map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-lg p-3 bg-card">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium text-sm">Ítems (arrastre para reordenar)</div>
                <div className="flex gap-2">
                  <Select onValueChange={(v) => addItem(v)}>
                    <SelectTrigger className="h-8 w-48 text-xs"><SelectValue placeholder="+ Procedimiento" /></SelectTrigger>
                    <SelectContent>{procs.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.nome} — {money(p.valor)}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={() => addItem()}><Plus className="size-3 mr-1" />Vacío</Button>
                </div>
              </div>
              <DragDropContext onDragEnd={onDrag}>
                <Droppable droppableId="itens">
                  {(prov) => (
                    <div {...prov.droppableProps} ref={prov.innerRef} className="space-y-1.5">
                      {items.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">Sin ítems.</div>}
                      {items.map((it, idx) => (
                        <Draggable key={it.id} draggableId={it.id} index={idx}>
                          {(p, snap) => (
                            <div ref={p.innerRef} {...p.draggableProps}
                              className={`flex gap-2 items-center bg-background border rounded px-2 py-1.5 ${snap.isDragging ? "shadow-lg" : ""}`}>
                              <span {...p.dragHandleProps} className="text-muted-foreground cursor-grab"><GripVertical className="size-4" /></span>
                              <Input value={it.nome} onChange={(e) => setItems(items.map((x) => x.id === it.id ? { ...x, nome: e.target.value } : x))} placeholder="Ítem" className="h-8 flex-1" />
                              <Input type="number" step="0.01" value={it.valor} onChange={(e) => setItems(items.map((x) => x.id === it.id ? { ...x, valor: Number(e.target.value) } : x))} className="h-8 w-24" />
                              <Input type="number" value={it.cant} onChange={(e) => setItems(items.map((x) => x.id === it.id ? { ...x, cant: Number(e.target.value) } : x))} className="h-8 w-14" />
                              <div className="text-xs w-20 text-right font-medium">{money(it.valor * it.cant)}</div>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setItems(items.filter((x) => x.id !== it.id))}><Trash2 className="size-3" /></Button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {prov.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>

            <div className="rounded-lg border p-4 bg-primary/5 space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{money(total)}</span></div>
              <div className="flex justify-between"><span>Descuento ({desc}%)</span><span>− {money(total - totalDesc)}</span></div>
              <div className="flex justify-between text-lg font-bold border-t pt-2 mt-1"><span>Total</span><span className="text-primary">{money(totalDesc)}</span></div>
              <div className="text-xs text-muted-foreground text-right">{draft.parcelas}x de {money(totalDesc / Math.max(1, Number(draft.parcelas)))}</div>
            </div>

            <div className="space-y-1.5">
              <Label>Observaciones</Label>
              <Input value={draft.observacoes ?? ""} onChange={(e) => setDraft({ ...draft, observacoes: e.target.value })} />
            </div>

            <div className="flex flex-wrap gap-2 sticky bottom-0 bg-background py-3 border-t">
              <Button onClick={save} disabled={busy}><Save className="size-4 mr-1" />Guardar</Button>
              <Button variant="outline" onClick={() => setShowPrint(true)} disabled={!draft.id}><Printer className="size-4 mr-1" />Generar PDF</Button>
              {draft.status !== "aprobado" && <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700" onClick={aprovar} disabled={!draft.id}><CheckCircle2 className="size-4 mr-1" />Aprobar → Tratamiento</Button>}
              {draft.status === "aprobado" && <Badge className="ml-auto self-center bg-emerald-100 text-emerald-800">Aprobado</Badge>}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showPrint} onOpenChange={setShowPrint}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader><SheetTitle>Visualización — Presupuesto</SheetTitle></SheetHeader>
          <div className="mt-4">
            <div className="flex justify-end mb-2 no-print"><Button onClick={() => window.print()}><Printer className="size-4 mr-1" />Imprimir / Guardar PDF</Button></div>
            <PresupuestoPdf data={{ clinica: clinica ?? undefined, presupuesto: { ...draft, itens: items, total, total_com_desconto: totalDesc } }} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
