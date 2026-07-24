import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertSuperAdmin(supabase: any, email: string | undefined) {
  if (!email) throw new Error("No autenticado");
  const { data: cfg } = await supabase.from("app_config").select("super_admin_emails").limit(1).maybeSingle();
  const admins: string[] = (cfg?.super_admin_emails as string[]) ?? [];
  if (!admins.includes(email)) throw new Error("Solo el Super Admin puede realizar esta acción");
}

const planoSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(1).max(120),
  descricao: z.string().max(500).optional().nullable(),
  valor: z.number().min(0).max(999999),
  moeda: z.string().max(6).default("USD"),
  ciclo: z.enum(["mensal", "anual", "unico"]).default("mensal"),
  url_checkout: z.string().url().max(500),
  hotmart_product_id: z.string().max(80).optional().nullable(),
  hotmart_offer_code: z.string().max(80).optional().nullable(),
  ativo: z.boolean().default(true),
  ordem: z.number().int().min(0).max(999).default(0),
});

export const upsertHotmartPlano = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => planoSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, claims } = context as any;
    await assertSuperAdmin(supabase, claims?.email);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = {
      nome: data.nome,
      descricao: data.descricao ?? null,
      valor: data.valor,
      moeda: data.moeda,
      ciclo: data.ciclo,
      url_checkout: data.url_checkout,
      hotmart_product_id: data.hotmart_product_id || null,
      hotmart_offer_code: data.hotmart_offer_code || null,
      ativo: data.ativo,
      ordem: data.ordem,
    };
    if (data.id) {
      const { error } = await supabaseAdmin.from("hotmart_plano" as any).update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: ins, error } = await supabaseAdmin.from("hotmart_plano" as any).insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: (ins as any).id };
  });

export const deleteHotmartPlano = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, claims } = context as any;
    await assertSuperAdmin(supabase, claims?.email);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("hotmart_plano" as any).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveHotmartHottok = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ hottok: z.string().min(4).max(200) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, claims } = context as any;
    await assertSuperAdmin(supabase, claims?.email);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cfg } = await supabaseAdmin.from("app_config").select("id, system_settings").limit(1).maybeSingle();
    if (!cfg) throw new Error("app_config no encontrado");
    const settings = { ...(cfg.system_settings as any || {}), hotmart_hottok: data.hottok };
    const { error } = await supabaseAdmin.from("app_config").update({ system_settings: settings }).eq("id", (cfg as any).id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getHotmartHottok = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, claims } = context as any;
    await assertSuperAdmin(supabase, claims?.email);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cfg } = await supabaseAdmin.from("app_config").select("system_settings").limit(1).maybeSingle();
    const hottok = ((cfg?.system_settings as any) || {}).hotmart_hottok as string | undefined;
    return { hottok: hottok ?? "", configured: !!hottok };
  });