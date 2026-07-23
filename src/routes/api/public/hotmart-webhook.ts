import { createFileRoute } from "@tanstack/react-router";

const APPROVED_EVENTS = new Set([
  "PURCHASE_APPROVED",
  "PURCHASE_COMPLETE",
  "SUBSCRIPTION_CREATION",
  "SUBSCRIPTION_RESTARTED",
]);
const SUSPEND_EVENTS = new Set([
  "PURCHASE_REFUNDED",
  "PURCHASE_CHARGEBACK",
  "PURCHASE_CANCELED",
  "PURCHASE_EXPIRED",
  "SUBSCRIPTION_CANCELLATION",
  "PURCHASE_DELAYED",
  "PURCHASE_PROTEST",
]);

export const Route = createFileRoute("/api/public/hotmart-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: any;
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const headerHottok =
          request.headers.get("x-hotmart-hottok") ||
          request.headers.get("hottok") ||
          new URL(request.url).searchParams.get("hottok") ||
          body?.hottok;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: cfg } = await supabaseAdmin
          .from("app_config")
          .select("system_settings")
          .limit(1)
          .maybeSingle();
        const expected = ((cfg?.system_settings as any) || {}).hotmart_hottok as string | undefined;
        if (!expected) return new Response("Hottok not configured", { status: 503 });
        if (!headerHottok || headerHottok !== expected) {
          return new Response("Invalid hottok", { status: 401 });
        }

        const event: string = body?.event || "UNKNOWN";
        const d = body?.data || {};
        const buyerEmail: string | undefined =
          d?.buyer?.email || d?.subscriber?.email || d?.customer?.email;
        const productId = String(d?.product?.id ?? d?.product?.ucode ?? "");
        const offerCode: string | undefined = d?.purchase?.offer?.code || d?.plan?.name;
        const transactionId: string | undefined = d?.purchase?.transaction || d?.transaction || body?.id;
        const status: string = d?.purchase?.status || event;
        const valor: number | null = d?.purchase?.price?.value ?? d?.purchase?.original_offer_price?.value ?? null;
        const moeda: string | null = d?.purchase?.price?.currency_value ?? d?.purchase?.original_offer_price?.currency_value ?? null;

        if (!buyerEmail) {
          return new Response("Missing buyer email", { status: 400 });
        }

        // Encontrar plan y clínica
        let plano: any = null;
        if (productId || offerCode) {
          const { data: planos } = await supabaseAdmin
            .from("hotmart_plano" as any)
            .select("*");
          plano = (planos as any[] | null)?.find(
            (p) =>
              (productId && p.hotmart_product_id && String(p.hotmart_product_id) === productId) ||
              (offerCode && p.hotmart_offer_code && p.hotmart_offer_code === offerCode),
          );
        }

        const { data: clinica } = await supabaseAdmin
          .from("clinica")
          .select("id, plano, valor_mensal, status, status_cobranca")
          .ilike("owner_email", buyerEmail)
          .maybeSingle();

        // Registrar pago
        await supabaseAdmin.from("hotmart_pagamento" as any).insert({
          clinica_id: clinica?.id ?? null,
          email: buyerEmail,
          transaction_id: transactionId ?? null,
          product_id: productId || null,
          offer_code: offerCode || null,
          event,
          status,
          valor,
          moeda,
          payload: body,
        });

        // Liberar/suspender acceso
        if (clinica && APPROVED_EVENTS.has(event)) {
          const update: any = { status: "ativo", status_cobranca: "ativo" };
          if (plano) {
            const planoNorm = ["starter", "pro", "premium"].includes(String(plano.nome).toLowerCase())
              ? String(plano.nome).toLowerCase()
              : clinica.plano;
            update.plano = planoNorm;
            update.valor_mensal = plano.valor;
            update.mrr = plano.ciclo === "anual" ? Number(plano.valor) / 12 : plano.valor;
          }
          await supabaseAdmin.from("clinica").update(update).eq("id", clinica.id);
        } else if (clinica && SUSPEND_EVENTS.has(event)) {
          await supabaseAdmin
            .from("clinica")
            .update({ status_cobranca: "inadimplente" })
            .eq("id", clinica.id);
        }

        return Response.json({ ok: true, matched_clinica: !!clinica, event });
      },
      GET: async () => Response.json({ ok: true, service: "hotmart-webhook" }),
    },
  },
});