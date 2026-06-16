export const GRUPOS_COPA_2026 = {
  A: ["Mexico", "South Africa", "Rep. of Korea", "Czech Rep."],
  B: ["Canada", "Bosnia/Herzeg.", "Qatar", "Switzerland"],
  C: ["Brazil", "Morocco", "Haiti", "Scotland"],
  D: ["USA", "Paraguay", "Australia", "Turkey"],
  E: ["Germany", "Curaçao", "Ivory Coast", "Ecuador"],
  F: ["Netherlands", "Japan", "Sweden", "Tunisia"],
  G: ["Belgium", "Egypt", "IR Iran", "New Zealand"],
  H: ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"],
  I: ["France", "Senegal", "Iraq", "Norway"],
  J: ["Argentina", "Algeria", "Austria", "Jordan"],
  K: ["Portugal", "DR Congo", "Uzbekistan", "Colombia"],
  L: ["England", "Croatia", "Ghana", "Panama"],
};

export const ORDEM_GRUPOS = Object.keys(GRUPOS_COPA_2026);

const JOGOS_ESPERADOS_POR_GRUPO = 6;

export function getGrupoDaSelecao(selecao) {
  if (!selecao) return null;

  for (const grupo of ORDEM_GRUPOS) {
    if (GRUPOS_COPA_2026[grupo].includes(selecao)) {
      return grupo;
    }
  }

  return null;
}

function criarLinhaBase(grupo, selecao) {
  return {
    grupo,
    selecao,
    jogos: 0,
    vitorias: 0,
    empates: 0,
    derrotas: 0,
    golsPro: 0,
    golsContra: 0,
    saldo: 0,
    pontos: 0,
    posicaoGrupo: null,
    classificadoDireto: false,
    classificadoTerceiro: false,
    terceiroEliminado: false,
    desempateManual: false,
  };
}

function criarClassificacaoVazia() {
  return ORDEM_GRUPOS.reduce((mapa, grupo) => {
    mapa[grupo] = GRUPOS_COPA_2026[grupo].map((selecao) =>
      criarLinhaBase(grupo, selecao)
    );

    return mapa;
  }, {});
}

function jogoDeGrupoEncerrado(jogo) {
  return (
    jogo?.fase === "grupos" &&
    jogo?.encerrado &&
    jogo.gols_a !== null &&
    jogo.gols_a !== undefined &&
    jogo.gols_b !== null &&
    jogo.gols_b !== undefined
  );
}

function aplicarResultadoNaLinha(linha, golsPro, golsContra) {
  linha.jogos += 1;
  linha.golsPro += golsPro;
  linha.golsContra += golsContra;
  linha.saldo = linha.golsPro - linha.golsContra;

  if (golsPro > golsContra) {
    linha.vitorias += 1;
    linha.pontos += 3;
    return;
  }

  if (golsPro < golsContra) {
    linha.derrotas += 1;
    return;
  }

  linha.empates += 1;
  linha.pontos += 1;
}

function aplicarJogo(classificacao, jogo) {
  const grupoA = getGrupoDaSelecao(jogo.selecao_a);
  const grupoB = getGrupoDaSelecao(jogo.selecao_b);

  if (!grupoA || grupoA !== grupoB) return;

  const linhaA = classificacao[grupoA].find(
    (item) => item.selecao === jogo.selecao_a
  );

  const linhaB = classificacao[grupoA].find(
    (item) => item.selecao === jogo.selecao_b
  );

  if (!linhaA || !linhaB) return;

  aplicarResultadoNaLinha(linhaA, jogo.gols_a, jogo.gols_b);
  aplicarResultadoNaLinha(linhaB, jogo.gols_b, jogo.gols_a);
}

function compararBasico(a, b) {
  if (b.pontos !== a.pontos) return b.pontos - a.pontos;
  if (b.saldo !== a.saldo) return b.saldo - a.saldo;
  if (b.golsPro !== a.golsPro) return b.golsPro - a.golsPro;

  return 0;
}

function aplicarHeadToHead(stats, selecao, golsPro, golsContra) {
  const item = stats[selecao];

  item.jogos += 1;
  item.golsPro += golsPro;
  item.golsContra += golsContra;
  item.saldo = item.golsPro - item.golsContra;

  if (golsPro > golsContra) {
    item.pontos += 3;
    return;
  }

  if (golsPro === golsContra) {
    item.pontos += 1;
  }
}

function calcularHeadToHead(bloco, jogosGrupo) {
  const selecoes = new Set(bloco.map((item) => item.selecao));

  const stats = bloco.reduce((mapa, item) => {
    mapa[item.selecao] = {
      selecao: item.selecao,
      jogos: 0,
      pontos: 0,
      golsPro: 0,
      golsContra: 0,
      saldo: 0,
    };

    return mapa;
  }, {});

  jogosGrupo.forEach((jogo) => {
    if (!jogoDeGrupoEncerrado(jogo)) return;

    if (!selecoes.has(jogo.selecao_a) || !selecoes.has(jogo.selecao_b)) {
      return;
    }

    aplicarHeadToHead(stats, jogo.selecao_a, jogo.gols_a, jogo.gols_b);
    aplicarHeadToHead(stats, jogo.selecao_b, jogo.gols_b, jogo.gols_a);
  });

  return stats;
}

function compararHeadToHead(a, b, stats) {
  const statsA = stats[a.selecao];
  const statsB = stats[b.selecao];

  if (statsB.pontos !== statsA.pontos) {
    return statsB.pontos - statsA.pontos;
  }

  if (statsB.saldo !== statsA.saldo) {
    return statsB.saldo - statsA.saldo;
  }

  if (statsB.golsPro !== statsA.golsPro) {
    return statsB.golsPro - statsA.golsPro;
  }

  return 0;
}

function blocoAindaEmpatado(a, b, stats) {
  return (
    a.pontos === b.pontos &&
    a.saldo === b.saldo &&
    a.golsPro === b.golsPro &&
    stats[a.selecao]?.pontos === stats[b.selecao]?.pontos &&
    stats[a.selecao]?.saldo === stats[b.selecao]?.saldo &&
    stats[a.selecao]?.golsPro === stats[b.selecao]?.golsPro
  );
}

function ordenarBlocoEmpatado(bloco, jogosGrupo) {
  if (bloco.length <= 1) return bloco;

  const stats = calcularHeadToHead(bloco, jogosGrupo);

  const ordenado = [...bloco].sort((a, b) => {
    const h2h = compararHeadToHead(a, b, stats);

    if (h2h !== 0) return h2h;

    return a.selecao.localeCompare(b.selecao);
  });

  for (let i = 0; i < ordenado.length - 1; i += 1) {
    const atual = ordenado[i];
    const proximo = ordenado[i + 1];

    if (blocoAindaEmpatado(atual, proximo, stats)) {
      atual.desempateManual = true;
      proximo.desempateManual = true;
    }
  }

  return ordenado;
}

function ordenarGrupo(linhas, jogosGrupo) {
  const ordenadoBasico = [...linhas].sort((a, b) => {
    const basico = compararBasico(a, b);

    if (basico !== 0) return basico;

    return a.selecao.localeCompare(b.selecao);
  });

  const resultado = [];
  let indice = 0;

  while (indice < ordenadoBasico.length) {
    const base = ordenadoBasico[indice];
    const bloco = [base];
    let cursor = indice + 1;

    while (
      cursor < ordenadoBasico.length &&
      compararBasico(base, ordenadoBasico[cursor]) === 0
    ) {
      bloco.push(ordenadoBasico[cursor]);
      cursor += 1;
    }

    resultado.push(...ordenarBlocoEmpatado(bloco, jogosGrupo));

    indice = cursor;
  }

  return resultado.map((item, index) => ({
    ...item,
    posicaoGrupo: index + 1,
  }));
}

function compararTerceiros(a, b) {
  if (b.pontos !== a.pontos) return b.pontos - a.pontos;
  if (b.saldo !== a.saldo) return b.saldo - a.saldo;
  if (b.golsPro !== a.golsPro) return b.golsPro - a.golsPro;
  if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;

  return a.grupo.localeCompare(b.grupo);
}

function getJogosGrupo(jogosEncerrados, grupo) {
  return jogosEncerrados.filter(
    (jogo) =>
      getGrupoDaSelecao(jogo.selecao_a) === grupo &&
      getGrupoDaSelecao(jogo.selecao_b) === grupo
  );
}

function contarJogosPorGrupo(jogosEncerrados) {
  return ORDEM_GRUPOS.reduce((mapa, grupo) => {
    mapa[grupo] = getJogosGrupo(jogosEncerrados, grupo).length;
    return mapa;
  }, {});
}

export function calcularClassificacaoGrupos(jogosBase, resultadosOficiais) {
  const classificacao = criarClassificacaoVazia();

  const jogosEncerrados = (resultadosOficiais?.jogos || []).filter(
    jogoDeGrupoEncerrado
  );

  jogosEncerrados.forEach((jogo) => {
    aplicarJogo(classificacao, jogo);
  });

  const jogosPorGrupo = contarJogosPorGrupo(jogosEncerrados);

  const grupos = ORDEM_GRUPOS.reduce((mapa, grupo) => {
    const jogosGrupo = getJogosGrupo(jogosEncerrados, grupo);
    mapa[grupo] = ordenarGrupo(classificacao[grupo], jogosGrupo);
    return mapa;
  }, {});

  const terceiros = ORDEM_GRUPOS.map((grupo) => grupos[grupo][2]).filter(Boolean);

  const melhoresTerceiros = [...terceiros]
    .sort(compararTerceiros)
    .map((item, index) => ({
      ...item,
      posicaoTerceiros: index + 1,
      classificadoTerceiro: index < 8,
      terceiroEliminado: index >= 8,
    }));

  const setMelhoresTerceiros = new Set(
    melhoresTerceiros
      .filter((item) => item.classificadoTerceiro)
      .map((item) => item.selecao)
  );

  ORDEM_GRUPOS.forEach((grupo) => {
    grupos[grupo] = grupos[grupo].map((item) => ({
      ...item,
      classificadoDireto: item.posicaoGrupo <= 2,
      classificadoTerceiro:
        item.posicaoGrupo === 3 && setMelhoresTerceiros.has(item.selecao),
      terceiroEliminado:
        item.posicaoGrupo === 3 && !setMelhoresTerceiros.has(item.selecao),
    }));
  });

  const classificadosDiretos = ORDEM_GRUPOS.flatMap((grupo) =>
    grupos[grupo]
      .filter((item) => item.posicaoGrupo <= 2)
      .map((item) => item.selecao)
  );

  const classificadosTerceiros = melhoresTerceiros
    .filter((item) => item.classificadoTerceiro)
    .map((item) => item.selecao);

  const classificadosDezesseisAvos = [
    ...classificadosDiretos,
    ...classificadosTerceiros,
  ];

  const jogosGrupoEsperados =
    jogosBase?.filter((jogo) => jogo.fase === "grupos").length || 72;

  const gruposCompletos = ORDEM_GRUPOS.filter(
    (grupo) => jogosPorGrupo[grupo] === JOGOS_ESPERADOS_POR_GRUPO
  ).length;

  return {
    grupos,
    melhoresTerceiros,
    classificadosDezesseisAvos,
    resumo: {
      jogosGrupoCadastrados: jogosEncerrados.length,
      jogosGrupoEsperados,
      gruposCompletos,
      totalGrupos: ORDEM_GRUPOS.length,
      todosJogosGrupoEncerrados:
        jogosEncerrados.length === jogosGrupoEsperados &&
        gruposCompletos === ORDEM_GRUPOS.length,
    },
  };
}