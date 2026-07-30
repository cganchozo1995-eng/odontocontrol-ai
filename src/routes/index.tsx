import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Zap, Calendar, Users, DollarSign, TrendingUp, Brain, Shield,
  CheckCircle2, Sparkles, Star, Clock, ArrowRight, ChevronRight,
  Stethoscope, Activity, MessageCircle, FileText,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OdontoControl AI — Gestión inteligente para clínicas odontológicas" },
      { name: "description", content: "Agenda, pacientes, financiero, tratamientos y un motor de IA que identifica oportunidades y recupera ingresos — todo en un solo lugar." },
      { property: "og:title", content: "OdontoControl AI — Gestión inteligente para clínicas odontológicas" },
      { property: "og:description", content: "Agenda, pacientes, financiero, tratamientos y un motor de IA que identifica oportunidades y recupera ingresos — todo en un solo lugar." },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Calendar,   t: "Agenda Inteligente",         d: "Gestione todas las citas con vista diaria, por profesional y estado en tiempo real." },
  { icon: Users,      t: "Gestión de Pacientes",        d: "Ficha completa con historial de citas, tratamientos, presupuestos y jornada del paciente." },
  { icon: DollarSign, t: "Control Financiero",        d: "Ingresos, gastos, facturación y morosidad en un panel limpio y directo." },
  { icon: TrendingUp, t: "Presupuestos & Tratamientos",   d: "Cree presupuestos, siga tratamientos en curso y recupere pacientes inactivos." },
  { icon: Brain,      t: "AI Growth Engine",           d: "IA identifica oportunidades y genera mensajes personalizados para reactivar pacientes." },
  { icon: Shield,     t: "Equipo & Accesos",           d: "Invite colaboradores, defina roles y controle permisos por módulo." },
];

const STEPS = [
  { n: 1, t: "Registre su clínica",  d: "Configure datos, profesionales, procedimientos y plan en menos de 10 minutos." },
  { n: 2, t: "Importe su agenda",    d: "Suba su planilla o comience de cero. Pacientes y citas integrados al instante." },
  { n: 3, t: "Active el AI Growth",     d: "Nuestra IA escanea sus datos y señala exactamente dónde hay dinero perdido." },
  { n: 4, t: "Recupere ingresos",      d: "Envíe mensajes con 1 clic. Siga respuestas y cierres en el panel." },
];

const TURBO = [
  "Expediente electrónico con anexos",
  "Anamnesis odontológica completa",
  "Presupuestos con PDF imprimible",
  "Tratamientos con etapas y progreso",
  "Convenios y códigos de salud",
  "Reserva pública /agendar/su-clinica",
  "White-label con su marca y dominio",
];

const PAINS = [
  "Pacientes inactivos sin seguimiento",
  "Presupuestos enviados que nadie cobra",
  "Agenda confusa y llena de huecos",
  "Sin datos de retención por dentista",
  "Facturación manual en planillas",
  "WhatsApp disperso sin historial",
];

const TESTIMONIALS = [
  { nome: "Dra. Patricia Lima", clinica: "Ortodoncia Premium MX", txt: "Recuperé $38 mil en 60 días solo activando el AI Growth. Cambió el juego." },
  { nome: "Dr. Ricardo Souza",  clinica: "Implante Center CL",    txt: "Salí de la planilla. Hoy sé exactamente cuánto factura cada profesional por hora." },
  { nome: "Dra. Carla Mendes",  clinica: "Odonto Familia CO",     txt: "La reserva pública trajo 18 pacientes nuevos el primer mes. Sin publicidad pagada." },
];

const PLANOS = [
  { name: "Básico",       price: 197, items: ["1 profesional","Hasta 200 pacientes","Agenda + expediente","Presupuestos con PDF","Soporte en horario comercial"] },
  { name: "Profesional", price: 397, items: ["Hasta 6 profesionales","Pacientes ilimitados","AI Growth activo","Tratamientos con etapas","Financiero completo","Reserva pública","Soporte prioritario"], featured: true },
  { name: "Enterprise",   price: 697, items: ["Profesionales ilimitados","Multi-unidad","White-label + dominio propio","API + integraciones","Onboarding dedicado","Gerente de cuenta"] },
];

const FAQ = [
  { q: "¿Necesito instalar algo?", a: "No. OdontoControl funciona 100% en la nube, con respaldo automático diario. Acceda desde cualquier dispositivo." },
  { q: "¿Mis datos están seguros?", a: "Sí. Cifrado en tránsito y en reposo, cumplimiento de privacidad e infraestructura corporativa." },
  { q: "¿Puedo cancelar cuando quiera?", a: "Sí. Sin permanencia, sin multas. Cancele con 1 clic en el panel." },
  { q: "¿Tiene migración asistida?", a: "En el plan Enterprise sí. Nuestro equipo importa sus datos sin que usted mueva un dedo." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-[var(--surface)]">
      {/* NAVBAR */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-premium">
              <Zap className="size-5 text-white" />
            </div>
            <span className="font-bold text-lg">OdontoControl <span className="text-gradient-primary">AI</span></span>
          </Link>
          <nav className="flex items-center gap-1">
            <a href="#features" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hidden md:inline">Funciones</a>
            <a href="#ai" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hidden md:inline">AI Growth</a>
            <a href="#precos" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hidden md:inline">Precios</a>
            <Button asChild variant="ghost"><Link to="/entrar">Iniciar sesión</Link></Button>
            <Button asChild className="gradient-primary text-white shadow-premium hover:opacity-90">
              <Link to="/demo/Dashboard">Ver demostración</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-cyan-soft" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl -z-0" />
        <div className="relative max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-xs font-medium mb-6 animate-fade-in">
            <Sparkles className="size-3" /> SISTEMA COMPLETO PARA CLÍNICAS ODONTOLÓGICAS
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05] animate-fade-in">
            Gestione su clínica con<br />
            <span className="text-gradient-primary">inteligencia artificial</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto">
            Agenda, pacientes, financiero, tratamientos y un motor de IA que identifica oportunidades y recupera ingresos — todo en un solo lugar.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-9">
            <Button asChild size="lg" className="gradient-primary text-white shadow-premium hover:opacity-90 h-12 px-6 text-base">
              <Link to="/demo/Dashboard">Ver demostración en vivo <ArrowRight className="size-4 ml-1" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
              <Link to="/entrar">Quiero este sistema</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-5">Sin registro · Datos ficticios · Acceso inmediato</p>
        </div>

        {/* Stats */}
        <div className="bg-primary/5 border-y border-primary/10">
          <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              ["3x", "más retención de pacientes"],
              ["40%", "menos faltas en citas"],
              ["2h", "ahorradas por día"],
              ["100%", "datos seguros en la nube"],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="text-3xl md:text-4xl font-extrabold text-gradient-primary">{n}</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PAINS */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold">¿Su clínica pierde dinero en estas situaciones?</h2>
          <p className="text-muted-foreground mt-3">Si alguno de estos problemas le resulta familiar, OdontoControl lo resuelve.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {PAINS.map((p) => (
            <div key={p} className="flex gap-3 items-start p-5 rounded-xl bg-card border shadow-card">
              <div className="size-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                <span className="text-destructive font-bold">✕</span>
              </div>
              <span className="text-sm font-medium pt-1">{p}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium mb-3">RECURSOS</div>
          <h2 className="text-3xl md:text-4xl font-bold">Todo lo que su clínica necesita en un único sistema</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <Card key={f.t} className="border-0 shadow-card shadow-card-hover">
              <CardContent className="p-6">
                <div className="size-12 rounded-xl gradient-primary flex items-center justify-center shadow-premium mb-4">
                  <f.icon className="size-6 text-white" />
                </div>
                <h3 className="font-bold text-lg">{f.t}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* TURBO SECTION */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 text-primary px-3 py-1 text-xs font-medium mb-4">TURBOSAAS</div>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">Configure en 4 pasos. <span className="text-gradient-primary">Recupere ingresos en días.</span></h2>
            <div className="mt-8 space-y-5">
              {STEPS.map((s) => (
                <div key={s.n} className="flex gap-4">
                  <div className="size-10 rounded-lg gradient-primary flex items-center justify-center font-bold shrink-0">{s.n}</div>
                  <div>
                    <div className="font-semibold">{s.t}</div>
                    <div className="text-sm text-white/70 mt-0.5">{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur rounded-2xl p-7 border border-white/10">
            <div className="text-xs font-medium text-primary mb-3">INCLUIDO EN TODOS LOS PLANES</div>
            <ul className="space-y-3">
              {TURBO.map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="size-5 text-primary shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* AI GROWTH */}
      <section id="ai" className="bg-primary/5 py-20">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 text-primary px-3 py-1 text-xs font-medium mb-4">
              <Brain className="size-3" /> AI GROWTH ENGINE
            </div>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">La inteligencia artificial que <span className="text-gradient-primary">recupera ingresos</span> mientras usted atiende</h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Nuestra IA escanea sus datos todos los días e identifica pacientes inactivos, presupuestos pausados, horarios ociosos y oportunidades que los humanos perderían. Y genera los mensajes listos para usted.
            </p>
            <Button asChild size="lg" className="gradient-primary text-white shadow-premium mt-6">
              <Link to="/demo/CrecimientoIA">Ver IA en acción <ArrowRight className="size-4 ml-1" /></Link>
            </Button>
          </div>
          <div className="space-y-3">
            {[
              { icon: Star,  color: "text-amber-500 bg-amber-50",  t: "5 pacientes VIP sin retorno",      c: "+$ 8.500", a: "Reactivar ahora" },
              { icon: Clock, color: "text-sky-500 bg-sky-50",       t: "8 presupuestos pausados hace 14 días",  c: "+$ 23.400", a: "Follow-up automático" },
              { icon: Users, color: "text-emerald-500 bg-emerald-50", t: "Horario flojo: mar/jue 13-15h",  c: "+$ 4.200", a: "Crear campaña" },
            ].map((it) => (
              <Card key={it.t} className="border-0 shadow-card shadow-card-hover">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`size-12 rounded-xl flex items-center justify-center ${it.color}`}>
                    <it.icon className="size-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{it.t}</div>
                    <div className="text-xs text-emerald-600 font-bold mt-0.5">{it.c} potencial</div>
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Dentistas que ya ganan con OdontoControl</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <Card key={t.nome} className="border-0 shadow-card">
              <CardContent className="p-6">
                <div className="flex text-amber-400 mb-3">{[1,2,3,4,5].map((i)=>(<Star key={i} className="size-4 fill-current" />))}</div>
                <p className="text-sm leading-relaxed">\"{t.txt}\"</p>
                <div className="mt-5 pt-5 border-t flex items-center gap-3">
                  <div className="size-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm">
                    {t.nome.split(" ")[1]?.[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.nome}</div>
                    <div className="text-xs text-muted-foreground">{t.clinica}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="precos" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium mb-3">PLANES</div>
          <h2 className="text-3xl md:text-4xl font-bold">Elija el plan de su clínica</h2>
          <p className="text-muted-foreground mt-3">Sin permanencia. Cancele cuando quiera.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {PLANOS.map((p) => (
            <Card key={p.name} className={p.featured ? "border-0 gradient-primary text-white shadow-premium scale-105 relative" : "border-0 shadow-card"}>
              {p.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-primary text-xs font-bold px-3 py-1 rounded-full shadow">MÁS POPULAR</div>
              )}
              <CardContent className="p-7">
                <div className={`text-sm font-bold uppercase tracking-wide ${p.featured ? "text-white/80" : "text-muted-foreground"}`}>{p.name}</div>
                <div className="text-5xl font-extrabold mt-2">${p.price}<span className={`text-base font-normal ${p.featured ? "text-white/80" : "text-muted-foreground"}`}>/mes</span></div>
                <ul className="mt-6 space-y-3 text-sm">
                  {p.items.map((i) => (
                    <li key={i} className="flex gap-2"><CheckCircle2 className={`size-4 mt-0.5 shrink-0 ${p.featured ? "text-white" : "text-primary"}`} />{i}</li>
                  ))}
                </ul>
                <Button asChild className={`w-full mt-7 ${p.featured ? "bg-white text-primary hover:bg-white/90" : "gradient-primary text-white"}`}>
                  <Link to="/entrar">Empezar ahora</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Preguntas frecuentes</h2>
        <div className="space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="group rounded-xl border bg-card shadow-card overflow-hidden">
              <summary className="cursor-pointer p-5 font-semibold flex items-center justify-between hover:bg-muted/30">
                {f.q}
                <ChevronRight className="size-4 transition-transform group-open:rotate-90" />
              </summary>
              <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                {f.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-premium">
              <Zap className="size-4 text-white" />
            </div>
            <span className="font-bold text-lg">OdontoControl AI</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            La plataforma definitiva para clínicas odontológicas que buscan eficiencia, lucro y la mejor experiencia para el paciente.
          </p>
          <div className="mt-8 pt-8 border-t text-xs text-muted-foreground">
            © {new Date().getFullYear()} OdontoControl AI. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
