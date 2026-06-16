const TOTAL_JOGOS_COPA = 104;
const CAMPOS_PLACAR = ["gols_a", "gols_b", "penaltis_a", "penaltis_b"];
const ESTRUTURAS_OPCIONAIS_OBJETO = [
  "fases_oficiais",
  "posicoes_finais_oficiais",
  "chaveamento_oficial",
];

function isObjetoSimples(valor) {
  return Boolean(valor) && typeof valor === "object" && !Array.isArray(valor);
}

function hasOwn(objeto, chave) {
  return Object.prototype.hasOwnProperty.call(objeto, chave);
}

function criarItem(caminho, mensagem) {
  return { caminho, mensagem };
}

function adicionarErro(erros, caminho, mensagem) {
  erros.push(criarItem(caminho, mensagem));
}

function adicionarAviso(avisos, caminho, mensagem) {
  avisos.push(criarItem(caminho, mensagem));
}

function isNumeroOuNull(valor) {
  return valor === null || (typeof valor === "number" && Number.isFinite(valor));
}

function campoPreenchido(objeto, campo) {
  return (
    hasOwn(objeto, campo) &&
    objeto[campo] !== null &&
    objeto[campo] !== undefined
  );
}

function getIdDaChave(chave) {
  const numero = Number(chave);

  return Number.isInteger(numero) ? numero : null;
}

function getIdEfetivo(jogo, chave) {
  if (Number.isInteger(jogo?.jogo)) return jogo.jogo;

  return getIdDaChave(chave);
}

function getEntradasJogos(dados, erros) {
  if (!hasOwn(dados, "jogos")) return [];

  if (Array.isArray(dados.jogos)) {
    return dados.jogos.map((jogo, index) => ({
      caminho: `$.jogos[${index}]`,
      chave: String(index),
      jogo,
    }));
  }

  if (isObjetoSimples(dados.jogos)) {
    return Object.entries(dados.jogos).map(([chave, jogo]) => ({
      caminho: `$.jogos.${chave}`,
      chave,
      jogo,
    }));
  }

  adicionarErro(erros, "$.jogos", "jogos deve ser array ou objeto.");
  return [];
}

function validarCampoPlacar(jogo, campo, caminho, erros) {
  if (!hasOwn(jogo, campo)) return;

  if (jogo[campo] === "") {
    adicionarErro(
      erros,
      `${caminho}.${campo}`,
      "Campo de placar nao pode ser string vazia; use null."
    );
    return;
  }

  if (!isNumeroOuNull(jogo[campo])) {
    adicionarErro(
      erros,
      `${caminho}.${campo}`,
      "Campo de placar deve ser numero ou null."
    );
  }
}

function validarIdJogo(jogo, chave, caminho, erros) {
  const idEfetivo = getIdEfetivo(jogo, chave);

  if (!hasOwn(jogo, "jogo") && idEfetivo === null) {
    adicionarErro(erros, caminho, "Jogo oficial deve ter ID valido.");
    return null;
  }

  if (hasOwn(jogo, "jogo") && !Number.isInteger(jogo.jogo)) {
    adicionarErro(erros, `${caminho}.jogo`, "ID do jogo deve ser inteiro.");
    return null;
  }

  if (idEfetivo < 1 || idEfetivo > TOTAL_JOGOS_COPA) {
    adicionarErro(
      erros,
      `${caminho}.jogo`,
      `ID do jogo deve estar entre 1 e ${TOTAL_JOGOS_COPA}.`
    );
    return null;
  }

  return idEfetivo;
}

function isMataMata(jogo) {
  return jogo?.fase && jogo.fase !== "grupos";
}

function getResultadoEsperado(jogo) {
  const golsA = jogo.gols_a;
  const golsB = jogo.gols_b;

  if (typeof golsA !== "number" || typeof golsB !== "number") return null;

  if (golsA > golsB) {
    return {
      resultado: "A",
      vencedor: jogo.selecao_a || null,
      perdedor: jogo.selecao_b || null,
      decidido: Boolean(jogo.selecao_a && jogo.selecao_b),
    };
  }

  if (golsB > golsA) {
    return {
      resultado: "B",
      vencedor: jogo.selecao_b || null,
      perdedor: jogo.selecao_a || null,
      decidido: Boolean(jogo.selecao_a && jogo.selecao_b),
    };
  }

  if (
    typeof jogo.penaltis_a === "number" &&
    typeof jogo.penaltis_b === "number" &&
    jogo.penaltis_a !== jogo.penaltis_b
  ) {
    const venceuA = jogo.penaltis_a > jogo.penaltis_b;

    return {
      resultado: "EMPATE",
      vencedor: venceuA ? jogo.selecao_a || null : jogo.selecao_b || null,
      perdedor: venceuA ? jogo.selecao_b || null : jogo.selecao_a || null,
      decidido: Boolean(jogo.selecao_a && jogo.selecao_b),
    };
  }

  return {
    resultado: "EMPATE",
    vencedor: null,
    perdedor: null,
    decidido: !isMataMata(jogo),
  };
}

function validarPenaltisForaDeEmpate(jogo, caminho, avisos) {
  const golsValidos =
    typeof jogo.gols_a === "number" && typeof jogo.gols_b === "number";

  if (!golsValidos || jogo.gols_a === jogo.gols_b) return;

  const temPenaltis =
    campoPreenchido(jogo, "penaltis_a") || campoPreenchido(jogo, "penaltis_b");

  if (!temPenaltis) return;

  adicionarAviso(
    avisos,
    caminho,
    "Penaltis preenchidos em jogo sem empate; esses campos serao ignorados."
  );
}

function validarEncerrado(jogo, caminho, erros) {
  if (hasOwn(jogo, "encerrado") && typeof jogo.encerrado !== "boolean") {
    adicionarErro(erros, `${caminho}.encerrado`, "encerrado deve ser booleano.");
  }

  if (jogo.encerrado !== true) return;

  const golsValidos =
    typeof jogo.gols_a === "number" && typeof jogo.gols_b === "number";

  if (!golsValidos) {
    adicionarErro(
      erros,
      caminho,
      "Jogo encerrado deve ter gols_a e gols_b numericos."
    );
    return;
  }

  const empate = jogo.gols_a === jogo.gols_b;
  const penaltisDecidem =
    typeof jogo.penaltis_a === "number" &&
    typeof jogo.penaltis_b === "number" &&
    jogo.penaltis_a !== jogo.penaltis_b;

  if (empate && isMataMata(jogo) && !penaltisDecidem) {
    adicionarErro(
      erros,
      caminho,
      "Jogo de mata-mata encerrado e empatado precisa de penaltis validos."
    );
  }
}

function validarResultadoOficial(jogo, caminho, erros) {
  const esperado = getResultadoEsperado(jogo);

  if (!esperado) return;

  if (
    campoPreenchido(jogo, "resultado_oficial") &&
    jogo.resultado_oficial !== esperado.resultado
  ) {
    adicionarErro(
      erros,
      `${caminho}.resultado_oficial`,
      "resultado_oficial incoerente com o placar."
    );
  }

  if (!campoPreenchido(jogo, "vencedor_oficial")) return;

  if (!esperado.vencedor || jogo.vencedor_oficial !== esperado.vencedor) {
    adicionarErro(
      erros,
      `${caminho}.vencedor_oficial`,
      "vencedor_oficial incoerente com placar e penaltis."
    );
  }
}

function validarJogoOficial(entrada, erros, avisos) {
  const { jogo, caminho, chave } = entrada;

  if (!isObjetoSimples(jogo)) {
    adicionarErro(erros, caminho, "Jogo oficial deve ser um objeto.");
    return null;
  }

  const id = validarIdJogo(jogo, chave, caminho, erros);

  CAMPOS_PLACAR.forEach((campo) => {
    validarCampoPlacar(jogo, campo, caminho, erros);
  });

  validarPenaltisForaDeEmpate(jogo, caminho, avisos);
  validarEncerrado(jogo, caminho, erros);
  validarResultadoOficial(jogo, caminho, erros);

  return id;
}

export function validarResultadosOficiais(dados) {
  const erros = [];
  const avisos = [];

  if (!isObjetoSimples(dados)) {
    adicionarErro(erros, "$", "A raiz dos resultados oficiais deve ser objeto.");

    return {
      valido: false,
      erros,
      avisos,
    };
  }

  ESTRUTURAS_OPCIONAIS_OBJETO.forEach((chave) => {
    if (hasOwn(dados, chave) && !isObjetoSimples(dados[chave])) {
      adicionarErro(erros, `$.${chave}`, `${chave} deve ser objeto.`);
    }
  });

  const ids = new Map();

  getEntradasJogos(dados, erros).forEach((entrada) => {
    const id = validarJogoOficial(entrada, erros, avisos);

    if (id === null) return;

    ids.set(id, (ids.get(id) || 0) + 1);
  });

  ids.forEach((quantidade, id) => {
    if (quantidade > 1) {
      adicionarErro(erros, "$.jogos", `Jogo ${id} duplicado.`);
    }
  });

  return {
    valido: erros.length === 0,
    erros,
    avisos,
  };
}

export function normalizarFormatoResultadosOficiais(dados) {
  if (!isObjetoSimples(dados) || !isObjetoSimples(dados.jogos)) {
    return dados;
  }

  return {
    ...dados,
    jogos: Object.entries(dados.jogos).map(([chave, jogo]) => {
      if (!isObjetoSimples(jogo) || hasOwn(jogo, "jogo")) return jogo;

      return {
        jogo: getIdDaChave(chave),
        ...jogo,
      };
    }),
  };
}

export function formatarResumoValidacaoResultados(validacao, limite = 3) {
  const itens = validacao.erros.length > 0 ? validacao.erros : validacao.avisos;

  return itens
    .slice(0, limite)
    .map((item) => `${item.caminho}: ${item.mensagem}`)
    .join(" | ");
}
