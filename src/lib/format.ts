import { format } from "date-fns";
import { es } from "date-fns/locale";

// Formateador de dólares estadounidenses (USD) para toda la aplicación.
// Se mantiene el nombre `brl` para compatibilidad con imports existentes.
export const brl = (n: number | null | undefined) =>
  new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(Number(n ?? 0));
export const usd = brl;

export const dateBR = (d: string | Date | null | undefined, fmt = "dd/MM/yyyy") =>
  d ? format(new Date(d), fmt, { locale: es }) : "—";

export const dateTimeBR = (d: string | Date | null | undefined) =>
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
