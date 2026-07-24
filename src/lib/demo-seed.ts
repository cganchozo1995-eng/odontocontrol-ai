// Seed mock rico para o modo demo.
import { addDays, format, subDays, subMonths } from "date-fns";

const today = new Date();
const d = (offset: number) => format(addDays(today, offset), "yyyy-MM-dd");

export const demoClinica = {
  id: "demo-clinica",
  nome: "OdontoControl Excellence",
  slug: "excellence",
  cnpj: "1791234567001",
  cro_responsavel: "ACESS 12345",
  telefone: "+593 2 345 6789",
  whatsapp: "+593 99 999 0000",
  email: "contacto@excellence.odonto.ec",
  endereco: "Av. Amazonas 1500 y Naciones Unidas, Quito, Ecuador",
  primary_color: "#0EA5E9",
  plano: "profesional",
};

export const demoProfissionais = [
  { id: "p1", nome: "Dra. Patricia Lima",  especialidade: "Ortodoncia",           cro_numero: "23456", cro_uf: "PICH", telefone: "+593 99 100 2001", valor_consulta: 60, percentual_repasse: 50, ativo: true, cor: "#0EA5E9" },
  { id: "p2", nome: "Dr. Ricardo Souza",   especialidade: "Implantología",         cro_numero: "34567", cro_uf: "PICH", telefone: "+593 99 100 2002", valor_consulta: 70, percentual_repasse: 55, ativo: true, cor: "#8B5CF6" },
  { id: "p3", nome: "Dra. Carla Méndez",   especialidade: "Endodoncia",            cro_numero: "45678", cro_uf: "PICH", telefone: "+593 99 100 2003", valor_consulta: 60, percentual_repasse: 50, ativo: true, cor: "#10B981" },
  { id: "p4", nome: "Dr. Marcos Silva",    especialidade: "Odontología General",   cro_numero: "56789", cro_uf: "PICH", telefone: "+593 99 100 2004", valor_consulta: 40, percentual_repasse: 45, ativo: true, cor: "#F59E0B" },
];

export const demoProcedimentos = [
  { id: "pr1",  nome: "Evaluación inicial",         codigo_tuss: "99999014", valor: 25,   duracao_minutos: 30, categoria: "Cita" },
  { id: "pr2",  nome: "Limpieza profesional",       codigo_tuss: "99999001", valor: 40,   duracao_minutos: 45, categoria: "Prevención" },
  { id: "pr3",  nome: "Restauración de resina",     codigo_tuss: "99999002", valor: 70,   duracao_minutos: 60, categoria: "Odontología Estética" },
  { id: "pr4",  nome: "Tratamiento de conducto",    codigo_tuss: "99999003", valor: 320,  duracao_minutos: 90, categoria: "Endodoncia" },
  { id: "pr5",  nome: "Blanqueamiento dental",      codigo_tuss: "99999005", valor: 220,  duracao_minutos: 60, categoria: "Estética" },
  { id: "pr6",  nome: "Implante unitario",          codigo_tuss: "99999004", valor: 750,  duracao_minutos: 120, categoria: "Implantología" },
  { id: "pr7",  nome: "Corona de porcelana",        codigo_tuss: "99999010", valor: 450,  duracao_minutos: 90, categoria: "Prótesis" },
  { id: "pr8",  nome: "Ortodoncia — mantenimiento", codigo_tuss: "99999007", valor: 45,   duracao_minutos: 30, categoria: "Ortodoncia" },
  { id: "pr9",  nome: "Carilla de porcelana",       codigo_tuss: "99999012", valor: 350,  duracao_minutos: 90, categoria: "Estética" },
  { id: "pr10", nome: "Extracción simple",          codigo_tuss: "99999008", valor: 60,   duracao_minutos: 45, categoria: "Cirugía" },
  { id: "pr11", nome: "Raspado periodontal",        codigo_tuss: "99999013", valor: 80,   duracao_minutos: 60, categoria: "Periodoncia" },
  { id: "pr12", nome: "Radiografía panorámica",     codigo_tuss: "99999015", valor: 25,   duracao_minutos: 15, categoria: "Diagnóstico" },
];

// ===================== PACIENTES (30) =====================
type Pac = {
  id: string; nome: string; cpf: string; telefone: string; email: string;
  convenio: string; data_nascimento: string;
  status: "ativo" | "inativo" | "novo" | "retorno_pendente";
  tags: string[];
  ultima_consulta: string; dias_sem_consulta: number;
  total_consultas: number; valor_historico: number;
  alergias: string[]; medicamentos_uso: string[]; doencas_preexistentes: string | null;
};

const NOMES_BR = [
  "Ana Beatriz Silva","Carla Mendoza Ribera","Mariana Costa","Patricia Ribera","Juliana Martínez",
  "Beatriz Oliveira","Camila Rodríguez","Larissa Suárez","Renata Barbosa","Aline Castro",
  "Fernanda Díaz","Cintia Piñeiro","Tatiana Moreira","Priscila Gómez","Vanessa Cavalcanti",
  "Bianca Freitas","Carlos Eduardo Pérez","Fernando Almeida","Roberto Carvajal","Lucas Ferrer",
  "Rodrigo Santos","Diego Nascimento","Gabriel Lima","Tiago Méndez","Bruno Araújo",
  "Marcelo Rocha","Vinicio Cárdenas","Eduardo Vieira","Enrique Cunha","Felipe Montero",
];
const CONV = ["IESS","Salud S.A.","Ecuasanitas","BMI Ecuador","Humana Seguros","Particular"];

function build(i: number, status: Pac["status"], tags: string[], diasSem: number, totC: number, valH: number): Pac {
  const nome = NOMES_BR[i];
  return {
    id: `pa${i + 1}`,
    nome,
    cpf: `${1700000000 + i * 137}`,
    telefone: `+593 9${String(80000000 + i * 1373).padStart(8, "0").slice(0, 8)}`,
    email: `${nome.split(" ")[0].toLowerCase()}@email.com`,
    convenio: CONV[i % CONV.length],
    data_nascimento: format(subMonths(today, 240 + i * 7), "yyyy-MM-dd"),
    status, tags,
    ultima_consulta: format(subDays(today, diasSem), "yyyy-MM-dd"),
    dias_sem_consulta: diasSem,
    total_consultas: totC,
    valor_historico: valH,
    alergias: i % 5 === 0 ? ["Penicilina"] : i % 7 === 0 ? ["Látex"] : [],
    medicamentos_uso: i % 6 === 0 ? ["Losartán"] : i % 8 === 0 ? ["Simvastatina"] : [],
    doencas_preexistentes: i % 9 === 0 ? "Hipertensión" : i % 11 === 0 ? "Diabetes tipo 2" : null,
  };
}

export const demoPacientes: Pac[] = [
  // 18 ativos
  build(0,  "ativo", ["vip","recurrente"], 8,  24, 18400),
  build(1,  "ativo", ["vip"], 12, 18, 22500),
  build(2,  "ativo", ["recurrente"], 5, 32, 11800),
  build(3,  "ativo", ["recurrente","revisión_pendiente"], 22, 14, 6800),
  build(4,  "ativo", [], 18, 8, 4200),
  build(5,  "ativo", ["vip","recurrente"], 9, 28, 16200),
  build(6,  "ativo", ["recurrente"], 14, 22, 9400),
  build(7,  "ativo", [], 26, 6, 2800),
  build(8,  "ativo", ["recurrente"], 3, 19, 7800),
  build(9,  "ativo", ["vip"], 11, 21, 19600),
  build(10, "ativo", ["recurrente"], 17, 11, 5400),
  build(11, "ativo", [], 28, 7, 3200),
  build(12, "ativo", ["recurrente","revisión_pendiente"], 20, 13, 6100),
  build(13, "ativo", ["vip","recurrente"], 7, 26, 14200),
  build(14, "ativo", [], 24, 9, 4800),
  build(15, "ativo", ["recurrente"], 16, 15, 6700),
  build(16, "ativo", ["vip"], 13, 17, 11900),
  build(17, "ativo", ["recurrente","revisión_pendiente"], 21, 12, 5600),
  // 8 inativos (>60 dias)
  build(18, "inativo", ["inativo","vip"], 68, 18, 12800),
  build(19, "inativo", ["inativo"], 82, 9, 3400),
  build(20, "inativo", ["inativo","tratamiento_pausado"], 95, 14, 9200),
  build(21, "inativo", ["inativo","vip"], 75, 21, 15600),
  build(22, "inativo", ["inativo"], 110, 6, 1800),
  build(23, "inativo", ["inativo","tratamiento_pausado"], 88, 11, 7400),
  build(24, "inativo", ["inativo"], 72, 8, 2900),
  build(25, "inativo", ["inativo","vip"], 102, 16, 10200),
  // 4 novos
  build(26, "novo", ["novo"], 2, 1, 150),
  build(27, "novo", ["novo"], 5, 1, 150),
  build(28, "novo", ["novo"], 1, 1, 150),
  build(29, "novo", ["novo"], 7, 2, 480),
];

// ===================== CONSULTAS DE HOJE (12) =====================
const tdy = format(today, "yyyy-MM-dd");
const PROCS_NM = ["Limpieza","Evaluación","Restauración","Endodoncia","Mantenimiento Ortodoncia","Blanqueamiento","Implante - 2ª etapa","Corona","Carilla","Extracción"];
const STATUS_HJ = ["concluida","concluida","concluida","en_atención","programada","confirmada","confirmada","programada","programada","ausente","programada","confirmada"];
const HORAS_HJ  = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","13:30","14:00","14:30","16:00","17:30"];

export const consultasHoje = HORAS_HJ.map((hora, i) => {
  const pac = demoPacientes[i];
  const prof = demoProfissionais[i % 4];
  const proc = PROCS_NM[i % PROCS_NM.length];
  return {
    id: `ch${i}`, paciente_id: pac.id, paciente_nome: pac.nome,
    profissional_id: prof.id, profissional_nome: prof.nome,
    procedimento: proc, data: tdy, hora,
    status: STATUS_HJ[i], tipo: "consulta",
    valor_total: prof.valor_consulta + (i % 3) * 80,
  };
});

// Outras consultas (semana inteira + histórico)
const STATUS_W = ["programada","confirmada","concluida","concluida","concluida","cancelada","ausente"];
export const demoConsultas = [
  ...consultasHoje,
  ...Array.from({ length: 78 }).map((_, i) => {
    const pac = demoPacientes[i % demoPacientes.length];
    const prof = demoProfissionais[i % 4];
    const offset = ((i % 21) - 14);
    const st = offset > 0 ? (i % 3 === 0 ? "confirmada" : "programada") : STATUS_W[i % STATUS_W.length];
    return {
      id: `c${i + 1}`, paciente_id: pac.id, paciente_nome: pac.nome,
      profissional_id: prof.id, profissional_nome: prof.nome,
      procedimento: PROCS_NM[i % PROCS_NM.length],
      data: d(offset),
      hora: `${String(8 + (i % 9)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`,
      status: st, tipo: "consulta",
      valor_total: prof.valor_consulta + (i % 3) * 80,
      prontuario: st === "concluida" ? "Atención realizada. Se proporcionaron orientaciones post-operatorias." : null,
    };
  }),
];

// ===================== TRATAMENTOS (24) =====================
const TIPOS_T = [
  "Ortodoncia Fija","Implante Dental","Tratamiento de Conducto","Blanqueamiento + Carillas",
  "Corona de Porcelana","Rehabilitación Total","Alineador Invisible","Prótesis Parcial",
];
const ST_T = ["en_curso","en_curso","en_curso","en_curso","pausado","iniciado","concluido"];

export const demoTratamentos = Array.from({ length: 24 }).map((_, i) => {
  const pac = demoPacientes[i % demoPacientes.length];
  const prof = demoProfissionais[i % 4];
  const tipo = TIPOS_T[i % TIPOS_T.length];
  const status = ST_T[i % ST_T.length];
  const etapas = 4 + (i % 8);
  const concl = status === "concluido" ? etapas : status === "iniciado" ? 0 : Math.floor(etapas * (0.3 + (i % 5) * 0.12));
  return {
    id: `t${i + 1}`,
    paciente_id: pac.id, paciente_nome: pac.nome,
    profissional_id: prof.id, profissional_nome: prof.nome,
    descricao: tipo, tipo,
    dente: ["—","36","11,12,21,22","Arcada superior","47","Todos","14, 15"][i % 7],
    status, data_inicio: d(-(30 + i * 8)),
    proxima_etapa: status === "en_curso" ? `Etapa ${concl + 1} de ${etapas}` : null,
    valor_total: [960,1200,360,1600,500,2800,2400,600][i % 8],
    etapas_total: etapas, etapas_concluidas: concl,
    progresso: Math.round((concl / etapas) * 100),
  };
});

// ===================== ORÇAMENTOS (14) =====================
const ST_ORC = ["aprobado","pendiente","pendiente","enviado","aprobado","rechazado","pendiente","aprobado","enviado","pendiente","pendiente","aprobado","rechazado","pendiente"];

export const demoOrcamentos = Array.from({ length: 14 }).map((_, i) => {
  const pac = demoPacientes[i % demoPacientes.length];
  const prof = demoProfissionais[i % 4];
  const procs = [demoProcedimentos[(i + 2) % demoProcedimentos.length], demoProcedimentos[(i + 5) % demoProcedimentos.length], demoProcedimentos[(i + 7) % demoProcedimentos.length]].slice(0, 1 + (i % 3));
  const itens = procs.map((p) => ({ nome: p.nome, valor: p.valor, qtd: 1 + (i % 2), descricao: p.categoria }));
  const total = itens.reduce((a, it) => a + it.valor * it.qtd, 0);
  const desconto = i % 4 === 0 ? 10 : 0;
  const diasEnv = i * 3 + 1;
  return {
    id: `o${i + 1}`,
    numero: `ORC-${String(i + 1).padStart(3, "0")}`,
    paciente_id: pac.id, paciente_nome: pac.nome,
    profissional_id: prof.id, profissional_nome: prof.nome,
    data: d(-diasEnv),
    validade: d(30 - diasEnv),
    dias_desde_envio: diasEnv,
    status: ST_ORC[i],
    itens, total,
    desconto_pct: desconto,
    total_com_desconto: total - (total * desconto) / 100,
    parcelas: [1, 3, 6, 12][i % 4],
    observacoes: "Pago facilitado en hasta 12x sin interés en la tarjeta.",
  };
});

// ===================== FINANCEIRO (80+) =====================
const CAT_REC = [
  ["Cita", 36, 64], ["Tratamiento", 160, 500], ["Presupuesto", 300, 900],
  ["Reembolso", 40, 120], ["Convenio", 30, 56],
] as const;
const CAT_DESP = [
  ["Alquiler", 1100], ["Materiales", 280], ["Laboratorio", 440],
  ["Marketing", 170], ["Nómina", 2760], ["Equipos", 480],
  ["Energía", 184], ["Internet", 76], ["Limpieza", 96], ["Otros", 64],
] as const;

export const demoFinanceiro = (() => {
  const lst: any[] = [];
  // 60 receitas distribuídas no mês
  for (let i = 0; i < 60; i++) {
    const [cat, min, max] = CAT_REC[i % CAT_REC.length];
    lst.push({
      id: `r${i}`,
      tipo: "receita",
      descricao: `${cat} — ${demoPacientes[i % demoPacientes.length].nome}`,
      categoria: cat,
      valor: Math.round(min + Math.random() * (max - min)),
      data: format(subDays(today, i % 28), "yyyy-MM-dd"),
      forma_pagamento: ["Transferencia","Tarjeta de crédito","Tarjeta de débito","Efectivo","Cheque"][i % 5],
      status: i % 9 === 0 ? "pendiente" : i % 13 === 0 ? "atrasado" : "pagado",
    });
  }
  // 25 despesas
  for (let i = 0; i < 25; i++) {
    const [c, v] = CAT_DESP[i % CAT_DESP.length];
    lst.push({
      id: `dp${i}`,
      tipo: "despesa",
      descricao: c,
      categoria: c,
      valor: v + (i % 5) * 80,
      data: format(subDays(today, (i * 2) % 28), "yyyy-MM-dd"),
      forma_pagamento: "Transferencia",
      status: i % 11 === 0 ? "pendiente" : "pagado",
    });
  }
  return lst;
})();

// ===================== KPIs DEMO =====================
export const DEMO_KPI = {
  consultasHoje: 12,
  consultasSemana: 78,
  consultasMes: 287,
  pacientesAtivos: 412,
  pacientesInativos: 38,
  revisoesPendentes: 18,
  tratamentosAndamento: 24,
  orcamentosPendentes: 14,
  faturamentoMes: 9560,
  aReceber: 3680,
  recebidoMes: 5880,
  despesasMes: 4480,
  ticketMedio: 57,
  taxaOcupacao: 0.82,
  taxaCancelamento: 0.06,
  taxaFaltasHoje: 0.16,
};

// ===================== ALERTAS DASHBOARD =====================
export const DEMO_ALERTAS = [
  { tone: "red",   titulo: "Tasa de ausencias alta hoy: 16%",              desc: "2 pacientes faltaron. Considere overbooking en los próximos espacios.", cta: "Ver agenda" },
  { tone: "amber", titulo: "8 presupuestos detenidos hace +14 días",       desc: "Potencial de $ 4.680 perdido sin seguimiento.",                          cta: "Disparar seguimiento" },
  { tone: "sky",   titulo: "5 pacientes VIP sin retorno hace +60 días",    desc: "Reactivar puede generar $ 1.700 en citas.",                              cta: "Reactivar" },
  { tone: "green", titulo: "Carla Mendoza confirmó Implante — Etapa 2",    desc: "Mayor ticket de la semana: $ 760.",                                      cta: "Ver cita" },
];

// ===================== AI GROWTH OPORTUNIDADES =====================
export const demoAIOportunidades = [
  {
    id: "ai1",
    icon: "Users",
    tone: "red",
    titulo: "12 pacientes no retornan hace +30 días",
    desc: "Recupere ingresos reactivando ahora.",
    impacto: 1700,
    pacientes: demoPacientes.filter((p) => p.dias_sem_consulta > 60).slice(0, 6).map((p) => ({
      nome: p.nome, telefone: p.telefone, dias: p.dias_sem_consulta, valor: p.valor_historico,
    })),
    mensagem: "¡Hola, [Nombre]! 😊 ¡Aquí de OdontoControl! Notamos que hace un tiempo que no nos vemos. ¿Qué tal programar una revisión? ¡Estamos aquí para cuidar su sonrisa! 🦷✨",
  },
  {
    id: "ai2",
    icon: "RotateCcw",
    tone: "amber",
    titulo: "8 revisiones pendientes",
    desc: "Pacientes que aún no han programado la revisión semestral.",
    impacto: 320,
    pacientes: demoPacientes.filter((p) => p.tags.includes("revisión_pendiente")).slice(0, 5).map((p) => ({
      nome: p.nome, telefone: p.telefone, dias: p.dias_sem_consulta, valor: p.valor_historico,
    })),
    mensagem: "¡Hola [Nombre]! Es hora de su revisión semestral. ¿Puedo programar su cita esta semana? Tenemos horarios al final de la tarde 😊",
  },
  {
    id: "ai3",
    icon: "Activity",
    tone: "orange",
    titulo: "5 tratamientos pausados hace +30 días",
    desc: "Continúe los tratamientos y recupere ingresos detenidos.",
    impacto: 4800,
    pacientes: demoTratamentos.filter((t) => t.status === "pausado").slice(0, 4).map((t) => ({
      nome: t.paciente_nome, telefone: "+593 99 000 0000", dias: 35, valor: t.valor_total,
    })),
    mensagem: "¡Hola [Nombre]! Nos gustaría dar continuidad a su tratamiento. Tenemos horarios disponibles esta semana, ¿puedo agendarle?",
  },
  {
    id: "ai4",
    icon: "FileText",
    tone: "teal",
    titulo: "6 presupuestos sin respuesta +14 días",
    desc: "El seguimiento genera un 32% de aprobación extra.",
    impacto: 2620,
    pacientes: demoOrcamentos.filter((o) => o.status === "pendiente" && o.dias_desde_envio > 14).slice(0, 5).map((o) => ({
      nome: o.paciente_nome, telefone: "+593 99 000 0000", dias: o.dias_desde_envio, valor: o.total_com_desconto,
    })),
    mensagem: "¡Hola [Nombre]! Pasamos para ver si quedó alguna duda sobre el presupuesto que presentamos. ¡Estamos a disposición para conversar y ofrecer condiciones especiales!",
  },
  {
    id: "ai5",
    icon: "Clock",
    tone: "blue",
    titulo: "Horario débil: Martes y jueves 13h–15h",
    desc: "Solo el 30% de los espacios ocupados en este intervalo.",
    impacto: 840,
    pacientes: [],
    mensagem: "🎁 ¡Promoción relámpago! Limpieza profesional + evaluación los martes y jueves, 13h–15h, con 20% OFF. Vacantes limitadas, ¡reserve ya!",
  },
];

// ===================== HISTÓRICO =====================
export const demoHistorico = Array.from({ length: 30 }).map((_, i) => {
  const pac = demoPacientes[i % demoPacientes.length];
  const tipos = ["anamnesis","examen","procedimiento","observación","receta"];
  return {
    id: `h${i}`,
    paciente_id: pac.id,
    paciente_nome: pac.nome,
    tipo: tipos[i % tipos.length],
    descricao: [
      "Anamnesis inicial realizada.","Radiografía panorámica solicitada.",
      "Restauración clase II en resina, diente 16.","El paciente informó mejora en la sensibilidad.",
      "Receta de amoxicilina 500mg, 7 días.",
    ][i % 5],
    data: format(subDays(today, i * 4), "yyyy-MM-dd"),
    profissional_nome: demoProfissionais[i % demoProfissionais.length].nome,
  };
});

// Compat
export const demoData = {
  clinica: demoClinica,
  profissionais: demoProfissionais,
  procedimentos: demoProcedimentos,
  pacientes: demoPacientes,
  consultas: demoConsultas,
  consultasHoje,
  tratamentos: demoTratamentos,
  orcamentos: demoOrcamentos,
  financeiro: demoFinanceiro,
  historico: demoHistorico,
  kpi: DEMO_KPI,
  alertas: DEMO_ALERTAS,
  ai: demoAIOportunidades,
};
