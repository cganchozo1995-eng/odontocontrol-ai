import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/lib/auth";

// Locales por código de moneda para dar formato adecuado (símbolo/separadores)
const LOCALE_BY_CURRENCY: Record<string, string> = {
  USD: "es-EC",
  MXN: "es-MX",
  COP: "es-CO",
  PEN: "es-PE",
  CLP: "es-CL",
  ARS: "es-AR",
  BOB: "es-BO",
  PYG: "es-PY",
  UYU: "es-UY",
  CRC: "es-CR",
  DOP: "es-DO",
  HNL: "es-HN",
  NIO: "es-NI",
  GTQ: "es-GT",
  PAB: "es-PA",
  SVC: "es-SV",
};

export const CURRENCIES: { code: string; label: string }[] = [
  { code: "USD", label: "USD — Dólar estadounidense" },
  { code: "MXN", label: "MXN — Peso mexicano" },
  { code: "COP", label: "COP — Peso colombiano" },
  { code: "PEN", label: "PEN — Sol peruano" },
  { code: "CLP", label: "CLP — Peso chileno" },
  { code: "ARS", label: "ARS — Peso argentino" },
  { code: "BOB", label: "BOB — Boliviano" },
  { code: "PYG", label: "PYG — Guaraní paraguayo" },
  { code: "UYU", label: "UYU — Peso uruguayo" },
  { code: "CRC", label: "CRC — Colón costarricense" },
  { code: "DOP", label: "DOP — Peso dominicano" },
  { code: "HNL", label: "HNL — Lempira hondureño" },
  { code: "NIO", label: "NIO — Córdoba nicaragüense" },
  { code: "GTQ", label: "GTQ — Quetzal guatemalteco" },
  { code: "PAB", label: "PAB — Balboa panameño" },
  { code: "SVC", label: "SVC — Colón salvadoreño" },
];

export function formatMoney(n: number | null | undefined, currency: string = "USD") {
  const code = (currency || "USD").toUpperCase();
  const locale = LOCALE_BY_CURRENCY[code] ?? "es-419";
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency: code }).format(Number(n ?? 0));
  } catch {
    return new Intl.NumberFormat("es-419", { style: "currency", currency: "USD" }).format(Number(n ?? 0));
  }
}

// Hook: usa la moneda configurada en la clínica actual.
export function useMoney() {
  const { clinica } = useAuth();
  const currency = (clinica as any)?.moeda || "USD";
  return (n: number | null | undefined) => formatMoney(n, currency);
}

// Compatibilidad: `money`/`usd` conservan la firma antigua pero usan USD por defecto.
export const money = (n: number | null | undefined) => formatMoney(n, "USD");
export const usd = money;

export const fechaES = (d: string | Date | null | undefined, fmt = "dd/MM/yyyy") =>
  d ? format(new Date(d), fmt, { locale: es }) : "—";

export const fechaHoraES = (d: string | Date | null | undefined) =>
  d ? format(new Date(d), "dd/MM/yyyy 'a las' HH:mm", { locale: es }) : "—";

export const initials = (s?: string | null) =>
  (s ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
