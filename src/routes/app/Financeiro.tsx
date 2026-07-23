import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/CrudPage";
import { Badge } from "@/components/ui/badge";
import { brl, dateBR } from "@/lib/format";

export const Route = createFileRoute("/app/Financeiro")({ component: Page });

function Page() {
  return (
    <CrudPage
      table="financeiro"
      title="Financiero"
      description="Ingresos y egresos"
      searchKeys={["descricao", "categoria"] as any}
      defaults={{ tipo: "receita", status: "pago", data: new Date().toISOString().slice(0, 10), total_parcelas: 1, parcela_atual: 1 }}
      columns={[
        { key: "data", header: "Fecha", render: (r: any) => dateBR(r.data) },
        { key: "descricao", header: "Descripción" },
        { key: "categoria", header: "Categoría" },
        { key: "tipo", header: "Tipo", render: (r: any) => <Badge variant={r.tipo === "receita" ? "default" : "destructive"}>{r.tipo}</Badge> },
        { key: "status", header: "Estado", render: (r: any) => <Badge variant="outline">{r.status}</Badge> },
        { key: "valor", header: "Valor", render: (r: any) => <span className={r.tipo === "receita" ? "text-emerald-600 font-medium" : "text-destructive font-medium"}>{brl(r.valor)}</span> },
      ]}
      fields={[
        { name: "tipo", label: "Tipo", type: "select", required: true, options: [{ value: "receita", label: "Ingreso" }, { value: "despesa", label: "Egreso" }] },
        { name: "status", label: "Estado", type: "select", options: [{ value: "pago", label: "Pagado" }, { value: "pendente", label: "Pendiente" }, { value: "vencido", label: "Vencido" }, { value: "cancelado", label: "Cancelado" }] },
        { name: "descricao", label: "Descripción", required: true, col: 2 },
        { name: "valor", label: "Valor", type: "number", step: "0.01", required: true },
        { name: "data", label: "Fecha", type: "date", required: true },
        { name: "vencimento", label: "Vencimiento", type: "date" },
        { name: "categoria", label: "Categoría" },
        { name: "forma_pagamento", label: "Forma de pago" },
        { name: "parcela_atual", label: "Cuota actual", type: "number" },
        { name: "total_parcelas", label: "Total de cuotas", type: "number" },
      ]}
    />
  );
}
