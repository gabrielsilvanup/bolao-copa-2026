import { SCORING_RULES } from "./scoringRules";

export const VALOR_POR_PARTICIPANTE = 60;

const PREMIOS_POR_POSICAO = {
  1: SCORING_RULES.premiacao.primeiro,
  2: SCORING_RULES.premiacao.segundo,
  3: SCORING_RULES.premiacao.terceiro,
  4: SCORING_RULES.premiacao.quarto,
  5: SCORING_RULES.premiacao.quinto,
};

export function formatarDinheiro(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function calcularTotalArrecadado(totalParticipantes) {
  return totalParticipantes * VALOR_POR_PARTICIPANTE;
}

export function calcularValorOrganizacao(totalArrecadado) {
  return totalArrecadado * (SCORING_RULES.premiacao.organizacao / 100);
}

export function calcularValorPremiacao(totalArrecadado) {
  return totalArrecadado - calcularValorOrganizacao(totalArrecadado);
}

export function calcularPremiacaoComEmpate(ranking, valorTotal) {
  const premiacao = [];
  let indice = 0;

  while (indice < ranking.length) {
    const pontos = ranking[indice].resumo.total;
    const empatados = [];

    while (
      indice + empatados.length < ranking.length &&
      ranking[indice + empatados.length].resumo.total === pontos
    ) {
      empatados.push(ranking[indice + empatados.length]);
    }

    const posicaoInicial = indice + 1;
    const posicaoFinal = indice + empatados.length;

    let percentualGrupo = 0;

    for (let posicao = posicaoInicial; posicao <= posicaoFinal; posicao += 1) {
      percentualGrupo += PREMIOS_POR_POSICAO[posicao] || 0;
    }

    const valorGrupo = valorTotal * (percentualGrupo / 100);
    const valorPorPessoa =
      empatados.length > 0 ? valorGrupo / empatados.length : 0;

    empatados.forEach((item) => {
      premiacao.push({
        participante: item.participante,
        pontos,
        posicaoInicial,
        posicaoFinal,
        empatado: empatados.length > 1,
        percentualGrupo,
        valor: valorPorPessoa,
      });
    });

    indice += empatados.length;
  }

  return premiacao;
}

export function criarMapaPremiacao(ranking, valorTotal) {
  const premiacao = calcularPremiacaoComEmpate(ranking, valorTotal);

  return premiacao.reduce((mapa, item) => {
    mapa[item.participante] = item;
    return mapa;
  }, {});
}

export function posicaoPremiacaoTexto(item) {
  if (!item) return "-";

  if (!item.empatado) {
    return `${item.posicaoInicial}º`;
  }

  return `${item.posicaoInicial}º ao ${item.posicaoFinal}º`;
}