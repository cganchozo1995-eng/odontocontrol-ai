import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/CrudPage";
import { Badge } from "@/components/ui/badge";
import { useMoney, dateBR } from "@/lib/format";

export const Route = createFileRoute("/app/Financeiro")({ component: Page });

const FORMAS_PAGO = [
  { value: "efectivo", label: "Efectivo" },
  { value: "tarjeta_credito", label: "Tarjeta de crédito" },
  { value: "tarjeta_debito", label: "Tarjeta de débito" },
  { value: "transferencia", label: "Transferencia bancaria" },
];

const FORMA_LABEL: Record<string, string> = Object.fromEntries(FORMAS_PAGO.map((f) => [f.value, f.label]));

function Page() {
  const money = useMoney();
  return (
    <CrudPage
      table="financeiro"
      title="Financiero"
      description="Ingresos y egresos"
      searchKeys={["descricao", "categoria"] as any}
      defaults={{ tipo: "ingreso", status: "pago", data: new Date().toISOString().slice(0, 10), total_parcelas: 1, parcela_atual: 1 }}
      columns={[
        { key: "data", header: "Fecha", render: (r: any) => dateBR(r.data) },
        { key: "descricao", header: "Descripción" },
        { key: "categoria", header: "Categoría" },
        { key: "tipo", header: "Tipo", render: (r: any) => <Badge variant={r.tipo === "ingreso" ? "default" : "destructive"}>{r.tipo === "ingreso" ? "Ingreso" : "Egreso"}</Badge> },
        { key: "status", header: "Estado", render: (r: any) => <Badge variant="outline">{r.status}</Badge> },
        { key: "forma_pagamento", header: "Forma de pago", render: (r: any) => FORMA_LABEL[r.forma_pagamento] ?? r.forma_pagamento ?? "—" },
        { key: "valor", header: "Valor", render: (r: any) => <span className={r.tipo === "ingreso" ? "text-emerald-600 font-medium" : "text-destructive font-medium"}>{money(r.valor)}</span> },
      ]}
      fields={[
        { name: "tipo", label: "Tipo", type: "select", required: true, options: [{ value: "ingreso", label: "Ingreso" }, { value: "egreso", label: "Egreso" }] },
        { name: "status", label: "Estado", type: "select", options: [{ value: "pago", label: "Pagado" }, { value: "pendiente", label: "Pendiente" }, { value: "atrasado", label: "Atrasado" }, { value: "cancelado", label: "Cancelado" }] },
        { name: "descricao", label: "Descripción", required: true, col: 2 },
        { name: "valor", label: "Valor", type: "number", step: "0.01", required: true },
        { name: "data", label: "Fecha", type: "date", required: true },
        { name: "vencimento", label: "Vencimiento", type: "date" },
        { name: "categoria", label: "Categoría" },
        { name: "forma_pagamento", label: "Forma de pago", type: "select", options: FORMAS_PAGO },
        { name: "parcela_atual", label: "Cuota actual", type: "number" },
        { name: "total_parcelas", label: "Total de cuotas", type: "number" },
      ]}
    />
  );
}
