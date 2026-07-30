import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/PageHeader";
import { demoFinanzas, DEMO_KPI } from "@/lib/demo-seed";
import { money, fechaES } from "@/lib/format";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { DollarSign, Wallet, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { format, subMonths } from "date-fns";

export const Route = createFileRoute("/demo/Financiero")({ component: Page });

const TR: Record<string, string> = {
  Pix: "Pix",
  "Cartão crédito": "Tarjeta de crédito",
  "Cartão débito": "Tarjeta de débito",
  Dinheiro: "Efectivo",
  Boleto: "Boleto",
  "Transferência": "Transferencia",
  Consulta: "Consulta",
  Tratamento: "Tratamiento",
  "Orçamento": "Presupuesto",
  Reembolso: "Reembolso",
  "Convênio": "Convenio",
  Aluguel: "Alquiler",
  Materiais: "Materiales",
  "Laboratório": "Laboratorio",
  Marketing: "Marketing",
  "Folha pagamento": "Nómina",
  Equipamentos: "Equipos",
  Energia: "Energía",
  Internet: "Internet",
  Limpeza: "Limpieza",
  Outros: "Otros",
};
const STATUS_LABELS: Record<string, string> = {
  pago:     "pagado",
  pendente: "pendiente",
  atrasado: "atrasado",
};
const STATUS: Record<string, string> = {
  pagado:   "bg-emerald-100 text-emerald-700 border-emerald-200",
  pendente: "bg-amber-100 text-amber-700 border-amber-200",
  atrasado: "bg-red-100 text-red-700 border-red-200",
};

function Page() {
  const ingresos = useMemo(() => demoFinanzas.filter((f) => f.tipo === "ingreso").sort((a,b) => b.data.localeCompare(a.data)), []);
  const egresos = useMemo(() => demoFinanzas.filter((f) => f.tipo === "egreso").sort((a,b) => b.data.localeCompare(a.data)), []);

  const chart = Array.from({ length: 6 }).map((_, i) => {
    const m = subMonths(new Date(), 5 - i);
    const base = 32000 + i * 2400 + (i % 2 ? 4000 : 0);
    return { mes: format(m, "MMM"), ingresos: base, egresos: 18000 + i * 800 + (i % 3 ? 1500 : 0) };
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Financiero"
        description="Ingresos, gastos y flujo de caja"
        actions={<Button className="gradient-primary text-white shadow-premium"><Plus className="size-4 mr-1.5" />Nuevo registro</Button>}
      />

      <div className="grid md:grid-cols-4 gap-3">
        <Kpi label="Facturación del mes" value={money(DEMO_KPI.facturacionMes)} icon={DollarSign} color="text-emerald-500 bg-emerald-50" />
        <Kpi label="Por cobrar"          value={money(DEMO_KPI.porCobrar)}        icon={Wallet}     color="text-amber-500 bg-amber-50" />
        <Kpi label="Recibido en el mes"  value={money(DEMO_KPI.recibidoMes)}     icon={TrendingUp} color="text-sky-500 bg-sky-50" />
        <Kpi label="Gastos del mes"      value={money(DEMO_KPI.gastosMes)}     icon={TrendingDown} color="text-red-500 bg-red-50" />
      </div>

      <Card className="border-0 shadow-card">
        <CardContent className="p-5">
          <h3 className="font-bold mb-4">Ingresos vs Gastos — últimos 6 meses</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={chart}>
                <XAxis dataKey="mes" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip formatter={(v: any) => money(Number(v))} contentStyle={{ borderRadius: 8 }} />
                <Legend iconType="circle" />
                <Bar dataKey="ingresos" fill="#0EA5E9" name="Ingresos" radius={[6, 6, 0, 0]} />
                <Bar dataKey="egresos" fill="#EF4444" name="Gastos" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-card">
        <CardContent className="p-5">
          <Tabs defaultValue="ingresos">
            <TabsList>
              <TabsTrigger value="ingresos">Ingresos · {ingresos.length}</TabsTrigger>
              <TabsTrigger value="gastos">Gastos · {egresos.length}</TabsTrigger>
            </TabsList>
            <TabsContent value="ingresos" className="mt-4"><Tabela items={ingresos} /></TabsContent>
            <TabsContent value="gastos" className="mt-4"><Tabela items={egresos} /></TabsContent>
          </Tabs>

          <div className="mt-5 pt-5 border-t grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Total ingresos</div>
              <div className="text-xl font-extrabold text-emerald-600">{money(ingresos.reduce((a,r) => a + r.valor, 0))}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Total gastos</div>
              <div className="text-xl font-extrabold text-red-600">{money(egresos.reduce((a,r) => a + r.valor, 0))}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Ganancia</div>
              <div className="text-xl font-extrabold text-primary">{money(ingresos.reduce((a,r) => a + r.valor, 0) - egresos.reduce((a,r) => a + r.valor, 0))}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ label, value, icon: Icon, color }: any) {
  return (
    <Card className="border-0 shadow-card gradient-card">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
          <div className={`size-9 rounded-lg flex items-center justify-center ${color}`}><Icon className="size-4" /></div>
        </div>
        <div className="text-2xl font-extrabold mt-3">{value}</div>
      </CardContent>
    </Card>
  );
}

function Tabela({ items }: { items: any[] }) {
  return (
    <div className="overflow-x-auto max-h-[450px] overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 sticky top-0">
          <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-4 py-2 font-semibold">Fecha</th>
            <th className="px-4 py-2 font-semibold">Descripción</th>
            <th className="px-4 py-2 font-semibold">Categoría</th>
            <th className="px-4 py-2 font-semibold">Pago</th>
            <th className="px-4 py-2 font-semibold">Estado</th>
            <th className="px-4 py-2 font-semibold text-right">Valor</th>
          </tr>
        </thead>
        <tbody>
          {items.map((f) => (
            <tr key={f.id} className="border-t hover:bg-muted/20">
              <td className="px-4 py-2 text-xs">{fechaES(f.data)}</td>
              <td className="px-4 py-2 text-xs truncate max-w-[280px]">{f.descricao}</td>
              <td className="px-4 py-2"><Badge variant="outline" className="text-[10px]">{TR[f.categoria] || f.categoria}</Badge></td>
              <td className="px-4 py-2 text-xs text-muted-foreground">{TR[f.forma_pagamento] || f.forma_pagamento}</td>
              <td className="px-4 py-2"><Badge variant="outline" className={`text-[10px] ${STATUS[f.status] ?? ""}`}>{STATUS_LABELS[f.status] || f.status}</Badge></td>
              <td className={`px-4 py-2 text-right font-bold ${f.tipo === "ingreso" ? "text-emerald-600" : "text-red-600"}`}>{money(f.valor)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
