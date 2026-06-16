import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calcularPontuacaoJogo,
  calcularPontuacaoParticipante,
  calcularRanking,
  resultadoPeloPlacar,
} from "../scoringUtils.js";

function criarPalpite(sobrescritas = {}) {
  return {
    jogo: 1,
    fase: "grupos",
    selecao_a: "Brazil",
    gols_a: 2,
    gols_b: 1,
    selecao_b: "Morocco",
    penaltis_a: null,
    penaltis_b: null,
    resultado_previsto: "A",
    vencedor_previsto: "Brazil",
    perdedor_previsto: "Morocco",
    ...sobrescritas,
  };
}

function criarResultado(sobrescritas = {}) {
  return {
    jogo: 1,
    fase: "grupos",
    selecao_a: "Brazil",
    gols_a: 1,
    gols_b: 0,
    selecao_b: "Morocco",
    penaltis_a: null,
    penaltis_b: null,
    resultado_oficial: "A",
    vencedor_oficial: "Brazil",
    perdedor_oficial: "Morocco",
    encerrado: true,
    ...sobrescritas,
  };
}

function participanteComFases(participante, fases = {}) {
  return {
    participante,
    arquivo_origem: `${participante}.json`,
    status_extracao: "ok",
    jogos: [],
    fases,
  };
}

const RESULTADOS_OFICIAIS_RANKING = {
  jogos: [],
  fases_oficiais: {
    dezesseis_avos: ["Germany"],
    oitavas: ["Spain"],
    final: ["Brazil"],
  },
};

describe("resultadoPeloPlacar", () => {
  it("calcula resultado basico a partir dos gols", () => {
    assert.equal(resultadoPeloPlacar(2, 1), "A");
    assert.equal(resultadoPeloPlacar(1, 2), "B");
    assert.equal(resultadoPeloPlacar(1, 1), "EMPATE");
    assert.equal(resultadoPeloPlacar(null, 1), null);
  });
});

describe("calcularPontuacaoJogo", () => {
  it("da 10 pontos quando acerta apenas o resultado", () => {
    const calculo = calcularPontuacaoJogo(
      criarPalpite({ gols_a: 2, gols_b: 1 }),
      criarResultado({ gols_a: 1, gols_b: 0 })
    );

    assert.equal(calculo.pontos, 10);
    assert.equal(calculo.status, "calculado");
    assert.equal(calculo.acertouResultado, true);
    assert.equal(calculo.acertouPlacar, false);
  });

  it("da 15 pontos quando acerta resultado e placar exato", () => {
    const calculo = calcularPontuacaoJogo(
      criarPalpite({ gols_a: 1, gols_b: 0 }),
      criarResultado({ gols_a: 1, gols_b: 0 })
    );

    assert.equal(calculo.pontos, 15);
    assert.equal(calculo.acertouResultado, true);
    assert.equal(calculo.acertouPlacar, true);
  });

  it("mantem jogo pendente sem resultado oficial encerrado", () => {
    assert.deepEqual(calcularPontuacaoJogo(criarPalpite(), null), {
      pontos: 0,
      status: "pendente",
      acertouResultado: false,
      acertouPlacar: false,
    });

    assert.equal(
      calcularPontuacaoJogo(criarPalpite(), criarResultado({ encerrado: false }))
        .status,
      "pendente"
    );
  });

  it("nao pontua palpite com placar null", () => {
    const calculo = calcularPontuacaoJogo(
      criarPalpite({ gols_a: null }),
      criarResultado()
    );

    assert.equal(calculo.pontos, 0);
    assert.equal(calculo.status, "nao_preenchido");
  });

  it("ignora penaltis preenchidos quando os gols nao empatam", () => {
    const calculo = calcularPontuacaoJogo(
      criarPalpite({
        gols_a: 2,
        gols_b: 1,
        penaltis_a: 0,
        penaltis_b: 5,
      }),
      criarResultado({
        gols_a: 2,
        gols_b: 1,
        penaltis_a: null,
        penaltis_b: null,
      })
    );

    assert.equal(calculo.pontos, 15);
    assert.equal(calculo.acertouPlacar, true);
  });

  it("nao pontua resultado nem placar em jogo de mata-mata", () => {
    const calculo = calcularPontuacaoJogo(
      criarPalpite({
        jogo: 89,
        fase: "oitavas",
        gols_a: 1,
        gols_b: 0,
        vencedor_previsto: "Brazil",
        perdedor_previsto: "Morocco",
      }),
      criarResultado({
        jogo: 89,
        fase: "oitavas",
        gols_a: 1,
        gols_b: 0,
        vencedor_oficial: "Brazil",
        perdedor_oficial: "Morocco",
      })
    );

    assert.equal(calculo.pontos, 0);
    assert.equal(calculo.status, "mata_mata_por_fase");
    assert.equal(calculo.acertouResultado, false);
    assert.equal(calculo.acertouPlacar, false);
  });
});

describe("calcularPontuacaoParticipante e calcularRanking", () => {
  it("soma pontos de jogos, fases e posicoes finais", () => {
    const participante = {
      participante: "Ana",
      arquivo_origem: "ana.json",
      status_extracao: "ok",
      jogos: [criarPalpite({ gols_a: 1, gols_b: 0 })],
      fases: {
        dezesseis_avos: ["Brazil", "Spain"],
      },
      posicoes_finais: {
        campeao: "Brazil",
      },
    };

    const resultadosOficiais = {
      jogos: [criarResultado({ gols_a: 1, gols_b: 0 })],
      fases_oficiais: {
        dezesseis_avos: ["Brazil", "France"],
      },
      posicoes_finais_oficiais: {
        campeao: "Brazil",
      },
    };

    const resumo = calcularPontuacaoParticipante(
      participante,
      resultadosOficiais
    );

    assert.equal(resumo.pontosJogos, 15);
    assert.equal(resumo.pontosFases, 10);
    assert.equal(resumo.pontosPosicoesFinais, 60);
    assert.equal(resumo.total, 85);
  });

  it("pontua mata-mata apenas por avanco de fase e posicoes finais", () => {
    const participante = {
      participante: "Ana",
      arquivo_origem: "ana.json",
      status_extracao: "ok",
      jogos: [
        criarPalpite({
          jogo: 89,
          fase: "oitavas",
          gols_a: 1,
          gols_b: 0,
          vencedor_previsto: "Brazil",
          perdedor_previsto: "Morocco",
        }),
      ],
      fases: {
        oitavas: ["Brazil"],
      },
      posicoes_finais: {
        campeao: "Brazil",
      },
    };

    const resultadosOficiais = {
      jogos: [
        criarResultado({
          jogo: 89,
          fase: "oitavas",
          gols_a: 1,
          gols_b: 0,
          vencedor_oficial: "Brazil",
          perdedor_oficial: "Morocco",
        }),
      ],
      fases_oficiais: {
        oitavas: ["Brazil"],
      },
      posicoes_finais_oficiais: {
        campeao: "Brazil",
      },
    };

    const resumo = calcularPontuacaoParticipante(
      participante,
      resultadosOficiais
    );

    assert.equal(resumo.pontosJogos, 0);
    assert.equal(resumo.jogosEncerrados, 1);
    assert.equal(resumo.jogosPontuados, 0);
    assert.equal(resumo.pontosFases, 15);
    assert.equal(resumo.pontosPosicoesFinais, 60);
    assert.equal(resumo.total, 75);
  });

  it("mantem mesma posicao para empatados sem criterio de desempate", () => {
    const participantes = [
      {
        participante: "Bruno",
        arquivo_origem: "bruno.json",
        status_extracao: "ok",
        jogos: [],
      },
      {
        participante: "Ana",
        arquivo_origem: "ana.json",
        status_extracao: "ok",
        jogos: [],
      },
    ];

    const ranking = calcularRanking(participantes, { jogos: [] });

    assert.deepEqual(
      ranking.map((item) => item.participante),
      ["Ana", "Bruno"]
    );
    assert.deepEqual(
      ranking.map((item) => item.posicao),
      [1, 1]
    );
    assert.equal(ranking[0].empatado, true);
    assert.equal(ranking[0].totalEmpatados, 2);
  });

  it("mantem empate em primeiro com posicoes 1, 1, 3 e 4", () => {
    const participantes = [
      participanteComFases("Zara", { final: ["Brazil"] }),
      participanteComFases("Bruno", { oitavas: ["Spain"] }),
      participanteComFases("Ana", { final: ["Brazil"] }),
      participanteComFases("Diego"),
    ];

    const ranking = calcularRanking(participantes, RESULTADOS_OFICIAIS_RANKING);

    assert.deepEqual(
      ranking.map((item) => item.participante),
      ["Ana", "Zara", "Bruno", "Diego"]
    );
    assert.deepEqual(
      ranking.map((item) => item.resumo.total),
      [30, 30, 15, 0]
    );
    assert.deepEqual(
      ranking.map((item) => item.posicao),
      [1, 1, 3, 4]
    );
    assert.equal(ranking[0].totalEmpatados, 2);
    assert.equal(ranking[1].totalEmpatados, 2);
  });

  it("mantem empate em segundo com posicoes 1, 2, 2, 2 e 5", () => {
    const participantes = [
      participanteComFases("Lider", { final: ["Brazil"] }),
      participanteComFases("Zara", { oitavas: ["Spain"] }),
      participanteComFases("Bruno", { oitavas: ["Spain"] }),
      participanteComFases("Ana", { oitavas: ["Spain"] }),
      participanteComFases("Quinto", { dezesseis_avos: ["Germany"] }),
    ];

    const ranking = calcularRanking(participantes, RESULTADOS_OFICIAIS_RANKING);

    assert.deepEqual(
      ranking.map((item) => item.participante),
      ["Lider", "Ana", "Bruno", "Zara", "Quinto"]
    );
    assert.deepEqual(
      ranking.map((item) => item.resumo.total),
      [30, 15, 15, 15, 10]
    );
    assert.deepEqual(
      ranking.map((item) => item.posicao),
      [1, 2, 2, 2, 5]
    );
    assert.deepEqual(
      ranking.map((item) => item.totalEmpatados),
      [1, 3, 3, 3, 1]
    );
  });
});
