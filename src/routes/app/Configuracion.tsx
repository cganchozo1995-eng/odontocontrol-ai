import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { brl, dateBR } from "@/lib/format";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { BookingLinkCard } from "@/components/booking-link-card";

export const Route = createFileRoute("/app/Configuracoes")({ component: Page });

function Page() {
  const { clinica, refresh } = useAuth();
  const qc = useQueryClient();
  const [v, setV] = useState<any>(clinica ?? {});
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!clinica) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("clinica").update({
        nome: v.nome, cnpj: v.cnpj, cro_responsavel: v.cro_responsavel,
        telefone: v.telefone, email: v.email, cor_primaria: v.cor_primaria, logo_url: v.logo_url,
      }).eq("id", clinica.id);
      if (error) throw error;
      toast.success("Guardado");
      await refresh();
      qc.invalidateQueries();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Configuración" />
      <div className="mb-4 max-w-3xl"><BookingLinkCard slug={clinica?.slug} /></div>
      <Tabs defaultValue="clinica">
        <TabsList className="grid grid-cols-4 max-w-2xl">
          <TabsTrigger value="clinica">Clínica</TabsTrigger>
          <TabsTrigger value="equipe">Equipo</TabsTrigger>
          <TabsTrigger value="aparencia">Apariencia</TabsTrigger>
          <TabsTrigger value="cobranca">Cobranza</TabsTrigger>
        </TabsList>

        <TabsContent value="clinica">
          <Card><CardContent className="p-6 space-y-4 max-w-2xl">
            <div className="grid grid-cols-2 gap-3">
              <Field l="Nombre" v={v.nome} on={(x) => setV({ ...v, nome: x })} />
              <Field l="CNPJ" v={v.cnpj} on={(x) => setV({ ...v, cnpj: x })} />
              <Field l="CRO Responsable" v={v.cro_responsavel} on={(x) => setV({ ...v, cro_responsavel: x })} />
              <Field l="Teléfono" v={v.telefone} on={(x) => setV({ ...v, telefone: x })} />
              <Field l="Email" v={v.email} on={(x) => setV({ ...v, email: x })} />
              <Field l="Slug público" v={v.slug} on={() => {}} disabled />
            </div>
            <div className="text-xs text-muted-foreground">Enlace público de reserva: <code>/agendar/{v.slug}</code></div>
            <div className="flex justify-end"><Button onClick={save} disabled={busy}>{busy && <Loader2 className="size-4 animate-spin mr-1" />}Guardar</Button></div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="equipe">
          <Card><CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Gestione miembros, cargos y permisos en <a href="/app/Equipe" className="text-primary underline">Equipo</a>.</p>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="aparencia">
          <Card><CardContent className="p-6 space-y-4 max-w-2xl">
            <Field l="Color primario (hex)" v={v.cor_primaria} on={(x) => setV({ ...v, cor_primaria: x })} placeholder="#06B6D4" />
            <Field l="Logo URL" v={v.logo_url} on={(x) => setV({ ...v, logo_url: x })} placeholder="https://..." />
            <div className="flex items-center gap-2">
              <div className="size-10 rounded-md border" style={{ background: v.cor_primaria || "#06B6D4" }} />
              <span className="text-sm text-muted-foreground">Vista previa</span>
            </div>
            <div className="flex justify-end"><Button onClick={save} disabled={busy}>{busy && <Loader2 className="size-4 animate-spin mr-1" />}Guardar</Button></div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="cobranca">
          <Card><CardContent className="p-6 space-y-4 max-w-2xl">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Info l="Plan actual" v={<Badge>{clinica?.plano}</Badge>} />
              <Info l="Estado de cobranza" v={<Badge variant={clinica?.status_cobranca === "ativo" ? "default" : "destructive"}>{clinica?.status_cobranca}</Badge>} />
              <Info l="Valor mensual" v={brl(clinica?.valor_mensal ?? 0)} />
              <Info l="Prueba hasta" v={dateBR(clinica?.trial_ate)} />
            </div>
            <p className="text-sm text-muted-foreground">Para cambiar el plan o el método de pago, póngase en contacto con el soporte.</p>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

function Field({ l, v, on, disabled, placeholder }: { l: string; v: any; on: (x: string) => void; disabled?: boolean; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <Label>{l}</Label>
      <Input value={v ?? ""} onChange={(e) => on(e.target.value)} disabled={disabled} placeholder={placeholder} />
    </div>
  );
}

function Info({ l, v }: any) {
  return (
    <div>
      <div className="text-xs uppercase text-muted-foreground">{l}</div>
      <div className="mt-1">{v}</div>
    </div>
  );
}
