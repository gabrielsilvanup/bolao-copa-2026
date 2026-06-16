export function criarFasesOficiaisPadrao() {
  return {
    dezesseis_avos: [],
    oitavas: [],
    quartas: [],
    semifinal: [],
    final: [],
  };
}

export function criarPosicoesFinaisPadrao() {
  return {
    campeao: null,
    vice: null,
    terceiro: null,
    quarto: null,
  };
}

export function dataHojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function isObjetoSimples(valor) {
  return Boolean(valor) && typeof valor === "object" && !Array.isArray(valor);
}

export function normalizarResultadosOficiais(
  resultadosAtuais = {},
  alteracoes = {}
) {
  const base = isObjetoSimples(resultadosAtuais) ? resultadosAtuais : {};
  const patch = isObjetoSimples(alteracoes) ? alteracoes : {};

  const fasesBase = isObjetoSimples(base.fases_oficiais)
    ? base.fases_oficiais
    : {};
  const fasesPatch = isObjetoSimples(patch.fases_oficiais)
    ? patch.fases_oficiais
    : {};

  const posicoesBase = isObjetoSimples(base.posicoes_finais_oficiais)
    ? base.posicoes_finais_oficiais
    : {};
  const posicoesPatch = isObjetoSimples(patch.posicoes_finais_oficiais)
    ? patch.posicoes_finais_oficiais
    : {};

  const chaveamentoBase = isObjetoSimples(base.chaveamento_oficial)
    ? base.chaveamento_oficial
    : {};
  const chaveamentoPatch = isObjetoSimples(patch.chaveamento_oficial)
    ? patch.chaveamento_oficial
    : {};
  const deveManterChaveamento =
    Object.hasOwn(base, "chaveamento_oficial") ||
    Object.hasOwn(patch, "chaveamento_oficial");

  const resultado = {
    ...base,
    ...patch,
    status: patch.status ?? base.status ?? "EM_ANDAMENTO",
    ultima_atualizacao:
      patch.ultima_atualizacao ?? base.ultima_atualizacao ?? dataHojeISO(),
    jogos: Array.isArray(patch.jogos)
      ? patch.jogos
      : Array.isArray(base.jogos)
      ? base.jogos
      : [],
    fases_oficiais: {
      ...criarFasesOficiaisPadrao(),
      ...fasesBase,
      ...fasesPatch,
    },
    posicoes_finais_oficiais: {
      ...criarPosicoesFinaisPadrao(),
      ...posicoesBase,
      ...posicoesPatch,
    },
  };

  if (deveManterChaveamento) {
    resultado.chaveamento_oficial = {
      ...chaveamentoBase,
      ...chaveamentoPatch,
    };
  }

  return resultado;
}
