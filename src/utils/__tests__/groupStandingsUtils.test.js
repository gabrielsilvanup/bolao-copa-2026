import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calcularClassificacaoGrupos,
  getGrupoDaSelecao,
} from "../groupStandingsUtils.js";

describe("groupStandingsUtils", () => {
  it("identifica o grupo de uma selecao conhecida", () => {
    assert.equal(getGrupoDaSelecao("Mexico"), "A");
    assert.equal(getGrupoDaSelecao("Brazil"), "C");
    assert.equal(getGrupoDaSelecao(null), null);
    assert.equal(getGrupoDaSelecao("Selecao Inexistente"), null);
  });

  it("calcula pontos, saldo e gols marcados de um grupo", () => {
    const classificacao = calcularClassificacaoGrupos(
      [],
      {
        jogos: [
          {
            jogo: 1,
            fase: "grupos",
            selecao_a: "Mexico",
            gols_a: 2,
            gols_b: 0,
            selecao_b: "South Africa",
            encerrado: true,
          },
          {
            jogo: 2,
            fase: "grupos",
            selecao_a: "Rep. of Korea",
            gols_a: 1,
            gols_b: 1,
            selecao_b: "Czech Rep.",
            encerrado: true,
          },
          {
            jogo: 3,
            fase: "grupos",
            selecao_a: "Mexico",
            gols_a: 1,
            gols_b: 1,
            selecao_b: "Rep. of Korea",
            encerrado: false,
          },
        ],
      }
    );

    const grupoA = classificacao.grupos.A;
    const mexico = grupoA.find((item) => item.selecao === "Mexico");
    const southAfrica = grupoA.find((item) => item.selecao === "South Africa");
    const korea = grupoA.find((item) => item.selecao === "Rep. of Korea");

    assert.equal(mexico.pontos, 3);
    assert.equal(mexico.saldo, 2);
    assert.equal(mexico.golsPro, 2);
    assert.equal(southAfrica.pontos, 0);
    assert.equal(southAfrica.saldo, -2);
    assert.equal(korea.pontos, 1);
    assert.equal(classificacao.resumo.jogosGrupoCadastrados, 2);
    assert.equal(classificacao.resumo.todosJogosGrupoEncerrados, false);
  });
});
