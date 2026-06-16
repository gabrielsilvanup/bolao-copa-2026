const ORDEM_GRUPOS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
];

const TERCEIROS_SLOTS = [
  {
    jogo: 74,
    slot: "3ABCDF",
    contra: "1E",
    elegiveis: ["A", "B", "C", "D", "F"],
  },
  {
    jogo: 77,
    slot: "3CDFGH",
    contra: "1I",
    elegiveis: ["C", "D", "F", "G", "H"],
  },
  {
    jogo: 79,
    slot: "3CEFHI",
    contra: "1A",
    elegiveis: ["C", "E", "F", "H", "I"],
  },
  {
    jogo: 80,
    slot: "3EHIJK",
    contra: "1L",
    elegiveis: ["E", "H", "I", "J", "K"],
  },
  {
    jogo: 81,
    slot: "3BEFIJ",
    contra: "1D",
    elegiveis: ["B", "E", "F", "I", "J"],
  },
  {
    jogo: 82,
    slot: "3AEHIJ",
    contra: "1G",
    elegiveis: ["A", "E", "H", "I", "J"],
  },
  {
    jogo: 85,
    slot: "3EFGIJ",
    contra: "1B",
    elegiveis: ["E", "F", "G", "I", "J"],
  },
  {
    jogo: 87,
    slot: "3DEIJL",
    contra: "1K",
    elegiveis: ["D", "E", "I", "J", "L"],
  },
];

export const MODELO_DEZESSEIS_AVOS = [
  { jogo: 73, fase: "dezesseis_avos", slot_a: "2A", slot_b: "2B" },
  { jogo: 74, fase: "dezesseis_avos", slot_a: "1E", slot_b: "3ABCDF" },
  { jogo: 75, fase: "dezesseis_avos", slot_a: "1F", slot_b: "2C" },
  { jogo: 76, fase: "dezesseis_avos", slot_a: "1C", slot_b: "2F" },
  { jogo: 77, fase: "dezesseis_avos", slot_a: "1I", slot_b: "3CDFGH" },
  { jogo: 78, fase: "dezesseis_avos", slot_a: "2E", slot_b: "2I" },
  { jogo: 79, fase: "dezesseis_avos", slot_a: "1A", slot_b: "3CEFHI" },
  { jogo: 80, fase: "dezesseis_avos", slot_a: "1L", slot_b: "3EHIJK" },
  { jogo: 81, fase: "dezesseis_avos", slot_a: "1D", slot_b: "3BEFIJ" },
  { jogo: 82, fase: "dezesseis_avos", slot_a: "1G", slot_b: "3AEHIJ" },
  { jogo: 83, fase: "dezesseis_avos", slot_a: "2K", slot_b: "2L" },
  { jogo: 84, fase: "dezesseis_avos", slot_a: "1H", slot_b: "2J" },
  { jogo: 85, fase: "dezesseis_avos", slot_a: "1B", slot_b: "3EFGIJ" },
  { jogo: 86, fase: "dezesseis_avos", slot_a: "1J", slot_b: "2H" },
  { jogo: 87, fase: "dezesseis_avos", slot_a: "1K", slot_b: "3DEIJL" },
  { jogo: 88, fase: "dezesseis_avos", slot_a: "2D", slot_b: "2G" },
];

export const MODELO_PROPAGACAO_MATA_MATA = [
  {
    jogo: 89,
    fase: "oitavas",
    slot_a: "W74",
    slot_b: "W77",
    fonte_a: { tipo: "vencedor", jogo: 74 },
    fonte_b: { tipo: "vencedor", jogo: 77 },
  },
  {
    jogo: 90,
    fase: "oitavas",
    slot_a: "W73",
    slot_b: "W75",
    fonte_a: { tipo: "vencedor", jogo: 73 },
    fonte_b: { tipo: "vencedor", jogo: 75 },
  },
  {
    jogo: 91,
    fase: "oitavas",
    slot_a: "W76",
    slot_b: "W78",
    fonte_a: { tipo: "vencedor", jogo: 76 },
    fonte_b: { tipo: "vencedor", jogo: 78 },
  },
  {
    jogo: 92,
    fase: "oitavas",
    slot_a: "W79",
    slot_b: "W80",
    fonte_a: { tipo: "vencedor", jogo: 79 },
    fonte_b: { tipo: "vencedor", jogo: 80 },
  },
  {
    jogo: 93,
    fase: "oitavas",
    slot_a: "W83",
    slot_b: "W84",
    fonte_a: { tipo: "vencedor", jogo: 83 },
    fonte_b: { tipo: "vencedor", jogo: 84 },
  },
  {
    jogo: 94,
    fase: "oitavas",
    slot_a: "W81",
    slot_b: "W82",
    fonte_a: { tipo: "vencedor", jogo: 81 },
    fonte_b: { tipo: "vencedor", jogo: 82 },
  },
  {
    jogo: 95,
    fase: "oitavas",
    slot_a: "W86",
    slot_b: "W88",
    fonte_a: { tipo: "vencedor", jogo: 86 },
    fonte_b: { tipo: "vencedor", jogo: 88 },
  },
  {
    jogo: 96,
    fase: "oitavas",
    slot_a: "W85",
    slot_b: "W87",
    fonte_a: { tipo: "vencedor", jogo: 85 },
    fonte_b: { tipo: "vencedor", jogo: 87 },
  },
  {
    jogo: 97,
    fase: "quartas",
    slot_a: "W89",
    slot_b: "W90",
    fonte_a: { tipo: "vencedor", jogo: 89 },
    fonte_b: { tipo: "vencedor", jogo: 90 },
  },
  {
    jogo: 98,
    fase: "quartas",
    slot_a: "W93",
    slot_b: "W94",
    fonte_a: { tipo: "vencedor", jogo: 93 },
    fonte_b: { tipo: "vencedor", jogo: 94 },
  },
  {
    jogo: 99,
    fase: "quartas",
    slot_a: "W91",
    slot_b: "W92",
    fonte_a: { tipo: "vencedor", jogo: 91 },
    fonte_b: { tipo: "vencedor", jogo: 92 },
  },
  {
    jogo: 100,
    fase: "quartas",
    slot_a: "W95",
    slot_b: "W96",
    fonte_a: { tipo: "vencedor", jogo: 95 },
    fonte_b: { tipo: "vencedor", jogo: 96 },
  },
  {
    jogo: 101,
    fase: "semifinal",
    slot_a: "W97",
    slot_b: "W98",
    fonte_a: { tipo: "vencedor", jogo: 97 },
    fonte_b: { tipo: "vencedor", jogo: 98 },
  },
  {
    jogo: 102,
    fase: "semifinal",
    slot_a: "W99",
    slot_b: "W100",
    fonte_a: { tipo: "vencedor", jogo: 99 },
    fonte_b: { tipo: "vencedor", jogo: 100 },
  },
  {
    jogo: 103,
    fase: "terceiro_lugar",
    slot_a: "L101",
    slot_b: "L102",
    fonte_a: { tipo: "perdedor", jogo: 101 },
    fonte_b: { tipo: "perdedor", jogo: 102 },
  },
  {
    jogo: 104,
    fase: "final",
    slot_a: "W101",
    slot_b: "W102",
    fonte_a: { tipo: "vencedor", jogo: 101 },
    fonte_b: { tipo: "vencedor", jogo: 102 },
  },
];

const FASES_VAZIAS = {
  dezesseis_avos: [],
  oitavas: [],
  quartas: [],
  semifinal: [],
  final: [],
};

const POSICOES_VAZIAS = {
  campeao: null,
  vice: null,
  terceiro: null,
  quarto: null,
};

function dataHojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function getOrdemGrupo(grupo) {
  return ORDEM_GRUPOS.indexOf(grupo);
}

function ordenarGrupos(a, b) {
  return getOrdemGrupo(a) - getOrdemGrupo(b);
}

function getLinhaPorPosicao(dadosClassificacao, grupo, posicao) {
  return dadosClassificacao?.grupos?.[grupo]?.find(
    (time) => time.posicaoGrupo === posicao
  );
}

function getTerceiroClassificado(dadosClassificacao, grupo) {
  return dadosClassificacao?.melhoresTerceiros?.find(
    (time) => time.grupo === grupo && time.classificadoTerceiro
  );
}

function getSelecaoPorSlot(dadosClassificacao, slot, terceirosPorJogo) {
  if (!slot) return null;

  if (slot.startsWith("1")) {
    const grupo = slot.slice(1);
    return getLinhaPorPosicao(dadosClassificacao, grupo, 1)?.selecao || null;
  }

  if (slot.startsWith("2")) {
    const grupo = slot.slice(1);
    return getLinhaPorPosicao(dadosClassificacao, grupo, 2)?.selecao || null;
  }

  if (slot.startsWith("3")) {
    const itemSlot = TERCEIROS_SLOTS.find((item) => item.slot === slot);
    const grupo = terceirosPorJogo?.[itemSlot?.jogo];

    if (!grupo) return null;

    return getTerceiroClassificado(dadosClassificacao, grupo)?.selecao || null;
  }

  return null;
}

function getGruposTerceirosClassificados(dadosClassificacao) {
  return (dadosClassificacao?.melhoresTerceiros || [])
    .filter((time) => time.classificadoTerceiro)
    .map((time) => time.grupo)
    .sort(ordenarGrupos);
}

function resolverTerceirosPorCompatibilidade(gruposClassificados) {
  const gruposDisponiveis = [...gruposClassificados].sort(ordenarGrupos);

  const slotsOrdenados = [...TERCEIROS_SLOTS].sort((a, b) => {
    const candidatosA = a.elegiveis.filter((grupo) =>
      gruposDisponiveis.includes(grupo)
    ).length;

    const candidatosB = b.elegiveis.filter((grupo) =>
      gruposDisponiveis.includes(grupo)
    ).length;

    if (candidatosA !== candidatosB) {
      return candidatosA - candidatosB;
    }

    return a.jogo - b.jogo;
  });

  function tentar(indice, usados, mapa) {
    if (indice >= slotsOrdenados.length) {
      return mapa;
    }

    const slot = slotsOrdenados[indice];

    const candidatos = gruposDisponiveis
      .filter((grupo) => !usados.has(grupo))
      .filter((grupo) => slot.elegiveis.includes(grupo))
      .sort(ordenarGrupos);

    for (const grupo of candidatos) {
      const novoUsados = new Set(usados);
      novoUsados.add(grupo);

      const novoMapa = {
        ...mapa,
        [slot.jogo]: grupo,
      };

      const resultado = tentar(indice + 1, novoUsados, novoMapa);

      if (resultado) return resultado;
    }

    return null;
  }

  return tentar(0, new Set(), {});
}

function getTerceiroSlotPorJogo(jogo) {
  return TERCEIROS_SLOTS.find((slot) => slot.jogo === Number(jogo));
}

function validarTerceirosPorJogo(terceirosPorJogo, dadosClassificacao) {
  const erros = [];
  const gruposUsados = new Set();

  TERCEIROS_SLOTS.forEach((slot) => {
    const grupo = terceirosPorJogo?.[slot.jogo];

    if (!grupo) {
      erros.push(`Jogo ${slot.jogo}: terceiro colocado não definido.`);
      return;
    }

    if (!slot.elegiveis.includes(grupo)) {
      erros.push(
        `Jogo ${slot.jogo}: 3º do Grupo ${grupo} não é compatível com o slot ${slot.slot}.`
      );
    }

    if (gruposUsados.has(grupo)) {
      erros.push(`Grupo ${grupo} foi usado mais de uma vez entre os terceiros.`);
    }

    gruposUsados.add(grupo);

    const terceiro = getTerceiroClassificado(dadosClassificacao, grupo);

    if (!terceiro) {
      erros.push(`Grupo ${grupo} não possui terceiro classificado.`);
    }
  });

  return erros;
}

function criarMapaResultados(resultadosOficiais) {
  return (resultadosOficiais?.jogos || []).reduce((mapa, jogo) => {
    mapa[Number(jogo.jogo)] = jogo;
    return mapa;
  }, {});
}

function getSelecaoPorFonte(mapaResultados, fonte) {
  if (!fonte) return null;

  const resultado = mapaResultados[Number(fonte.jogo)];

  if (!resultado?.encerrado) return null;

  if (fonte.tipo === "vencedor") {
    return resultado.vencedor_oficial || null;
  }

  if (fonte.tipo === "perdedor") {
    return resultado.perdedor_oficial || null;
  }

  return null;
}

function getModeloPorJogo(numeroJogo) {
  return (
    MODELO_DEZESSEIS_AVOS.find(
      (modelo) => Number(modelo.jogo) === Number(numeroJogo)
    ) ||
    MODELO_PROPAGACAO_MATA_MATA.find(
      (modelo) => Number(modelo.jogo) === Number(numeroJogo)
    )
  );
}

function separarPorFase(jogos) {
  return {
    dezesseis_avos: jogos.filter((jogo) => jogo.fase === "dezesseis_avos"),
    oitavas: jogos.filter((jogo) => jogo.fase === "oitavas"),
    quartas: jogos.filter((jogo) => jogo.fase === "quartas"),
    semifinal: jogos.filter((jogo) => jogo.fase === "semifinal"),
    terceiro_lugar: jogos.filter((jogo) => jogo.fase === "terceiro_lugar"),
    final: jogos.filter((jogo) => jogo.fase === "final"),
  };
}

function selecoesDosJogos(jogos) {
  return jogos
    .flatMap((jogo) => [jogo.selecao_a, jogo.selecao_b])
    .filter(Boolean);
}

function vencedoresDosJogos(mapaResultados, numeros) {
  return numeros
    .map((numero) => mapaResultados[Number(numero)]?.vencedor_oficial)
    .filter(Boolean);
}

function calcularFasesOficiais(resultadosOficiais, chaveamentoCompleto) {
  const mapaResultados = criarMapaResultados(resultadosOficiais);
  const fasesAtuais = resultadosOficiais?.fases_oficiais || {};
  const porFase = separarPorFase(chaveamentoCompleto.todos);

  const selecoes16Avos = selecoesDosJogos(porFase.dezesseis_avos);

  return {
    ...FASES_VAZIAS,
    ...fasesAtuais,
    dezesseis_avos:
      selecoes16Avos.length === 32
        ? selecoes16Avos
        : fasesAtuais.dezesseis_avos || [],
    oitavas: vencedoresDosJogos(
      mapaResultados,
      MODELO_DEZESSEIS_AVOS.map((jogo) => jogo.jogo)
    ),
    quartas: vencedoresDosJogos(
      mapaResultados,
      MODELO_PROPAGACAO_MATA_MATA.filter((jogo) => jogo.fase === "oitavas").map(
        (jogo) => jogo.jogo
      )
    ),
    semifinal: vencedoresDosJogos(
      mapaResultados,
      MODELO_PROPAGACAO_MATA_MATA.filter((jogo) => jogo.fase === "quartas").map(
        (jogo) => jogo.jogo
      )
    ),
    final: vencedoresDosJogos(
      mapaResultados,
      MODELO_PROPAGACAO_MATA_MATA.filter(
        (jogo) => jogo.fase === "semifinal"
      ).map((jogo) => jogo.jogo)
    ),
  };
}

function calcularPosicoesFinais(resultadosOficiais) {
  const mapaResultados = criarMapaResultados(resultadosOficiais);

  const jogoFinal = mapaResultados[104];
  const jogoTerceiroLugar = mapaResultados[103];

  return {
    campeao: jogoFinal?.encerrado ? jogoFinal.vencedor_oficial || null : null,
    vice: jogoFinal?.encerrado ? jogoFinal.perdedor_oficial || null : null,
    terceiro: jogoTerceiroLugar?.encerrado
      ? jogoTerceiroLugar.vencedor_oficial || null
      : null,
    quarto: jogoTerceiroLugar?.encerrado
      ? jogoTerceiroLugar.perdedor_oficial || null
      : null,
  };
}

export function gerarChaveamentoDezesseisAvos(
  dadosClassificacao,
  terceirosForcados = null
) {
  const gruposTerceiros = getGruposTerceirosClassificados(dadosClassificacao);

  const terceirosPorJogo =
    terceirosForcados ||
    resolverTerceirosPorCompatibilidade(gruposTerceiros) ||
    {};

  const errosTerceiros = validarTerceirosPorJogo(
    terceirosPorJogo,
    dadosClassificacao
  );

  const jogos = MODELO_DEZESSEIS_AVOS.map((modelo) => {
    const terceiroSlot = getTerceiroSlotPorJogo(modelo.jogo);
    const grupoTerceiro = terceiroSlot ? terceirosPorJogo[modelo.jogo] : null;

    return {
      jogo: modelo.jogo,
      fase: modelo.fase,
      slot_a: modelo.slot_a,
      slot_b: modelo.slot_b,
      grupo_terceiro: grupoTerceiro,
      selecao_a: getSelecaoPorSlot(
        dadosClassificacao,
        modelo.slot_a,
        terceirosPorJogo
      ),
      selecao_b: getSelecaoPorSlot(
        dadosClassificacao,
        modelo.slot_b,
        terceirosPorJogo
      ),
    };
  });

  const errosJogos = jogos.flatMap((jogo) => {
    const erros = [];

    if (!jogo.selecao_a) {
      erros.push(`Jogo ${jogo.jogo}: seleção A não definida.`);
    }

    if (!jogo.selecao_b) {
      erros.push(`Jogo ${jogo.jogo}: seleção B não definida.`);
    }

    return erros;
  });

  return {
    jogos,
    terceirosPorJogo,
    gruposTerceiros,
    erros: [...errosTerceiros, ...errosJogos],
    completo: errosTerceiros.length === 0 && errosJogos.length === 0,
  };
}

export function getChaveamentoDezesseisAvos(resultadosOficiais) {
  const lista = resultadosOficiais?.chaveamento_oficial?.dezesseis_avos;

  if (!Array.isArray(lista)) return [];

  return lista;
}

export function gerarChaveamentoCompleto(resultadosOficiais) {
  const mapaResultados = criarMapaResultados(resultadosOficiais);
  const dezesseisAvos = getChaveamentoDezesseisAvos(resultadosOficiais);

  const propagados = MODELO_PROPAGACAO_MATA_MATA.map((modelo) => ({
    jogo: modelo.jogo,
    fase: modelo.fase,
    slot_a: modelo.slot_a,
    slot_b: modelo.slot_b,
    selecao_a: getSelecaoPorFonte(mapaResultados, modelo.fonte_a),
    selecao_b: getSelecaoPorFonte(mapaResultados, modelo.fonte_b),
    fonte_a: modelo.fonte_a,
    fonte_b: modelo.fonte_b,
    chaveamento_gerado: true,
  }));

  const todos = [...dezesseisAvos, ...propagados].sort(
    (a, b) => Number(a.jogo) - Number(b.jogo)
  );

  return {
    todos,
    ...separarPorFase(todos),
  };
}

export function atualizarChaveamentoEProgressoes(resultadosOficiais) {
  const chaveamentoCompleto = gerarChaveamentoCompleto(resultadosOficiais);
  const fasesOficiais = calcularFasesOficiais(
    resultadosOficiais,
    chaveamentoCompleto
  );
  const posicoesFinais = calcularPosicoesFinais(resultadosOficiais);

  return {
    ...(resultadosOficiais || {}),
    ultima_atualizacao: resultadosOficiais?.ultima_atualizacao || dataHojeISO(),
    fases_oficiais: fasesOficiais,
    posicoes_finais_oficiais: posicoesFinais,
    chaveamento_oficial: {
      ...(resultadosOficiais?.chaveamento_oficial || {}),
      ultima_atualizacao: dataHojeISO(),
      dezesseis_avos: chaveamentoCompleto.dezesseis_avos,
      oitavas: chaveamentoCompleto.oitavas,
      quartas: chaveamentoCompleto.quartas,
      semifinal: chaveamentoCompleto.semifinal,
      terceiro_lugar: chaveamentoCompleto.terceiro_lugar,
      final: chaveamentoCompleto.final,
    },
  };
}

export function getJogosDependentes(numeroJogo) {
  const origem = Number(numeroJogo);
  const dependentes = new Set();

  function visitar(jogoFonte) {
    MODELO_PROPAGACAO_MATA_MATA.forEach((modelo) => {
      const dependeDaFonte =
        Number(modelo.fonte_a?.jogo) === Number(jogoFonte) ||
        Number(modelo.fonte_b?.jogo) === Number(jogoFonte);

      if (!dependeDaFonte) return;

      if (dependentes.has(Number(modelo.jogo))) return;

      dependentes.add(Number(modelo.jogo));
      visitar(modelo.jogo);
    });
  }

  visitar(origem);

  return Array.from(dependentes).sort((a, b) => a - b);
}

export function removerResultadosDependentes(jogos, numeroJogo) {
  const dependentes = new Set(getJogosDependentes(numeroJogo));

  return (jogos || []).filter((jogo) => !dependentes.has(Number(jogo.jogo)));
}

export function deveResetarChaveamentoPorJogoGrupo(
  numeroJogo,
  resultadosOficiais
) {
  if (Number(numeroJogo) > 72) return false;

  const temChaveamento =
    (resultadosOficiais?.chaveamento_oficial?.dezesseis_avos || []).length > 0;

  const temMataMataCadastrado = (resultadosOficiais?.jogos || []).some(
    (jogo) => Number(jogo.jogo) > 72
  );

  return temChaveamento || temMataMataCadastrado;
}

export function removerTodoMataMataEChaveamento(resultadosOficiais) {
  return {
    ...(resultadosOficiais || {}),
    ultima_atualizacao: dataHojeISO(),
    jogos: (resultadosOficiais?.jogos || []).filter(
      (jogo) => Number(jogo.jogo) <= 72
    ),
    fases_oficiais: {
      ...FASES_VAZIAS,
    },
    posicoes_finais_oficiais: {
      ...POSICOES_VAZIAS,
    },
    chaveamento_oficial: {
      ...(resultadosOficiais?.chaveamento_oficial || {}),
      ultima_atualizacao: dataHojeISO(),
      dezesseis_avos: [],
      oitavas: [],
      quartas: [],
      semifinal: [],
      terceiro_lugar: [],
      final: [],
      terceiros_por_jogo: {},
    },
  };
}

export function montarJogosAdmin(jogosBase, resultadosOficiais) {
  const chaveamentoCompleto = gerarChaveamentoCompleto(resultadosOficiais);
  const mapaChaveamento = chaveamentoCompleto.todos.reduce((mapa, jogo) => {
    mapa[Number(jogo.jogo)] = jogo;
    return mapa;
  }, {});

  const mapaResultados = (resultadosOficiais?.jogos || []).reduce(
    (mapa, jogo) => {
      mapa[Number(jogo.jogo)] = jogo;
      return mapa;
    },
    {}
  );

  return (jogosBase || []).map((jogo) => {
    const numeroJogo = Number(jogo.jogo);
    const resultadoSalvo = mapaResultados[numeroJogo];
    const jogoChaveado = mapaChaveamento[numeroJogo];
    const modelo = getModeloPorJogo(numeroJogo);

    if (resultadoSalvo) {
      return {
        ...jogo,
        fase: resultadoSalvo.fase || jogo.fase,
        selecao_a: resultadoSalvo.selecao_a || jogo.selecao_a,
        selecao_b: resultadoSalvo.selecao_b || jogo.selecao_b,
        slot_a: modelo?.slot_a || jogo.slot_a,
        slot_b: modelo?.slot_b || jogo.slot_b,
      };
    }

    if (jogoChaveado) {
      return {
        ...jogo,
        fase: jogoChaveado.fase,
        selecao_a: jogoChaveado.selecao_a,
        selecao_b: jogoChaveado.selecao_b,
        slot_a: jogoChaveado.slot_a,
        slot_b: jogoChaveado.slot_b,
        grupo_terceiro: jogoChaveado.grupo_terceiro,
        chaveamento_gerado: true,
      };
    }

    if (numeroJogo > 72 && modelo) {
      return {
        ...jogo,
        fase: modelo.fase,
        selecao_a: null,
        selecao_b: null,
        slot_a: modelo.slot_a,
        slot_b: modelo.slot_b,
        chaveamento_gerado: true,
      };
    }

    return jogo;
  });
}