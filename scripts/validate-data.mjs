import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");

const ARQUIVO_PALPITES = path.join(
  ROOT_DIR,
  "public",
  "data",
  "palpites-copa-2026.json"
);
const ARQUIVO_RESULTADOS = path.join(
  ROOT_DIR,
  "public",
  "data",
  "resultados-oficiais.json"
);
const ARQUIVO_CALENDARIO = path.join(
  ROOT_DIR,
  "public",
  "data",
  "calendario-oficial.json"
);

const TOTAL_PARTICIPANTES_ESPERADO = 37;
const TOTAL_JOGOS_ESPERADO = 104;
const IDS_JOGOS_ESPERADOS = Array.from(
  { length: TOTAL_JOGOS_ESPERADO },
  (_, index) => index + 1
);

const CAMPOS_PARTICIPANTE_OBRIGATORIOS = [
  "participante",
  "arquivo_origem",
  "status_extracao",
  "jogos",
];

const CAMPOS_PLACAR = ["gols_a", "gols_b", "penaltis_a", "penaltis_b"];
const CAMPOS_SELECAO = ["selecao_a", "selecao_b"];
const CAMPOS_CALENDARIO_OBRIGATORIOS = [
  "jogo",
  "fase",
  "grupo",
  "data",
  "hora_brasilia",
  "timezone",
  "mandante",
  "visitante",
  "sede",
];
const CAMPOS_RESULTADO_PROIBIDOS_NO_CALENDARIO = [
  "gols_a",
  "gols_b",
  "penaltis_a",
  "penaltis_b",
  "resultado_oficial",
  "vencedor_oficial",
  "perdedor_oficial",
  "encerrado",
];

const CONTAGEM_FASES_ESPERADA = {
  grupos: 72,
  dezesseis_avos: 16,
  oitavas: 8,
  quartas: 4,
  semifinal: 2,
  terceiro_lugar: 1,
  final: 1,
};

const CHAVES_RESULTADOS_OFICIAIS = [
  "status",
  "ultima_atualizacao",
  "jogos",
  "fases_oficiais",
  "posicoes_finais_oficiais",
  "chaveamento_oficial",
];

const LIMITE_DETALHES = 50;
const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const NOMES_CALENDARIO_PARA_BOLAO = {
  "África do Sul": "South Africa",
  Alemanha: "Germany",
  Argélia: "Algeria",
  Argentina: "Argentina",
  "Arábia Saudita": "Saudi Arabia",
  Austrália: "Australia",
  Áustria: "Austria",
  Bélgica: "Belgium",
  Brasil: "Brazil",
  "Bósnia e Herzegovina": "Bosnia/Herzeg.",
  "Cabo Verde": "Cape Verde",
  Canadá: "Canada",
  Catar: "Qatar",
  Colômbia: "Colombia",
  "Coreia do Sul": "Rep. of Korea",
  "Costa do Marfim": "Ivory Coast",
  Croácia: "Croatia",
  Curaçau: "Curaçao",
  Egito: "Egypt",
  Equador: "Ecuador",
  Escócia: "Scotland",
  Espanha: "Spain",
  "Estados Unidos": "USA",
  França: "France",
  Gana: "Ghana",
  Haiti: "Haiti",
  Holanda: "Netherlands",
  Inglaterra: "England",
  Irã: "IR Iran",
  Iraque: "Iraq",
  Japão: "Japan",
  Jordânia: "Jordan",
  Marrocos: "Morocco",
  México: "Mexico",
  Noruega: "Norway",
  "Nova Zelândia": "New Zealand",
  Panamá: "Panama",
  Paraguai: "Paraguay",
  Portugal: "Portugal",
  "República da Coreia": "Rep. of Korea",
  "República Democrática do Congo": "DR Congo",
  Senegal: "Senegal",
  Suécia: "Sweden",
  Suíça: "Switzerland",
  Tchéquia: "Czech Rep.",
  Tunísia: "Tunisia",
  Turquia: "Turkey",
  Uruguai: "Uruguay",
  Uzbequistão: "Uzbekistan",
};

const relatorio = {
  erros: [],
  avisos: [],
  resumo: {
    participantes: 0,
    jogosPalpites: 0,
    jogosCalendario: 0,
    jogosOficiais: 0,
  },
};

function caminhoRelativo(arquivo) {
  return path.relative(ROOT_DIR, arquivo).replaceAll(path.sep, "/");
}

function adicionarErro(arquivo, local, mensagem) {
  relatorio.erros.push({ arquivo: caminhoRelativo(arquivo), local, mensagem });
}

function adicionarAviso(arquivo, local, mensagem) {
  relatorio.avisos.push({ arquivo: caminhoRelativo(arquivo), local, mensagem });
}

function hasOwn(objeto, chave) {
  return Object.prototype.hasOwnProperty.call(objeto, chave);
}

function isObjetoSimples(valor) {
  return (
    valor !== null &&
    typeof valor === "object" &&
    !Array.isArray(valor)
  );
}

function isNumeroOuNull(valor) {
  return valor === null || (typeof valor === "number" && Number.isFinite(valor));
}

function lerJson(arquivo) {
  try {
    const conteudo = fs.readFileSync(arquivo, "utf8");
    return JSON.parse(conteudo);
  } catch (erro) {
    adicionarErro(
      arquivo,
      "$",
      `JSON invalido ou inacessivel: ${erro.message}`
    );
    return null;
  }
}

function validarStringsVazias(valor, arquivo, local) {
  if (valor === "") {
    adicionarErro(arquivo, local, "Campo com string vazia; use null.");
    return;
  }

  if (Array.isArray(valor)) {
    valor.forEach((item, index) => {
      validarStringsVazias(item, arquivo, `${local}[${index}]`);
    });
    return;
  }

  if (isObjetoSimples(valor)) {
    Object.entries(valor).forEach(([chave, item]) => {
      validarStringsVazias(item, arquivo, `${local}.${chave}`);
    });
  }
}

function validarCampoStringObrigatorio(objeto, arquivo, local, campo) {
  if (!hasOwn(objeto, campo)) {
    adicionarErro(arquivo, local, `Campo obrigatorio ausente: ${campo}.`);
    return;
  }

  if (typeof objeto[campo] !== "string" || objeto[campo].trim() === "") {
    adicionarErro(
      arquivo,
      `${local}.${campo}`,
      "Campo obrigatorio deve ser texto preenchido."
    );
  }
}

function validarCampoPlacar(objeto, arquivo, local, campo) {
  if (!hasOwn(objeto, campo)) {
    adicionarErro(arquivo, local, `Campo de placar ausente: ${campo}.`);
    return;
  }

  if (!isNumeroOuNull(objeto[campo])) {
    adicionarErro(
      arquivo,
      `${local}.${campo}`,
      "Placar deve ser numero ou null."
    );
  }
}

function validarPenaltisForaDeEmpate(jogo, arquivo, local) {
  const golsValidos =
    typeof jogo.gols_a === "number" && typeof jogo.gols_b === "number";
  const penaltisPreenchidos =
    (hasOwn(jogo, "penaltis_a") &&
      jogo.penaltis_a !== null &&
      jogo.penaltis_a !== undefined) ||
    (hasOwn(jogo, "penaltis_b") &&
      jogo.penaltis_b !== null &&
      jogo.penaltis_b !== undefined);

  if (golsValidos && jogo.gols_a !== jogo.gols_b && penaltisPreenchidos) {
    adicionarAviso(
      arquivo,
      local,
      "Penaltis preenchidos em jogo sem empate; o projeto ignora esses campos."
    );
  }
}

function validarJogoPalpite(jogo, arquivo, local, idsEncontrados, fases) {
  if (!isObjetoSimples(jogo)) {
    adicionarErro(arquivo, local, "Jogo deve ser um objeto.");
    return;
  }

  if (!Number.isInteger(jogo.jogo)) {
    adicionarErro(arquivo, `${local}.jogo`, "ID do jogo deve ser inteiro.");
  } else {
    idsEncontrados.set(jogo.jogo, (idsEncontrados.get(jogo.jogo) || 0) + 1);
  }

  if (!hasOwn(jogo, "fase")) {
    adicionarErro(arquivo, local, "Campo obrigatorio ausente: fase.");
  } else if (typeof jogo.fase !== "string" || jogo.fase.trim() === "") {
    adicionarErro(arquivo, `${local}.fase`, "Fase deve ser texto preenchido.");
  } else {
    fases[jogo.fase] = (fases[jogo.fase] || 0) + 1;
  }

  CAMPOS_SELECAO.forEach((campo) => {
    if (!hasOwn(jogo, campo)) {
      adicionarErro(arquivo, local, `Campo de selecao ausente: ${campo}.`);
      return;
    }

    if (typeof jogo[campo] !== "string" || jogo[campo].trim() === "") {
      adicionarErro(
        arquivo,
        `${local}.${campo}`,
        "Selecao deve ser texto preenchido."
      );
    }
  });

  CAMPOS_PLACAR.forEach((campo) => {
    validarCampoPlacar(jogo, arquivo, local, campo);
  });

  validarPenaltisForaDeEmpate(jogo, arquivo, local);
}

function validarIdsJogos(arquivo, local, idsEncontrados) {
  IDS_JOGOS_ESPERADOS.forEach((id) => {
    if (!idsEncontrados.has(id)) {
      adicionarErro(arquivo, local, `Jogo ${id} ausente.`);
    }
  });

  idsEncontrados.forEach((quantidade, id) => {
    if (id < 1 || id > TOTAL_JOGOS_ESPERADO) {
      adicionarErro(arquivo, local, `Jogo ${id} esta fora do intervalo 1-104.`);
    }

    if (quantidade > 1) {
      adicionarErro(arquivo, local, `Jogo ${id} duplicado ${quantidade} vezes.`);
    }
  });
}

function validarContagemFases(arquivo, local, fases) {
  Object.entries(CONTAGEM_FASES_ESPERADA).forEach(([fase, esperado]) => {
    const encontrado = fases[fase] || 0;

    if (encontrado !== esperado) {
      adicionarErro(
        arquivo,
        local,
        `Fase ${fase} tem ${encontrado} jogos; esperado: ${esperado}.`
      );
    }
  });

  Object.keys(fases).forEach((fase) => {
    if (!hasOwn(CONTAGEM_FASES_ESPERADA, fase)) {
      adicionarErro(arquivo, local, `Fase desconhecida encontrada: ${fase}.`);
    }
  });
}

function validarPalpites() {
  const dados = lerJson(ARQUIVO_PALPITES);

  if (!dados) return null;

  validarStringsVazias(dados, ARQUIVO_PALPITES, "$");

  if (!Array.isArray(dados)) {
    adicionarErro(ARQUIVO_PALPITES, "$", "Raiz deve ser um array.");
    return null;
  }

  relatorio.resumo.participantes = dados.length;

  if (dados.length !== TOTAL_PARTICIPANTES_ESPERADO) {
    adicionarErro(
      ARQUIVO_PALPITES,
      "$",
      `Total de participantes deve ser ${TOTAL_PARTICIPANTES_ESPERADO}; encontrado: ${dados.length}.`
    );
  }

  dados.forEach((participante, indiceParticipante) => {
    const localParticipante = `$[${indiceParticipante}]`;

    if (!isObjetoSimples(participante)) {
      adicionarErro(
        ARQUIVO_PALPITES,
        localParticipante,
        "Participante deve ser um objeto."
      );
      return;
    }

    CAMPOS_PARTICIPANTE_OBRIGATORIOS.forEach((campo) => {
      if (!hasOwn(participante, campo)) {
        adicionarErro(
          ARQUIVO_PALPITES,
          localParticipante,
          `Campo obrigatorio ausente: ${campo}.`
        );
      }
    });

    ["participante", "arquivo_origem", "status_extracao"].forEach((campo) => {
      if (hasOwn(participante, campo)) {
        validarCampoStringObrigatorio(
          participante,
          ARQUIVO_PALPITES,
          localParticipante,
          campo
        );
      }
    });

    if (!Array.isArray(participante.jogos)) {
      adicionarErro(
        ARQUIVO_PALPITES,
        `${localParticipante}.jogos`,
        "Jogos deve ser um array."
      );
      return;
    }

    relatorio.resumo.jogosPalpites += participante.jogos.length;

    if (participante.jogos.length !== TOTAL_JOGOS_ESPERADO) {
      adicionarErro(
        ARQUIVO_PALPITES,
        `${localParticipante}.jogos`,
        `Participante deve ter ${TOTAL_JOGOS_ESPERADO} jogos; encontrado: ${participante.jogos.length}.`
      );
    }

    const idsEncontrados = new Map();
    const fases = {};

    participante.jogos.forEach((jogo, indiceJogo) => {
      validarJogoPalpite(
        jogo,
        ARQUIVO_PALPITES,
        `${localParticipante}.jogos[${indiceJogo}]`,
        idsEncontrados,
        fases
      );
    });

    validarIdsJogos(ARQUIVO_PALPITES, `${localParticipante}.jogos`, idsEncontrados);
    validarContagemFases(ARQUIVO_PALPITES, `${localParticipante}.jogos`, fases);
  });

  return dados;
}

function validarDataCalendario(valor, arquivo, local) {
  if (typeof valor !== "string" || !DATA_REGEX.test(valor)) {
    adicionarErro(arquivo, local, "Data deve estar em YYYY-MM-DD.");
    return;
  }

  const data = new Date(`${valor}T00:00:00Z`);

  if (Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== valor) {
    adicionarErro(arquivo, local, "Data invalida.");
  }
}

function validarHoraCalendario(valor, arquivo, local) {
  if (typeof valor !== "string" || !HORA_REGEX.test(valor)) {
    adicionarErro(arquivo, local, "Hora deve estar em HH:mm.");
  }
}

function validarJogoCalendario(jogo, arquivo, local, idsEncontrados, fases) {
  if (!isObjetoSimples(jogo)) {
    adicionarErro(arquivo, local, "Jogo do calendario deve ser um objeto.");
    return;
  }

  CAMPOS_CALENDARIO_OBRIGATORIOS.forEach((campo) => {
    if (!hasOwn(jogo, campo)) {
      adicionarErro(arquivo, local, `Campo obrigatorio ausente: ${campo}.`);
    }
  });

  CAMPOS_RESULTADO_PROIBIDOS_NO_CALENDARIO.forEach((campo) => {
    if (hasOwn(jogo, campo)) {
      adicionarErro(
        arquivo,
        `${local}.${campo}`,
        "Calendario nao deve conter placares ou resultado oficial."
      );
    }
  });

  if (!Number.isInteger(jogo.jogo)) {
    adicionarErro(arquivo, `${local}.jogo`, "ID do jogo deve ser inteiro.");
  } else {
    idsEncontrados.set(jogo.jogo, (idsEncontrados.get(jogo.jogo) || 0) + 1);
  }

  if (typeof jogo.fase !== "string" || jogo.fase.trim() === "") {
    adicionarErro(arquivo, `${local}.fase`, "Fase deve ser texto preenchido.");
  } else {
    fases[jogo.fase] = (fases[jogo.fase] || 0) + 1;
  }

  if (jogo.fase === "grupos") {
    if (typeof jogo.grupo !== "string" || !/^[A-L]$/.test(jogo.grupo)) {
      adicionarErro(arquivo, `${local}.grupo`, "Grupo deve ser uma letra de A a L.");
    }
  } else if (jogo.grupo !== null) {
    adicionarErro(arquivo, `${local}.grupo`, "Grupo deve ser null no mata-mata.");
  }

  validarDataCalendario(jogo.data, arquivo, `${local}.data`);
  validarHoraCalendario(jogo.hora_brasilia, arquivo, `${local}.hora_brasilia`);

  if (jogo.timezone !== "America/Sao_Paulo") {
    adicionarErro(
      arquivo,
      `${local}.timezone`,
      "Timezone deve ser America/Sao_Paulo."
    );
  }

  ["mandante", "visitante", "sede"].forEach((campo) => {
    if (typeof jogo[campo] !== "string" || jogo[campo].trim() === "") {
      adicionarErro(
        arquivo,
        `${local}.${campo}`,
        "Campo deve ser texto preenchido."
      );
    }
  });
}

function validarCalendarioContraBolao(calendario, dadosPalpites) {
  const participanteBase = Array.isArray(dadosPalpites) ? dadosPalpites[0] : null;
  const jogosBase = Array.isArray(participanteBase?.jogos)
    ? participanteBase.jogos
    : [];

  if (jogosBase.length === 0) {
    adicionarAviso(
      ARQUIVO_CALENDARIO,
      "$",
      "Nao foi possivel comparar calendario com os jogos do bolao."
    );
    return;
  }

  const jogosBolaoPorId = new Map(
    jogosBase.map((jogo) => [Number(jogo.jogo), jogo])
  );

  calendario.forEach((jogoCalendario, index) => {
    const local = `$[${index}]`;
    const jogoBolao = jogosBolaoPorId.get(Number(jogoCalendario.jogo));

    if (!jogoBolao) {
      adicionarErro(
        ARQUIVO_CALENDARIO,
        local,
        `Jogo ${jogoCalendario.jogo} nao existe na base de palpites.`
      );
      return;
    }

    if (jogoCalendario.fase !== jogoBolao.fase) {
      adicionarErro(
        ARQUIVO_CALENDARIO,
        `${local}.fase`,
        `Fase difere do bolao: calendario=${jogoCalendario.fase}, bolao=${jogoBolao.fase}.`
      );
    }

    if (jogoCalendario.fase !== "grupos") return;

    const mandanteBolao = NOMES_CALENDARIO_PARA_BOLAO[jogoCalendario.mandante];
    const visitanteBolao = NOMES_CALENDARIO_PARA_BOLAO[jogoCalendario.visitante];

    if (!mandanteBolao || !visitanteBolao) {
      adicionarAviso(
        ARQUIVO_CALENDARIO,
        local,
        "Nao ha mapa de nomes para comparar selecoes com o bolao."
      );
      return;
    }

    if (
      mandanteBolao !== jogoBolao.selecao_a ||
      visitanteBolao !== jogoBolao.selecao_b
    ) {
      adicionarErro(
        ARQUIVO_CALENDARIO,
        local,
        `Confronto difere do bolao: calendario=${mandanteBolao} x ${visitanteBolao}, bolao=${jogoBolao.selecao_a} x ${jogoBolao.selecao_b}.`
      );
    }
  });
}

function validarCalendario(dadosPalpites) {
  const dados = lerJson(ARQUIVO_CALENDARIO);

  if (!dados) return;

  validarStringsVazias(dados, ARQUIVO_CALENDARIO, "$");

  if (!Array.isArray(dados)) {
    adicionarErro(ARQUIVO_CALENDARIO, "$", "Raiz deve ser um array.");
    return;
  }

  relatorio.resumo.jogosCalendario = dados.length;

  if (dados.length !== TOTAL_JOGOS_ESPERADO) {
    adicionarErro(
      ARQUIVO_CALENDARIO,
      "$",
      `Calendario deve ter ${TOTAL_JOGOS_ESPERADO} jogos; encontrado: ${dados.length}.`
    );
  }

  const idsEncontrados = new Map();
  const fases = {};

  dados.forEach((jogo, indiceJogo) => {
    validarJogoCalendario(
      jogo,
      ARQUIVO_CALENDARIO,
      `$[${indiceJogo}]`,
      idsEncontrados,
      fases
    );
  });

  validarIdsJogos(ARQUIVO_CALENDARIO, "$", idsEncontrados);
  validarContagemFases(ARQUIVO_CALENDARIO, "$", fases);
  validarCalendarioContraBolao(dados, dadosPalpites);
}

function validarObjetoOpcional(arquivo, dados, chave) {
  if (!hasOwn(dados, chave)) {
    adicionarAviso(arquivo, "$", `Chave opcional ausente: ${chave}.`);
    return;
  }

  if (dados[chave] === null) {
    adicionarAviso(arquivo, `$.${chave}`, "Chave opcional esta null.");
    return;
  }

  if (!isObjetoSimples(dados[chave])) {
    adicionarErro(arquivo, `$.${chave}`, "Chave deve ser um objeto.");
  }
}

function validarJogoOficial(jogo, arquivo, local, idsEncontrados) {
  if (!isObjetoSimples(jogo)) {
    adicionarErro(arquivo, local, "Jogo oficial deve ser um objeto.");
    return;
  }

  if (!Number.isInteger(jogo.jogo)) {
    adicionarErro(arquivo, `${local}.jogo`, "ID do jogo deve ser inteiro.");
  } else {
    idsEncontrados.set(jogo.jogo, (idsEncontrados.get(jogo.jogo) || 0) + 1);

    if (jogo.jogo < 1 || jogo.jogo > TOTAL_JOGOS_ESPERADO) {
      adicionarErro(
        arquivo,
        `${local}.jogo`,
        "ID do jogo esta fora do intervalo 1-104."
      );
    }
  }

  if (hasOwn(jogo, "fase") && typeof jogo.fase !== "string") {
    adicionarErro(arquivo, `${local}.fase`, "Fase deve ser texto.");
  }

  CAMPOS_SELECAO.forEach((campo) => {
    if (hasOwn(jogo, campo) && jogo[campo] !== null && typeof jogo[campo] !== "string") {
      adicionarErro(arquivo, `${local}.${campo}`, "Selecao deve ser texto ou null.");
    }
  });

  CAMPOS_PLACAR.forEach((campo) => {
    if (hasOwn(jogo, campo) && !isNumeroOuNull(jogo[campo])) {
      adicionarErro(
        arquivo,
        `${local}.${campo}`,
        "Placar deve ser numero ou null."
      );
    }
  });

  if (hasOwn(jogo, "encerrado") && typeof jogo.encerrado !== "boolean") {
    adicionarErro(arquivo, `${local}.encerrado`, "Encerrado deve ser booleano.");
  }

  validarPenaltisForaDeEmpate(jogo, arquivo, local);
}

function validarJogosOficiais(dados) {
  if (!hasOwn(dados, "jogos")) {
    adicionarAviso(ARQUIVO_RESULTADOS, "$", "Chave opcional ausente: jogos.");
    return;
  }

  const { jogos } = dados;
  let entradas = [];

  if (Array.isArray(jogos)) {
    entradas = jogos.map((jogo, index) => ({
      local: `$.jogos[${index}]`,
      jogo,
    }));
  } else if (isObjetoSimples(jogos)) {
    entradas = Object.entries(jogos).map(([chave, jogo]) => ({
      local: `$.jogos.${chave}`,
      jogo,
    }));
  } else {
    adicionarErro(
      ARQUIVO_RESULTADOS,
      "$.jogos",
      "Jogos deve ser array ou objeto."
    );
    return;
  }

  relatorio.resumo.jogosOficiais = entradas.length;

  const idsEncontrados = new Map();

  entradas.forEach(({ local, jogo }) => {
    validarJogoOficial(jogo, ARQUIVO_RESULTADOS, local, idsEncontrados);
  });

  idsEncontrados.forEach((quantidade, id) => {
    if (quantidade > 1) {
      adicionarErro(
        ARQUIVO_RESULTADOS,
        "$.jogos",
        `Jogo oficial ${id} duplicado ${quantidade} vezes.`
      );
    }
  });
}

function validarResultadosOficiais() {
  const dados = lerJson(ARQUIVO_RESULTADOS);

  if (!dados) return;

  if (!isObjetoSimples(dados)) {
    adicionarErro(ARQUIVO_RESULTADOS, "$", "Raiz deve ser um objeto.");
    return;
  }

  CHAVES_RESULTADOS_OFICIAIS.filter(
    (chave) => chave === "status" || chave === "ultima_atualizacao"
  ).forEach((chave) => {
    if (!hasOwn(dados, chave)) {
      adicionarAviso(ARQUIVO_RESULTADOS, "$", `Chave opcional ausente: ${chave}.`);
    }
  });

  if (hasOwn(dados, "status") && dados.status !== null && typeof dados.status !== "string") {
    adicionarErro(ARQUIVO_RESULTADOS, "$.status", "Status deve ser texto ou null.");
  }

  if (
    hasOwn(dados, "ultima_atualizacao") &&
    dados.ultima_atualizacao !== null &&
    typeof dados.ultima_atualizacao !== "string"
  ) {
    adicionarErro(
      ARQUIVO_RESULTADOS,
      "$.ultima_atualizacao",
      "Ultima atualizacao deve ser texto ou null."
    );
  }

  validarJogosOficiais(dados);
  validarObjetoOpcional(ARQUIVO_RESULTADOS, dados, "fases_oficiais");
  validarObjetoOpcional(ARQUIVO_RESULTADOS, dados, "posicoes_finais_oficiais");
  validarObjetoOpcional(ARQUIVO_RESULTADOS, dados, "chaveamento_oficial");
}

function imprimirLista(titulo, itens) {
  if (itens.length === 0) return;

  console.log("");
  console.log(`${titulo}:`);

  itens.slice(0, LIMITE_DETALHES).forEach((item) => {
    console.log(`- ${item.arquivo} ${item.local}: ${item.mensagem}`);
  });

  const restantes = itens.length - LIMITE_DETALHES;

  if (restantes > 0) {
    console.log(`- ... mais ${restantes} ocorrencias nao exibidas.`);
  }
}

function imprimirRelatorio() {
  console.log("Validacao de integridade dos dados do Bolao da Copa 2026");
  console.log("");
  console.log("Resumo:");
  console.log(`- Total de participantes: ${relatorio.resumo.participantes}`);
  console.log(`- Total de jogos nos palpites: ${relatorio.resumo.jogosPalpites}`);
  console.log(`- Total de jogos no calendario: ${relatorio.resumo.jogosCalendario}`);
  console.log(`- Total de jogos oficiais: ${relatorio.resumo.jogosOficiais}`);
  console.log(`- Erros encontrados: ${relatorio.erros.length}`);
  console.log(`- Avisos encontrados: ${relatorio.avisos.length}`);

  imprimirLista("Erros", relatorio.erros);
  imprimirLista("Avisos", relatorio.avisos);

  console.log("");

  if (relatorio.erros.length > 0) {
    console.log("Status final: FALHOU. Corrija os erros estruturais acima.");
    process.exitCode = 1;
    return;
  }

  if (relatorio.avisos.length > 0) {
    console.log("Status final: OK COM AVISOS. Nenhum erro estrutural encontrado.");
    return;
  }

  console.log("Status final: SUCESSO. Dados integros.");
}

const dadosPalpites = validarPalpites();
validarCalendario(dadosPalpites);
validarResultadosOficiais();
imprimirRelatorio();
