export function criarMapaCalendario(calendarioOficial = []) {
  return calendarioOficial.reduce((mapa, jogo) => {
    mapa[Number(jogo.jogo)] = jogo;
    return mapa;
  }, {});
}

export function formatarDataBrasilia(data) {
  if (!data || typeof data !== "string") return "-";

  const [ano, mes, dia] = data.split("-");

  if (!ano || !mes || !dia) return data;

  return `${dia}/${mes}/${ano}`;
}

export function formatarDataCurta(data) {
  if (!data || typeof data !== "string") return "-";

  const [, mes, dia] = data.split("-");

  if (!mes || !dia) return data;

  return `${dia}/${mes}`;
}

export function formatarAgendaJogo(jogoCalendario) {
  if (!jogoCalendario) return "-";

  return `${formatarDataCurta(jogoCalendario.data)} ${jogoCalendario.hora_brasilia}`;
}

export function getDataHojeBrasilia() {
  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const mapa = partes.reduce((resultado, parte) => {
    resultado[parte.type] = parte.value;
    return resultado;
  }, {});

  return `${mapa.year}-${mapa.month}-${mapa.day}`;
}

export function buscaEhJogosDoDia(termo) {
  return ["jogos do dia", "jogo do dia", "jogos de hoje", "hoje"].some(
    (atalho) => termo.includes(atalho)
  );
}

export function nomeMandante(jogo) {
  return jogo?.selecao_a || jogo?.mandante || jogo?.slot_a || "A definir";
}

export function nomeVisitante(jogo) {
  return jogo?.selecao_b || jogo?.visitante || jogo?.slot_b || "A definir";
}

export function textoBuscaCalendario(jogo) {
  return [
    jogo?.jogo,
    jogo?.fase,
    jogo?.grupo ? `grupo ${jogo.grupo}` : "",
    jogo?.data,
    formatarDataBrasilia(jogo?.data),
    formatarDataCurta(jogo?.data),
    jogo?.hora_brasilia,
    jogo?.mandante,
    jogo?.visitante,
    jogo?.selecao_a,
    jogo?.selecao_b,
    jogo?.slot_a,
    jogo?.slot_b,
  ]
    .filter(Boolean)
    .join(" ");
}
