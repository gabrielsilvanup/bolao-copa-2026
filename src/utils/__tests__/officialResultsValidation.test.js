import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  normalizarFormatoResultadosOficiais,
  validarResultadosOficiais,
} from "../officialResultsValidation.js";

function criarJogoOficial(sobrescritas = {}) {
  return {
    jogo: 1,
    fase: "grupos",
    selecao_a: "Brazil",
    gols_a: 2,
    gols_b: 1,
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

function mensagens(itens) {
  return itens.map((item) => item.mensagem).join(" | ");
}

describe("validarResultadosOficiais", () => {
  it("aceita JSON valido sem erros", () => {
    const validacao = validarResultadosOficiais({
      status: "EM_ANDAMENTO",
      ultima_atualizacao: "2026-06-16",
      jogos: [criarJogoOficial()],
      fases_oficiais: {},
      posicoes_finais_oficiais: {},
      chaveamento_oficial: {},
    });

    assert.equal(validacao.valido, true);
    assert.equal(validacao.erros.length, 0);
    assert.equal(validacao.avisos.length, 0);
  });

  it("aceita e preserva chaves futuras", () => {
    const jogoSemId = criarJogoOficial();
    delete jogoSemId.jogo;

    const dados = {
      status: "EM_ANDAMENTO",
      campo_futuro: { habilitado: true },
      jogos: {
        1: jogoSemId,
      },
    };

    const validacao = validarResultadosOficiais(dados);
    const normalizado = normalizarFormatoResultadosOficiais(dados);

    assert.equal(validacao.valido, true);
    assert.equal(validacao.erros.length, 0);
    assert.equal(normalizado.campo_futuro, dados.campo_futuro);
    assert.equal(normalizado.jogos[0].jogo, 1);
  });

  it("rejeita jogos duplicados", () => {
    const validacao = validarResultadosOficiais({
      jogos: [criarJogoOficial(), criarJogoOficial()],
    });

    assert.equal(validacao.valido, false);
    assert.match(mensagens(validacao.erros), /duplicado/);
  });

  it("rejeita placar como string", () => {
    const validacao = validarResultadosOficiais({
      jogos: [criarJogoOficial({ gols_a: "2" })],
    });

    assert.equal(validacao.valido, false);
    assert.match(mensagens(validacao.erros), /numero ou null/);
  });

  it("rejeita string vazia em placar", () => {
    const validacao = validarResultadosOficiais({
      jogos: [criarJogoOficial({ gols_a: "" })],
    });

    assert.equal(validacao.valido, false);
    assert.match(mensagens(validacao.erros), /string vazia/);
  });

  it("avisa sobre penaltis em jogo sem empate sem bloquear importacao", () => {
    const validacao = validarResultadosOficiais({
      jogos: [
        criarJogoOficial({
          gols_a: 2,
          gols_b: 1,
          penaltis_a: 5,
          penaltis_b: 4,
        }),
      ],
    });

    assert.equal(validacao.valido, true);
    assert.equal(validacao.erros.length, 0);
    assert.equal(validacao.avisos.length, 1);
    assert.match(mensagens(validacao.avisos), /serao ignorados/);
  });

  it("rejeita vencedor oficial incoerente com placar e penaltis", () => {
    const validacao = validarResultadosOficiais({
      jogos: [criarJogoOficial({ vencedor_oficial: "Morocco" })],
    });

    assert.equal(validacao.valido, false);
    assert.match(mensagens(validacao.erros), /vencedor_oficial incoerente/);
  });

  it("rejeita jogo encerrado sem placar suficiente", () => {
    const validacao = validarResultadosOficiais({
      jogos: [criarJogoOficial({ gols_a: null })],
    });

    assert.equal(validacao.valido, false);
    assert.match(mensagens(validacao.erros), /gols_a e gols_b numericos/);
  });

  it("aceita estruturas opcionais ausentes", () => {
    const validacao = validarResultadosOficiais({
      status: "EM_ANDAMENTO",
    });

    assert.equal(validacao.valido, true);
    assert.equal(validacao.erros.length, 0);
    assert.equal(validacao.avisos.length, 0);
  });

  it("aceita chaveamento_oficial como objeto", () => {
    const validacao = validarResultadosOficiais({
      chaveamento_oficial: {
        dezesseis_avos: [],
      },
    });

    assert.equal(validacao.valido, true);
    assert.equal(validacao.erros.length, 0);
  });
});
