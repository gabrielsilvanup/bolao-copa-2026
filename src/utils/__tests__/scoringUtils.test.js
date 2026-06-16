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

  it("registra o comportamento atual: jogo de mata-mata nao pontua por placar", () => {
    const calculo = calcularPontuacaoJogo(
      criarPalpite({ fase: "oitavas" }),
      criarResultado({ fase: "oitavas" })
    );

    assert.equal(calculo.pontos, 0);
    assert.equal(calculo.status, "mata_mata_por_fase");
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

  it("ordena ranking por pontos e desempata por nome mantendo posicao empatada", () => {
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
});
