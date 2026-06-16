import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calcularPremiacaoComEmpate,
  calcularTotalArrecadado,
  calcularValorOrganizacao,
  calcularValorPremiacao,
  criarMapaPremiacao,
} from "../prizeUtils.js";

function itemRanking(participante, total) {
  return {
    participante,
    resumo: { total },
  };
}

describe("prizeUtils", () => {
  it("calcula arrecadacao, organizacao e valor de premiacao", () => {
    const total = calcularTotalArrecadado(37);

    assert.equal(total, 2220);
    assert.equal(calcularValorOrganizacao(total), 111);
    assert.equal(calcularValorPremiacao(total), 2109);
  });

  it("calcula premiacao por posicao sem empate", () => {
    const ranking = [
      itemRanking("Ana", 100),
      itemRanking("Bruno", 90),
      itemRanking("Carla", 80),
    ];

    const premiacao = calcularPremiacaoComEmpate(ranking, 1000);

    assert.deepEqual(
      premiacao.map((item) => ({
        participante: item.participante,
        valor: item.valor,
        percentualGrupo: item.percentualGrupo,
      })),
      [
        { participante: "Ana", valor: 550, percentualGrupo: 55 },
        { participante: "Bruno", valor: 150, percentualGrupo: 15 },
        { participante: "Carla", valor: 110, percentualGrupo: 11 },
      ]
    );
  });

  it("divide a soma das faixas quando ha empate", () => {
    const ranking = [
      itemRanking("Ana", 100),
      itemRanking("Bruno", 100),
      itemRanking("Carla", 80),
    ];

    const premiacao = calcularPremiacaoComEmpate(ranking, 1000);

    assert.equal(premiacao[0].valor, 350);
    assert.equal(premiacao[1].valor, 350);
    assert.equal(premiacao[0].percentualGrupo, 70);
    assert.equal(premiacao[0].posicaoInicial, 1);
    assert.equal(premiacao[0].posicaoFinal, 2);
    assert.equal(premiacao[0].empatado, true);
    assert.equal(premiacao[2].valor, 110);
  });

  it("cria mapa de premiacao por participante", () => {
    const mapa = criarMapaPremiacao(
      [itemRanking("Ana", 100), itemRanking("Bruno", 90)],
      1000
    );

    assert.equal(mapa.Ana.valor, 550);
    assert.equal(mapa.Bruno.valor, 150);
  });
});
