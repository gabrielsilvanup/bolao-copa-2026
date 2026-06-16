import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  atualizarChaveamentoEProgressoes,
  gerarChaveamentoCompleto,
  getJogosDependentes,
  removerResultadosDependentes,
} from "../knockoutUtils.js";

function resultadoMataMata(sobrescritas = {}) {
  return {
    jogo: 73,
    fase: "dezesseis_avos",
    selecao_a: "Mexico",
    gols_a: 1,
    gols_b: 0,
    selecao_b: "Canada",
    penaltis_a: null,
    penaltis_b: null,
    resultado_oficial: "A",
    vencedor_oficial: "Mexico",
    perdedor_oficial: "Canada",
    encerrado: true,
    ...sobrescritas,
  };
}

describe("knockoutUtils", () => {
  it("lista jogos dependentes de um jogo de dezesseis avos", () => {
    assert.deepEqual(getJogosDependentes(73), [90, 97, 101, 103, 104]);
  });

  it("remove resultados dependentes sem remover o jogo fonte", () => {
    const jogos = [
      { jogo: 73 },
      { jogo: 90 },
      { jogo: 97 },
      { jogo: 101 },
      { jogo: 104 },
      { jogo: 74 },
    ];

    assert.deepEqual(removerResultadosDependentes(jogos, 73), [
      { jogo: 73 },
      { jogo: 74 },
    ]);
  });

  it("propaga vencedores para a fase seguinte pelo vencedor_oficial salvo", () => {
    const chaveamento = gerarChaveamentoCompleto({
      jogos: [
        resultadoMataMata({
          jogo: 73,
          selecao_a: "Mexico",
          selecao_b: "Canada",
          vencedor_oficial: "Mexico",
          perdedor_oficial: "Canada",
        }),
        resultadoMataMata({
          jogo: 75,
          selecao_a: "Brazil",
          selecao_b: "Spain",
          vencedor_oficial: "Spain",
          perdedor_oficial: "Brazil",
        }),
      ],
      chaveamento_oficial: {
        dezesseis_avos: [
          { jogo: 73, fase: "dezesseis_avos", selecao_a: "Mexico", selecao_b: "Canada" },
          { jogo: 75, fase: "dezesseis_avos", selecao_a: "Brazil", selecao_b: "Spain" },
        ],
      },
    });

    const jogo90 = chaveamento.oitavas.find((jogo) => jogo.jogo === 90);

    assert.equal(jogo90.selecao_a, "Mexico");
    assert.equal(jogo90.selecao_b, "Spain");
  });

  it("registra o comportamento atual de empate decidido nos penaltis", () => {
    const chaveamento = gerarChaveamentoCompleto({
      jogos: [
        resultadoMataMata({
          jogo: 73,
          gols_a: 1,
          gols_b: 1,
          penaltis_a: 4,
          penaltis_b: 3,
          resultado_oficial: "EMPATE",
          vencedor_oficial: "Mexico",
          perdedor_oficial: "Canada",
        }),
      ],
      chaveamento_oficial: {
        dezesseis_avos: [
          { jogo: 73, fase: "dezesseis_avos", selecao_a: "Mexico", selecao_b: "Canada" },
        ],
      },
    });

    const jogo90 = chaveamento.oitavas.find((jogo) => jogo.jogo === 90);

    assert.equal(jogo90.selecao_a, "Mexico");
  });

  it("atualiza fases oficiais e posicoes finais a partir dos resultados salvos", () => {
    const resultados = atualizarChaveamentoEProgressoes({
      ultima_atualizacao: "2026-06-16",
      jogos: [
        resultadoMataMata({
          jogo: 73,
          vencedor_oficial: "Mexico",
          perdedor_oficial: "Canada",
        }),
        resultadoMataMata({
          jogo: 104,
          fase: "final",
          selecao_a: "Mexico",
          selecao_b: "Spain",
          vencedor_oficial: "Spain",
          perdedor_oficial: "Mexico",
        }),
        resultadoMataMata({
          jogo: 103,
          fase: "terceiro_lugar",
          selecao_a: "Brazil",
          selecao_b: "France",
          vencedor_oficial: "Brazil",
          perdedor_oficial: "France",
        }),
      ],
      fases_oficiais: {},
      posicoes_finais_oficiais: {},
      chaveamento_oficial: {
        dezesseis_avos: [
          { jogo: 73, fase: "dezesseis_avos", selecao_a: "Mexico", selecao_b: "Canada" },
        ],
      },
    });

    assert.deepEqual(resultados.fases_oficiais.oitavas, ["Mexico"]);
    assert.deepEqual(resultados.posicoes_finais_oficiais, {
      campeao: "Spain",
      vice: "Mexico",
      terceiro: "Brazil",
      quarto: "France",
    });
  });
});
