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

  it("divide 55% e 15% entre dois empatados em primeiro", () => {
    const ranking = [
      itemRanking("Ana", 100),
      itemRanking("Bruno", 100),
      itemRanking("Carla", 80),
      itemRanking("Diego", 70),
    ];

    const premiacao = calcularPremiacaoComEmpate(ranking, 1000);
    const ana = premiacao.find((item) => item.participante === "Ana");
    const bruno = premiacao.find((item) => item.participante === "Bruno");
    const carla = premiacao.find((item) => item.participante === "Carla");

    assert.equal(ana.percentualGrupo, 70);
    assert.equal(bruno.percentualGrupo, 70);
    assert.equal(ana.valor, 350);
    assert.equal(bruno.valor, 350);
    assert.equal(ana.posicaoInicial, 1);
    assert.equal(ana.posicaoFinal, 2);
    assert.equal(carla.posicaoInicial, 3);
    assert.equal(carla.valor, 110);
  });

  it("divide 15%, 11% e 8% entre tres empatados em segundo", () => {
    const ranking = [
      itemRanking("Ana", 110),
      itemRanking("Bruno", 100),
      itemRanking("Carla", 100),
      itemRanking("Diego", 100),
      itemRanking("Erika", 80),
    ];

    const premiacao = calcularPremiacaoComEmpate(ranking, 1000);
    const empatados = premiacao.filter((item) => item.pontos === 100);
    const erika = premiacao.find((item) => item.participante === "Erika");

    assert.equal(empatados.length, 3);
    empatados.forEach((item) => {
      assert.equal(item.posicaoInicial, 2);
      assert.equal(item.posicaoFinal, 4);
      assert.equal(item.percentualGrupo, 34);
      assert.equal(item.valor, 340 / 3);
      assert.equal(item.empatado, true);
    });
    assert.equal(erika.posicaoInicial, 5);
    assert.equal(erika.valor, 60);
  });

  it("nao adiciona premio para faixa acima do quinto lugar em empate", () => {
    const ranking = [
      itemRanking("Ana", 120),
      itemRanking("Bruno", 110),
      itemRanking("Carla", 100),
      itemRanking("Diego", 100),
      itemRanking("Erika", 100),
      itemRanking("Fabio", 100),
      itemRanking("Gabi", 90),
    ];

    const premiacao = calcularPremiacaoComEmpate(ranking, 1000);
    const empatados = premiacao.filter((item) => item.pontos === 100);
    const gabi = premiacao.find((item) => item.participante === "Gabi");

    assert.equal(empatados.length, 4);
    empatados.forEach((item) => {
      assert.equal(item.posicaoInicial, 3);
      assert.equal(item.posicaoFinal, 6);
      assert.equal(item.percentualGrupo, 25);
      assert.equal(item.valor, 62.5);
    });
    assert.equal(gabi.posicaoInicial, 7);
    assert.equal(gabi.percentualGrupo, 0);
    assert.equal(gabi.valor, 0);
  });

  it("mantem organizacao com 5% separados da divisao entre participantes", () => {
    const ranking = [
      itemRanking("Ana", 100),
      itemRanking("Bruno", 100),
    ];

    const totalArrecadado = 1000;
    const premiacao = calcularPremiacaoComEmpate(ranking, totalArrecadado);
    const valorParticipantes = premiacao.reduce(
      (total, item) => total + item.valor,
      0
    );

    assert.equal(calcularValorOrganizacao(totalArrecadado), 50);
    assert.equal(calcularValorPremiacao(totalArrecadado), 950);
    assert.equal(valorParticipantes, 700);
    assert.equal(premiacao[0].valor, 350);
    assert.equal(premiacao[1].valor, 350);
  });

  it("cria mapa de premiacao por participante", () => {
    const mapa = criarMapaPremiacao(
      [itemRanking("Ana", 100), itemRanking("Bruno", 90)],
      1000
    );

    assert.equal(mapa.Ana.valor, 550);
    assert.equal(mapa.Bruno.valor, 150);
  });

  it("cria mapa de premiacao com valores de participantes empatados", () => {
    const mapa = criarMapaPremiacao(
      [
        itemRanking("Ana", 100),
        itemRanking("Bruno", 100),
        itemRanking("Carla", 80),
      ],
      1000
    );

    assert.equal(mapa.Ana.valor, 350);
    assert.equal(mapa.Bruno.valor, 350);
    assert.equal(mapa.Ana.posicaoInicial, 1);
    assert.equal(mapa.Ana.posicaoFinal, 2);
    assert.equal(mapa.Bruno.percentualGrupo, 70);
    assert.equal(mapa.Carla.valor, 110);
  });
});
