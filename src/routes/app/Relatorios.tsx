import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { useMoney } from "@/lib/format";
import { format, startOfMonth, subMonths } from "date-fns";

export const Route = createFileRoute("/app/Relatorios")({ component: Page });

const COLORS = ["#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

function Page() {
  const { clinicaId } = useAuth();
  const money = useMoney();
  const fromDate = format(subMonths(startOfMonth(new Date()), 5), "yyyy-MM-dd");

  const { data } = useQuery({
    queryKey: ["relatorios", clinicaId], enabled: !!clinicaId,
    queryFn: async () => {
      const [f, c, t, o] = await Promise.all([
        supabase.from("financeiro").select("*").eq("clinica_id", clinicaId!).gte("data", fromDate),
        supabase.from("consulta").select("*").eq("clinica_id", clinicaId!).gte("data", fromDate),
        supabase.from("tratamento").select("status,descricao").eq("clinica_id", clinicaId!),
        supabase.from("orcamento").select("itens,status").eq("clinica_id", clinicaId!),
      ]);
      return { fin: f.data ?? [], cons: c.data ?? [], trat: t.data ?? [], orc: o.data ?? [] };
    },
  });

  // Top procedimentos (a partir dos itens de orçamentos)
  const procCount: Record<string, number> = {};
  (data?.orc ?? []).forEach((o: any) => {
    (o.itens ?? []).forEach((it: any) => {
      const nome = it?.nome ?? it?.descricao ?? "—";
      procCount[nome] = (procCount[nome] ?? 0) + 1;
    });
  });
  const topProc = Object.entries(procCount).map(([nome, qtd]) => ({ nome, qtd }))
    .sort((a, b) => b.qtd - a.qtd).slice(0, 6);

  // Consultas por mês
  const consMes = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(new Date(), 5 - i);
    const key = format(d, "yyyy-MM");
    return { mes: format(d, "MM/yy"), qtd: (data?.cons ?? []).filter((c: any) => c.data?.startsWith(key)).length };
  });

  const meses = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(new Date(), 5 - i);
    const key = format(d, "yyyy-MM");
    const r = (data?.fin ?? []).filter((x: any) => x.data?.startsWith(key) && x.tipo === "receita").reduce((a: number, x: any) => a + Number(x.valor), 0);
    const dsp = (data?.fin ?? []).filter((x: any) => x.data?.startsWith(key) && x.tipo === "despesa").reduce((a: number, x: any) => a + Number(x.valor), 0);
    return { mes: format(d, "MM/yy"), receita: r, despesa: dsp, lucro: r - dsp };
  });

  const statusCons = ["programada", "confirmada", "realizada", "cancelada", "ausente"].map((s) => ({
    name: s, value: (data?.cons ?? []).filter((c: any) => c.status === s).length,
  })).filter((s) => s.value > 0);

  const statusTrat = ["planejado", "em_andamento", "concluido", "cancelado"].map((s) => ({
    name: s, value: (data?.trat ?? []).filter((c: any) => c.status === s).length,
  })).filter((s) => s.value > 0);

  return (
    <>
      <PageHeader title="Informes" description="Análisis de los últimos 6 meses" />
      <div className="grid lg:grid-cols-2 gap-4">
        <Card><CardContent className="p-5">
          <h3 className="font-semibold mb-4">Facturación mensual</h3>
          <div className="h-64"><ResponsiveContainer>
            <BarChart data={meses}>
              <XAxis dataKey="mes" /><YAxis /><Tooltip formatter={(v: any) => money(Number(v))} />
              <Legend /><Bar dataKey="receita" fill="#10B981" name="Ingreso" /><Bar dataKey="despesa" fill="#EF4444" name="Egreso" />
            </BarChart>
          </ResponsiveContainer></div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <h3 className="font-semibold mb-4">Ganancia mensual</h3>
          <div className="h-64"><ResponsiveContainer>
            <LineChart data={meses}>
              <XAxis dataKey="mes" /><YAxis /><Tooltip formatter={(v: any) => money(Number(v))} />
              <Line type="monotone" dataKey="lucro" stroke="#06B6D4" strokeWidth={3} name="Ganancia" />
            </LineChart>
          </ResponsiveContainer></div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <h3 className="font-semibold mb-4">Citas por estado</h3>
          <div className="h-64"><ResponsiveContainer>
            <PieChart>
              <Pie data={statusCons} dataKey="value" nameKey="name" outerRadius={80} label>
                {statusCons.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie><Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer></div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <h3 className="font-semibold mb-4">Tratamientos por estado</h3>
          <div className="h-64"><ResponsiveContainer>
            <PieChart>
              <Pie data={statusTrat} dataKey="value" nameKey="name" outerRadius={80} label>
                {statusTrat.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
              </Pie><Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer></div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <h3 className="font-semibold mb-4">Citas por mes</h3>
          <div className="h-64"><ResponsiveContainer>
            <BarChart data={consMes}>
              <XAxis dataKey="mes" /><YAxis /><Tooltip />
              <Bar dataKey="qtd" fill="#06B6D4" name="Citas" />
            </BarChart>
          </ResponsiveContainer></div>
        </CardContent></Card>
        <Card className="lg:col-span-2"><CardContent className="p-5">
          <h3 className="font-semibold mb-4">Principales procedimientos (presupuestos)</h3>
          <div className="h-64"><ResponsiveContainer>
            <BarChart data={topProc} layout="vertical">
              <XAxis type="number" /><YAxis type="category" dataKey="nome" width={140} /><Tooltip />
              <Bar dataKey="qtd" fill="#8B5CF6" name="Cant" />
            </BarChart>
          </ResponsiveContainer></div>
          {topProc.length === 0 && <p className="text-sm text-muted-foreground">Sin datos aún.</p>}
        </CardContent></Card>
      </div>
    </>
  );
}
