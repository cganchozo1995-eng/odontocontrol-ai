import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { useMoney } from "@/lib/format";
import { format, startOfMonth, subMonths } from "date-fns";

export const Route = createFileRoute("/app/Informes")({ component: Page });

const COLORS = ["#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

// Etiquetas legibles para estados almacenados en la BD
const CONS_LABEL: Record<string, string> = {
  programada: "Programada",
  confirmada: "Confirmada",
  en_atencion: "En atención",
  concluida: "Concluida",
  cancelada: "Cancelada",
  ausente: "No asistió",
};
const TRAT_LABEL: Record<string, string> = {
  planificado: "Planificado",
  en_curso: "En curso",
  concluido: "Concluido",
  cancelado: "Cancelado",
};

// Extrae "yyyy-MM" de un campo date/timestamp sin verse afectado por timezone
const monthKey = (v: any): string => {
  if (!v) return "";
  const s = String(v);
  return s.length >= 7 ? s.slice(0, 7) : "";
};

function Page() {
  const { clinicaId } = useAuth();
  const money = useMoney();
  const fromDate = format(subMonths(startOfMonth(new Date()), 5), "yyyy-MM-dd");

  const { data, isLoading } = useQuery({
    queryKey: ["relatorios", clinicaId], enabled: !!clinicaId,
    queryFn: async () => {
      const [f, c, t, o] = await Promise.all([
        supabase.from("financeiro").select("data,tipo,valor").eq("clinica_id", clinicaId!).gte("data", fromDate),
        supabase.from("consulta").select("data,status").eq("clinica_id", clinicaId!).gte("data", fromDate),
        supabase.from("tratamento").select("status,descricao").eq("clinica_id", clinicaId!),
        supabase.from("orcamento").select("itens,status").eq("clinica_id", clinicaId!),
      ]);
      return { fin: f.data ?? [], cons: c.data ?? [], trat: t.data ?? [], orc: o.data ?? [] };
    },
  });

  // Top procedimientos (a partir de los ítems de presupuestos)
  const procCount: Record<string, number> = {};
  (data?.orc ?? []).forEach((o: any) => {
    (o.itens ?? []).forEach((it: any) => {
      const nome = it?.nome ?? it?.descricao ?? "—";
      procCount[nome] = (procCount[nome] ?? 0) + 1;
    });
  });
  const topProc = Object.entries(procCount).map(([nome, qtd]) => ({ nome, qtd }))
    .sort((a, b) => b.qtd - a.qtd).slice(0, 6);

  // Citas por mes
  const consMes = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(new Date(), 5 - i);
    const key = format(d, "yyyy-MM");
    return { mes: format(d, "MM/yy"), qtd: (data?.cons ?? []).filter((c: any) => monthKey(c.data) === key).length };
  });

  // Facturación mensual usando los enums actuales: ingreso / egreso.
  const isIngreso = (t: any) => t === "ingreso";
  const isEgreso = (t: any) => t === "egreso";

  const meses = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(new Date(), 5 - i);
    const key = format(d, "yyyy-MM");
    const rows = (data?.fin ?? []).filter((x: any) => monthKey(x.data) === key);
    const r = rows.filter((x: any) => isIngreso(x.tipo)).reduce((a: number, x: any) => a + Number(x.valor ?? 0), 0);
    const dsp = rows.filter((x: any) => isEgreso(x.tipo)).reduce((a: number, x: any) => a + Number(x.valor ?? 0), 0);
    return { mes: format(d, "MM/yy"), ingreso: r, egreso: dsp, ganancia: r - dsp };
  });

  const hayFinanciero = meses.some((m) => m.ingreso > 0 || m.egreso > 0);
  const hayLucro = meses.some((m) => m.ganancia !== 0);

  // Citas por estado — se agrupa dinámicamente por el valor real almacenado
  const consByStatus: Record<string, number> = {};
  (data?.cons ?? []).forEach((c: any) => {
    if (!c?.status) return;
    consByStatus[c.status] = (consByStatus[c.status] ?? 0) + 1;
  });
  const statusCons = Object.entries(consByStatus).map(([k, v]) => ({ name: CONS_LABEL[k] ?? k, value: v }));

  // Tratamientos por estado — agrupado dinámicamente desde la BD
  const tratByStatus: Record<string, number> = {};
  (data?.trat ?? []).forEach((c: any) => {
    if (!c?.status) return;
    tratByStatus[c.status] = (tratByStatus[c.status] ?? 0) + 1;
  });
  const statusTrat = Object.entries(tratByStatus).map(([k, v]) => ({ name: TRAT_LABEL[k] ?? k, value: v }));

  const hayConsMes = consMes.some((m) => m.qtd > 0);

  const empty = (msg = "No existen datos para el período seleccionado.") => (
    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">{msg}</div>
  );

  return (
    <>
      <PageHeader title="Informes" description="Análisis de los últimos 6 meses" />
      <div className="grid lg:grid-cols-2 gap-4">
        <Card><CardContent className="p-5">
          <h3 className="font-semibold mb-4">Facturación mensual</h3>
          <div className="h-64">{isLoading ? empty("Cargando…") : hayFinanciero ? (<ResponsiveContainer>
            <BarChart data={meses}>
              <XAxis dataKey="mes" /><YAxis /><Tooltip formatter={(v: any) => money(Number(v))} />
              <Legend /><Bar dataKey="ingreso" fill="#10B981" name="Ingreso" /><Bar dataKey="egreso" fill="#EF4444" name="Egreso" />
            </BarChart>
          </ResponsiveContainer>) : empty()}</div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <h3 className="font-semibold mb-4">Ganancia mensual</h3>
          <div className="h-64">{isLoading ? empty("Cargando…") : hayLucro ? (<ResponsiveContainer>
            <LineChart data={meses}>
              <XAxis dataKey="mes" /><YAxis /><Tooltip formatter={(v: any) => money(Number(v))} />
              <Line type="monotone" dataKey="ganancia" stroke="#06B6D4" strokeWidth={3} name="Ganancia" />
            </LineChart>
          </ResponsiveContainer>) : empty()}</div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <h3 className="font-semibold mb-4">Citas por estado</h3>
          <div className="h-64">{isLoading ? empty("Cargando…") : statusCons.length ? (<ResponsiveContainer>
            <PieChart>
              <Pie data={statusCons} dataKey="value" nameKey="name" outerRadius={80} label>
                {statusCons.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie><Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>) : empty()}</div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <h3 className="font-semibold mb-4">Tratamientos por estado</h3>
          <div className="h-64">{isLoading ? empty("Cargando…") : statusTrat.length ? (<ResponsiveContainer>
            <PieChart>
              <Pie data={statusTrat} dataKey="value" nameKey="name" outerRadius={80} label>
                {statusTrat.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
              </Pie><Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>) : empty()}</div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <h3 className="font-semibold mb-4">Citas por mes</h3>
          <div className="h-64">{isLoading ? empty("Cargando…") : hayConsMes ? (<ResponsiveContainer>
            <BarChart data={consMes}>
              <XAxis dataKey="mes" /><YAxis /><Tooltip />
              <Bar dataKey="qtd" fill="#06B6D4" name="Citas" />
            </BarChart>
          </ResponsiveContainer>) : empty()}</div>
        </CardContent></Card>
        <Card className="lg:col-span-2"><CardContent className="p-5">
          <h3 className="font-semibold mb-4">Principales procedimientos (presupuestos)</h3>
          <div className="h-64">{isLoading ? empty("Cargando…") : topProc.length ? (<ResponsiveContainer>
            <BarChart data={topProc} layout="vertical">
              <XAxis type="number" /><YAxis type="category" dataKey="nome" width={140} /><Tooltip />
              <Bar dataKey="qtd" fill="#8B5CF6" name="Cantidad" />
            </BarChart>
          </ResponsiveContainer>) : empty()}</div>
        </CardContent></Card>
      </div>
    </>
  );
}
