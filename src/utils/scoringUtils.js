import { SCORING_RULES } from "./scoringRules";

const FASES_PONTUAVEIS = [
  "dezesseis_avos",
  "oitavas",
  "quartas",
  "semifinal",
  "final",
];

const POSICOES_FINAIS = ["quarto", "terceiro", "vice", "campeao"];

export function jogoFoiPreenchido(jogo) {
  return jogo.gols_a !== null && jogo.gols_b !== null;
}

export function resultadoPeloPlacar(golsA, golsB) {
  if (golsA === null || golsB === null) return null;
  if (golsA > golsB) return "A";
  if (golsB > golsA) return "B";
  return "EMPATE";
}

export function criarMapaResultados(resultadosOficiais) {
  const jogos = resultadosOficiais?.jogos || [];

  return jogos.reduce((mapa, jogo) => {
    mapa[jogo.jogo] = jogo;
    return mapa;
  }, {});
}

export function calcularPontuacaoJogo(palpite, resultadoOficial) {
  if (!resultadoOficial || !resultadoOficial.encerrado) {
    return {
      pontos: 0,
      status: "pendente",
      acertouResultado: false,
      acertouPlacar: false,
    };
  }

  if (palpite.fase !== "grupos") {
    return {
      pontos: 0,
      status: "mata_mata_por_fase",
      acertouResultado: false,
      acertouPlacar: false,
    };
  }

  if (!jogoFoiPreenchido(palpite)) {
    return {
      pontos: 0,
      status: "nao_preenchido",
      acertouResultado: false,
      acertouPlacar: false,
    };
  }

  let pontos = 0;

  const acertouResultado =
    resultadoOficial.vencedor_oficial != null
      ? palpite.vencedor_previsto === resultadoOficial.vencedor_oficial
      : palpite.resultado_previsto === resultadoOficial.resultado_oficial;

  if (acertouResultado) {
    pontos += SCORING_RULES.resultadoCorreto;
  }

  const acertouPlacar =
    palpite.gols_a === resultadoOficial.gols_a &&
    palpite.gols_b === resultadoOficial.gols_b;

  if (acertouPlacar) {
    pontos += SCORING_RULES.placarExatoBonus;
  }

  return {
    pontos,
    status: "calculado",
    acertouResultado,
    acertouPlacar,
  };
}

function criarSetSelecoes(lista) {
  return new Set((lista || []).filter(Boolean).map((selecao) => selecao.trim()));
}

export function calcularPontuacaoFases(participante, resultadosOficiais) {
  const fasesParticipante = participante?.fases || {};
  const fasesOficiais = resultadosOficiais?.fases_oficiais || {};

  return FASES_PONTUAVEIS.reduce(
    (resumo, fase) => {
      const selecoesParticipante = criarSetSelecoes(fasesParticipante[fase]);
      const selecoesOficiais = criarSetSelecoes(fasesOficiais[fase]);

      let acertos = 0;

      selecoesParticipante.forEach((selecao) => {
        if (selecoesOficiais.has(selecao)) {
          acertos += 1;
        }
      });

      const pontos = acertos * SCORING_RULES.fases[fase];

      resumo.total += pontos;
      resumo.detalhes[fase] = {
        acertos,
        pontos,
        valorPorAcerto: SCORING_RULES.fases[fase],
      };

      return resumo;
    },
    {
      total: 0,
      detalhes: {},
    }
  );
}

export function calcularPontuacaoPosicoesFinais(participante, resultadosOficiais) {
  const posicoesParticipante = participante?.posicoes_finais || {};
  const posicoesOficiais =
    resultadosOficiais?.posicoes_finais_oficiais || {};

  return POSICOES_FINAIS.reduce(
    (resumo, posicao) => {
      const palpite = posicoesParticipante[posicao];
      const oficial = posicoesOficiais[posicao];

      const acertou = oficial !== null && oficial !== undefined && palpite === oficial;
      const pontos = acertou ? SCORING_RULES.posicoesFinais[posicao] : 0;

      resumo.total += pontos;
      resumo.detalhes[posicao] = {
        palpite,
        oficial,
        acertou,
        pontos,
        valor: SCORING_RULES.posicoesFinais[posicao],
      };

      return resumo;
    },
    {
      total: 0,
      detalhes: {},
    }
  );
}

export function calcularPontuacaoParticipante(participante, resultadosOficiais) {
  if (!participante) {
    return {
      total: 0,
      pontosJogos: 0,
      pontosFases: 0,
      pontosPosicoesFinais: 0,
      jogosEncerrados: 0,
      jogosPontuados: 0,
      acertosResultado: 0,
      placaresExatos: 0,
      fases: {},
      posicoesFinais: {},
    };
  }

  const mapaResultados = criarMapaResultados(resultadosOficiais);

  const resumoJogos = participante.jogos.reduce(
    (resumo, palpite) => {
      const resultadoOficial = mapaResultados[palpite.jogo];
      const calculo = calcularPontuacaoJogo(palpite, resultadoOficial);

      if (resultadoOficial?.encerrado) {
        resumo.jogosEncerrados += 1;
      }

      if (calculo.status === "calculado") {
        resumo.jogosPontuados += 1;
      }

      if (calculo.acertouResultado) {
        resumo.acertosResultado += 1;
      }

      if (calculo.acertouPlacar) {
        resumo.placaresExatos += 1;
      }

      resumo.pontosJogos += calculo.pontos;

      return resumo;
    },
    {
      pontosJogos: 0,
      jogosEncerrados: 0,
      jogosPontuados: 0,
      acertosResultado: 0,
      placaresExatos: 0,
    }
  );

  const resumoFases = calcularPontuacaoFases(participante, resultadosOficiais);
  const resumoPosicoes = calcularPontuacaoPosicoesFinais(
    participante,
    resultadosOficiais
  );

  return {
    total:
      resumoJogos.pontosJogos + resumoFases.total + resumoPosicoes.total,
    pontosJogos: resumoJogos.pontosJogos,
    pontosFases: resumoFases.total,
    pontosPosicoesFinais: resumoPosicoes.total,
    jogosEncerrados: resumoJogos.jogosEncerrados,
    jogosPontuados: resumoJogos.jogosPontuados,
    acertosResultado: resumoJogos.acertosResultado,
    placaresExatos: resumoJogos.placaresExatos,
    fases: resumoFases.detalhes,
    posicoesFinais: resumoPosicoes.detalhes,
  };
}

export function calcularRanking(participantes, resultadosOficiais) {
  const rankingOrdenado = participantes
    .map((participante) => {
      const resumo = calcularPontuacaoParticipante(
        participante,
        resultadosOficiais
      );

      return {
        participante: participante.participante,
        arquivo_origem: participante.arquivo_origem,
        status_extracao: participante.status_extracao,
        resumo,
        dados: participante,
      };
    })
    .sort((a, b) => {
      if (b.resumo.total !== a.resumo.total) {
        return b.resumo.total - a.resumo.total;
      }

      return a.participante.localeCompare(b.participante);
    });

  let ultimaPontuacao = null;
  let posicaoAtual = 0;

  return rankingOrdenado.map((item, index) => {
    if (item.resumo.total !== ultimaPontuacao) {
      posicaoAtual = index + 1;
      ultimaPontuacao = item.resumo.total;
    }

    const totalEmpatados = rankingOrdenado.filter(
      (outro) => outro.resumo.total === item.resumo.total
    ).length;

    return {
      ...item,
      posicao: posicaoAtual,
      empatado: totalEmpatados > 1,
      totalEmpatados,
    };
  });
}