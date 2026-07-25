import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { CURRENCIES } from "@/lib/format";
import { toast } from "sonner";
import { addDays, format } from "date-fns";

export const Route = createFileRoute("/app/Onboarding")({ component: Page });

function Page() {
  const { user, refresh } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<any>({
    nome: "", cro_responsavel: "", telefone: "",
    cor_primaria: "#06B6D4",
    moeda: "USD",
    membros: [{ nome: "", email: "", role: "recepcionista" }],
    profissionais: [{ nome: "", cro_numero: "", especialidade: "" }],
    procedimentos: [{ nome: "", codigo_tuss: "", valor: 0, duracao_minutos: 60 }],
  });

  const finalize = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const { data: c, error } = await supabase.from("clinica").insert({
        nome: data.nome, cro_responsavel: data.cro_responsavel, telefone: data.telefone,
        cor_primaria: data.cor_primaria, moeda: data.moeda || "USD",
        owner_nome: user.user_metadata?.nome ?? user.email,
        owner_email: user.email, status: "trial",
        trial_ate: format(addDays(new Date(), 14), "yyyy-MM-dd"),
      }).select().single();
      if (error) throw error;

      await supabase.from("membro_equipe").insert({
        clinica_id: c.id, user_id: user.id,
        nome: user.user_metadata?.nome ?? user.email ?? "Owner",
        email: user.email!, role: "owner",
      });

      const extras = data.membros.filter((m: any) => m.email).map((m: any) => ({ ...m, clinica_id: c.id }));
      if (extras.length) await supabase.from("membro_equipe").insert(extras);

      const profs = data.profissionais.filter((p: any) => p.nome).map((p: any) => ({ ...p, clinica_id: c.id }));
      if (profs.length) await supabase.from("profissional").insert(profs);

      const procs = data.procedimentos.filter((p: any) => p.nome).map((p: any) => ({ ...p, clinica_id: c.id, valor: Number(p.valor) || 0, duracao_minutos: Number(p.duracao_minutos) || 60 }));
      if (procs.length) await supabase.from("procedimento").insert(procs);

      toast.success("¡Clínica configurada!");
      await refresh();
      nav({ to: "/app/Dashboard" });
    } catch (err: any) { toast.error(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Configurar clínica (paso {step} de 5)</CardTitle>
          <Progress value={(step / 5) * 100} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <div className="space-y-3">
              <div><Label>Nombre de la clínica *</Label><Input value={data.nome} onChange={(e) => setData({ ...data, nome: e.target.value })} /></div>
              <div><Label>Registro sanitario / CRO</Label><Input value={data.cro_responsavel} onChange={(e) => setData({ ...data, cro_responsavel: e.target.value })} /></div>
              <div><Label>Teléfono</Label><Input value={data.telefone} onChange={(e) => setData({ ...data, telefone: e.target.value })} /></div>
              <div>
                <Label>Moneda</Label>
                <select
                  className="h-9 w-full px-2 rounded-md border bg-background"
                  value={data.moeda}
                  onChange={(e) => setData({ ...data, moeda: e.target.value })}
                >
                  {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <Label>Color primario</Label>
              <Input type="color" value={data.cor_primaria} onChange={(e) => setData({ ...data, cor_primaria: e.target.value })} className="h-12 w-24" />
              <p className="text-sm text-muted-foreground">Usaremos este color en su marca dentro del sistema.</p>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-2">
              <Label>Equipo inicial (opcional — agregue más después)</Label>
              {data.membros.map((m: any, i: number) => (
                <div key={i} className="grid grid-cols-3 gap-2">
                  <Input placeholder="Nombre" value={m.nome} onChange={(e) => { const x = [...data.membros]; x[i].nome = e.target.value; setData({ ...data, membros: x }); }} />
                  <Input placeholder="Email" value={m.email} onChange={(e) => { const x = [...data.membros]; x[i].email = e.target.value; setData({ ...data, membros: x }); }} />
                  <select className="h-9 px-2 rounded-md border bg-background" value={m.role} onChange={(e) => { const x = [...data.membros]; x[i].role = e.target.value; setData({ ...data, membros: x }); }}>
                    <option value="dentista">Dentista</option><option value="recepcionista">Recepcionista</option>
                    <option value="auxiliar">Auxiliar</option><option value="financeiro">Financiero</option><option value="admin">Admin</option>
                  </select>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setData({ ...data, membros: [...data.membros, { nome: "", email: "", role: "recepcionista" }] })}>+ Agregar</Button>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <Label>Profesionales</Label>
                {data.profissionais.map((p: any, i: number) => (
                  <div key={i} className="grid grid-cols-3 gap-2 mt-2">
                    <Input placeholder="Nombre" value={p.nome} onChange={(e) => { const x = [...data.profissionais]; x[i].nome = e.target.value; setData({ ...data, profissionais: x }); }} />
                    <Input placeholder="CRO" value={p.cro_numero} onChange={(e) => { const x = [...data.profissionais]; x[i].cro_numero = e.target.value; setData({ ...data, profissionais: x }); }} />
                    <Input placeholder="Especialidad" value={p.especialidade} onChange={(e) => { const x = [...data.profissionais]; x[i].especialidade = e.target.value; setData({ ...data, profissionais: x }); }} />
                  </div>
                ))}
                <Button variant="outline" size="sm" className="mt-2" onClick={() => setData({ ...data, profissionais: [...data.profissionais, { nome: "", cro_numero: "", especialidade: "" }] })}>+ Profesional</Button>
              </div>
              <div>
                <Label>Procedimientos comunes</Label>
                {data.procedimentos.map((p: any, i: number) => (
                  <div key={i} className="grid grid-cols-4 gap-2 mt-2">
                    <Input placeholder="Nombre" value={p.nome} onChange={(e) => { const x = [...data.procedimentos]; x[i].nome = e.target.value; setData({ ...data, procedimentos: x }); }} />
                    <Input placeholder="TUSS" value={p.codigo_tuss} onChange={(e) => { const x = [...data.procedimentos]; x[i].codigo_tuss = e.target.value; setData({ ...data, procedimentos: x }); }} />
                    <Input placeholder="Valor" type="number" value={p.valor} onChange={(e) => { const x = [...data.procedimentos]; x[i].valor = e.target.value; setData({ ...data, procedimentos: x }); }} />
                    <Input placeholder="Min" type="number" value={p.duracao_minutos} onChange={(e) => { const x = [...data.procedimentos]; x[i].duracao_minutos = e.target.value; setData({ ...data, procedimentos: x }); }} />
                  </div>
                ))}
                <Button variant="outline" size="sm" className="mt-2" onClick={() => setData({ ...data, procedimentos: [...data.procedimentos, { nome: "", codigo_tuss: "", valor: 0, duracao_minutos: 60 }] })}>+ Procedimiento</Button>
              </div>
            </div>
          )}
          {step === 5 && (
            <div className="text-center py-6 space-y-3">
              <h3 className="text-xl font-semibold">¡Listo! 🎉</h3>
              <p className="text-sm text-muted-foreground">Tendrá <b>14 días gratis</b> para experimentar todas las funcionalidades.</p>
            </div>
          )}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" disabled={step === 1} onClick={() => setStep(step - 1)}>Volver</Button>
            {step < 5 ? (
              <Button onClick={() => setStep(step + 1)} disabled={step === 1 && !data.nome}>Continuar</Button>
            ) : (
              <Button onClick={finalize} disabled={busy}>{busy && <Loader2 className="size-4 animate-spin mr-2" />}Finalizar</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
