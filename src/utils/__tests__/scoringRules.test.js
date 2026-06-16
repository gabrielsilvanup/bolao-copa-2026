import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { SCORING_RULES } from "../scoringRules.js";

describe("SCORING_RULES", () => {
  it("mantem os valores centrais de pontuacao de jogos", () => {
    assert.equal(SCORING_RULES.resultadoCorreto, 10);
    assert.equal(SCORING_RULES.placarExatoBonus, 5);
  });

  it("mantem os valores atuais de avanco de fase", () => {
    assert.deepEqual(SCORING_RULES.fases, {
      dezesseis_avos: 10,
      oitavas: 15,
      quartas: 20,
      semifinal: 25,
      final: 30,
    });
  });

  it("mantem os valores atuais para posicoes finais e premiacao", () => {
    assert.deepEqual(SCORING_RULES.posicoesFinais, {
      quarto: 35,
      terceiro: 40,
      vice: 50,
      campeao: 60,
    });

    assert.deepEqual(SCORING_RULES.premiacao, {
      primeiro: 55,
      segundo: 15,
      terceiro: 11,
      quarto: 8,
      quinto: 6,
      organizacao: 5,
    });
  });
});
