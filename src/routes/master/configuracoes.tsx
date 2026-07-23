import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Mail, ExternalLink, Info, CreditCard, Copy, Check, Plus, Pencil, Trash2, Link as LinkIcon, KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  upsertHotmartPlano,
  deleteHotmartPlano,
  saveHotmartHottok,
  getHotmartHottok,
} from "@/lib/hotmart.functions";

export const Route = createFileRoute("/master/configuracoes")({ component: Page });

type Plano = {
  id: string;
  nome: string;
  descricao: string | null;
  valor: number;
  moeda: string;
  ciclo: string;
  url_checkout: string;
  hotmart_product_id: string | null;
  hotmart_offer_code: string | null;
  ativo: boolean;
  ordem: number;
};

function Page() {
  return (
    <>
      <PageHeader title="Configuración del sistema" description="Integraciones globales y modo de operación" />
      <div className="space-y-4 max-w-6xl">
        <HotmartSection />
        <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Mail className="size-5" />Envío de correos (modo STUB)
            </div>
            <div className="bg-amber-50 border border-amber-300 rounded p-3 text-sm text-amber-900 flex gap-2">
              <Info className="size-4 mt-0.5 shrink-0" />
              <div>
                Los correos (bienvenida, confirmación de cita, restablecimiento de contraseña) están en modo <b>stub</b>: solo se registran en el log y no salen de la aplicación.
              </div>
            </div>
            <div>
              <div className="font-semibold text-sm mb-2">Para activar con Resend (5 minutos)</div>
              <ol className="text-sm space-y-2 list-decimal pl-5 text-muted-foreground">
                <li>Cree una cuenta gratuita em <a className="text-primary underline" href="https://resend.com" target="_blank" rel="noopener"><span className="inline-flex items-center gap-1">resend.com <ExternalLink className="size-3" /></span></a> (3.000 correos/mes gratis).</li>
                <li>Verifique su dominio em <b>Resend &gt; Domains</b> (agregue los registros DNS sugeridos).</li>
                <li>Em <b>API Keys</b>, genere una nueva clave.</li>
                <li>En el panel Lovable Cloud, agregue el secreto <code className="px-1 bg-muted rounded">RESEND_API_KEY</code> con el valor copiado.</li>
                <li>En el archivo <code className="px-1 bg-muted rounded">src/lib/clinica-admin.functions.ts</code>, descomente el bloque <code className="px-1 bg-muted rounded">fetch("https://api.resend.com/emails", ...)</code> dentro de <code className="px-1 bg-muted rounded">enviarEmail</code> e ajuste el remitente para el dominio verificado.</li>
              </ol>
            </div>
            <div className="text-xs text-muted-foreground border-t pt-3">
              Por ahora, copie las credenciales y los enlaces manualmente al momento del registro (el modal ya genera el botón "Enviar por WhatsApp").
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="text-primary font-semibold">Otras integraciones</div>
            <Bullet title="Pagos">Hotmart configurado arriba. El acceso se libera automáticamente al aprobarse el pago.</Bullet>
            <Bullet title="IA Growth">Insights derivados de SQL determinista. Para LLM, use Lovable AI Gateway.</Bullet>
            <Bullet title="WhatsApp Business">Hoy solo enlace wa.me. Para envío automatizado, conecte UAZAPI/Z-API.</Bullet>
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  );
}

function Bullet({ title, children }: any) {
  return (
    <div className="text-sm">
      <div className="font-medium">{title}</div>
      <div className="text-muted-foreground text-xs">{children}</div>
    </div>
  );
}

function buildWebhookUrl() {
  const env = (import.meta as any).env?.VITE_PUBLIC_APP_URL as string | undefined;
  const base = env && !env.includes("id-preview--")
    ? env.replace(/\/$/, "")
    : (typeof window !== "undefined" && !window.location.origin.includes("id-preview--")
        ? window.location.origin
        : "https://odonto-mind-cloud.lovable.app");
  return `${base}/api/public/hotmart-webhook`;
}

function HotmartSection() {
  const qc = useQueryClient();
  const saveHottokFn = useServerFn(saveHotmartHottok);
  const getHottokFn = useServerFn(getHotmartHottok);
  const upsertFn = useServerFn(upsertHotmartPlano);
  const deleteFn = useServerFn(deleteHotmartPlano);

  const [hottok, setHottok] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const webhookUrl = buildWebhookUrl();

  const { data: hottokData } = useQuery({
    queryKey: ["hotmart-hottok"],
    queryFn: async () => await getHottokFn({}),
  });
  useEffect(() => {
    if (hottokData?.hottok) setHottok(hottokData.hottok);
  }, [hottokData?.hottok]);

  const { data: planos = [] } = useQuery({
    queryKey: ["hotmart-planos"],
    queryFn: async () =>
      ((await (supabase.from as any)("hotmart_plano").select("*").order("ordem", { ascending: true })).data ??
        []) as Plano[],
  });

  const [editing, setEditing] = useState<Partial<Plano> | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const copyUrl = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success("URL copiada");
    setTimeout(() => setCopied(false), 1800);
  };

  const saveHottok = async () => {
    if (!hottok.trim()) return toast.error("Ingrese el HOTTOK");
    try {
      await saveHottokFn({ data: { hottok: hottok.trim() } });
      toast.success("HOTTOK guardado");
      qc.invalidateQueries({ queryKey: ["hotmart-hottok"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Error");
    }
  };

  const savePlano = async () => {
    if (!editing) return;
    try {
      await upsertFn({
        data: {
          id: editing.id,
          nome: editing.nome ?? "",
          descricao: editing.descricao ?? "",
          valor: Number(editing.valor ?? 0),
          moeda: editing.moeda || "BRL",
          ciclo: (editing.ciclo as any) || "mensal",
          url_checkout: editing.url_checkout ?? "",
          hotmart_product_id: editing.hotmart_product_id ?? "",
          hotmart_offer_code: editing.hotmart_offer_code ?? "",
          ativo: editing.ativo ?? true,
          ordem: Number(editing.ordem ?? 0),
        } as any,
      });
      toast.success("Plan guardado");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["hotmart-planos"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Error");
    }
  };

  const doDelete = async () => {
    if (!confirmDel) return;
    try {
      await deleteFn({ data: { id: confirmDel } });
      toast.success("Plan eliminado");
      qc.invalidateQueries({ queryKey: ["hotmart-planos"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Error");
    } finally {
      setConfirmDel(null);
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-2 text-primary font-semibold">
          <CreditCard className="size-5" /> Pagos vía Hotmart
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><KeyRound className="size-4" /> HOTTOK</Label>
            <div className="flex gap-2">
              <Input
                type={showToken ? "text" : "password"}
                value={hottok}
                onChange={(e) => setHottok(e.target.value)}
                placeholder="Pegue aquí el HOTTOK de Hotmart"
              />
              <Button variant="outline" type="button" onClick={() => setShowToken((s) => !s)}>
                {showToken ? "Ocultar" : "Ver"}
              </Button>
              <Button type="button" onClick={saveHottok}>Guardar</Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Encuéntrelo en Hotmart &gt; Herramientas &gt; Webhook (Postback) &gt; campo <b>HOTTOK</b>.
              {hottokData?.configured && <Badge className="ml-2" variant="secondary">Configurado</Badge>}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><LinkIcon className="size-4" /> URL del webhook</Label>
            <div className="flex gap-2">
              <Input readOnly value={webhookUrl} className="font-mono text-xs" />
              <Button variant="outline" type="button" onClick={copyUrl}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Pegue esta URL en Hotmart &gt; Herramientas &gt; Webhook. Marque los eventos:
              <b> Compra aprobada, Suscripción creada, Cancelación, Reembolso, Chargeback</b>.
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-semibold">Planes de venta</div>
              <div className="text-xs text-muted-foreground">Registre cada oferta de Hotmart con su enlace de checkout.</div>
            </div>
            <Button size="sm" onClick={() => setEditing({ ativo: true, moeda: "BRL", ciclo: "mensal", ordem: planos.length })}>
              <Plus className="size-4" /> Nuevo plan
            </Button>
          </div>

          <div className="rounded border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs">
                <tr>
                  <th className="text-left px-3 py-2">Nombre</th>
                  <th className="text-left px-3 py-2">Ciclo</th>
                  <th className="text-right px-3 py-2">Valor</th>
                  <th className="text-left px-3 py-2">Product ID</th>
                  <th className="text-left px-3 py-2">Oferta</th>
                  <th className="text-center px-3 py-2">Estado</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {planos.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-6 text-muted-foreground text-xs">Sin planes registrados</td></tr>
                )}
                {planos.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-3 py-2">
                      <div className="font-medium">{p.nome}</div>
                      {p.descricao && <div className="text-xs text-muted-foreground truncate max-w-[280px]">{p.descricao}</div>}
                    </td>
                    <td className="px-3 py-2 capitalize">{p.ciclo}</td>
                    <td className="px-3 py-2 text-right">{p.moeda} {Number(p.valor).toFixed(2)}</td>
                    <td className="px-3 py-2 text-xs font-mono">{p.hotmart_product_id ?? "—"}</td>
                    <td className="px-3 py-2 text-xs font-mono">{p.hotmart_offer_code ?? "—"}</td>
                    <td className="px-3 py-2 text-center">
                      {p.ativo ? <Badge variant="secondary">Activo</Badge> : <Badge variant="outline">Inactivo</Badge>}
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <Button size="sm" variant="ghost" asChild>
                        <a href={p.url_checkout} target="_blank" rel="noopener"><ExternalLink className="size-3.5" /></a>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(p)}><Pencil className="size-3.5" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmDel(p.id)}><Trash2 className="size-3.5 text-destructive" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editing?.id ? "Editar plan" : "Nuevo plan"}</DialogTitle></DialogHeader>
            {editing && (
              <div className="grid md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <Label>Nombre</Label>
                  <Input value={editing.nome ?? ""} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} placeholder="Ej: Starter, Pro, Premium" />
                </div>
                <div className="md:col-span-2">
                  <Label>Descripción</Label>
                  <Textarea rows={2} value={editing.descricao ?? ""} onChange={(e) => setEditing({ ...editing, descricao: e.target.value })} />
                </div>
                <div>
                  <Label>Valor</Label>
                  <Input type="number" step="0.01" value={editing.valor ?? 0} onChange={(e) => setEditing({ ...editing, valor: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Moneda</Label>
                  <Input value={editing.moeda ?? "BRL"} onChange={(e) => setEditing({ ...editing, moeda: e.target.value.toUpperCase() })} />
                </div>
                <div>
                  <Label>Ciclo</Label>
                  <select className="w-full border rounded h-9 px-2 bg-background" value={editing.ciclo ?? "mensal"} onChange={(e) => setEditing({ ...editing, ciclo: e.target.value })}>
                    <option value="mensal">Mensual</option>
                    <option value="anual">Anual</option>
                    <option value="unico">Pago único</option>
                  </select>
                </div>
                <div>
                  <Label>Orden</Label>
                  <Input type="number" value={editing.ordem ?? 0} onChange={(e) => setEditing({ ...editing, ordem: Number(e.target.value) })} />
                </div>
                <div className="md:col-span-2">
                  <Label>URL de checkout (Hotmart)</Label>
                  <Input value={editing.url_checkout ?? ""} onChange={(e) => setEditing({ ...editing, url_checkout: e.target.value })} placeholder="https://pay.hotmart.com/..." />
                </div>
                <div>
                  <Label>Product ID de Hotmart</Label>
                  <Input value={editing.hotmart_product_id ?? ""} onChange={(e) => setEditing({ ...editing, hotmart_product_id: e.target.value })} placeholder="Ej: 1234567" />
                </div>
                <div>
                  <Label>Código de oferta</Label>
                  <Input value={editing.hotmart_offer_code ?? ""} onChange={(e) => setEditing({ ...editing, hotmart_offer_code: e.target.value })} placeholder="Ej: abc12" />
                </div>
                <div className="md:col-span-2 flex items-center gap-2 pt-2">
                  <Switch checked={editing.ativo ?? true} onCheckedChange={(v) => setEditing({ ...editing, ativo: v })} />
                  <Label>Plan activo</Label>
                </div>
                <div className="md:col-span-2 text-xs text-muted-foreground bg-muted/40 rounded p-3">
                  <Info className="inline size-3 mr-1" />
                  El acceso se libera comparando el <b>Product ID</b> o el <b>código de oferta</b> del webhook con este plan, y el email del comprador con el <b>owner_email</b> de una clínica.
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button onClick={savePlano}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar plan?</AlertDialogTitle>
              <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={doDelete}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
