import { useEffect, useMemo, useState } from "react";
import { formatarFase } from "../utils/gameUtils";
import {
  atualizarChaveamentoEProgressoes,
  deveResetarChaveamentoPorJogoGrupo,
  getJogosDependentes,
  montarJogosAdmin,
  removerResultadosDependentes,
  removerTodoMataMataEChaveamento,
} from "../utils/knockoutUtils";
import { formatarSelecao } from "../utils/teamUtils";
import TeamName from "./TeamName";

const FASES_PADRAO = {
  dezesseis_avos: [],
  oitavas: [],
  quartas: [],
  semifinal: [],
  final: [],
};

const POSICOES_PADRAO = {
  campeao: null,
  vice: null,
  terceiro: null,
  quarto: null,
};

const FILTROS_FASE = [
  { id: "todos", label: "Todos" },
  { id: "grupos", label: "Grupos" },
  { id: "dezesseis_avos", label: "16 avos" },
  { id: "oitavas", label: "Oitavas" },
  { id: "quartas", label: "Quartas" },
  { id: "semifinal", label: "Semifinais" },
  { id: "terceiro_lugar", label: "3º lugar" },
  { id: "final", label: "Final" },
];

const FILTROS_STATUS = [
  { id: "todos", label: "Todos" },
  { id: "cadastrados", label: "Cadastrados" },
  { id: "pendentes", label: "Pendentes" },
];

function dataHojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function numeroOuNull(valor) {
  if (valor === "" || valor === null || valor === undefined) return null;

  const numero = Number(valor);

  if (Number.isNaN(numero)) return null;

  return numero;
}

function normalizarTexto(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isMataMata(jogo) {
  return jogo?.fase && jogo.fase !== "grupos";
}

function criarMapaResultados(resultadosOficiais) {
  return (resultadosOficiais?.jogos || []).reduce((mapa, jogo) => {
    mapa[jogo.jogo] = jogo;
    return mapa;
  }, {});
}

function getResultadoExistente(resultadosOficiais, numeroJogo) {
  return (resultadosOficiais?.jogos || []).find(
    (jogo) => Number(jogo.jogo) === Number(numeroJogo)
  );
}

function getVencedorPorPlacar(jogo, golsA, golsB, penaltisA, penaltisB) {
  if (!jogo) {
    return {
      resultado_oficial: null,
      vencedor_oficial: null,
      perdedor_oficial: null,
      motivo: "Selecione um jogo.",
    };
  }

  if (!jogo.selecao_a || !jogo.selecao_b) {
    return {
      resultado_oficial: null,
      vencedor_oficial: null,
      perdedor_oficial: null,
      motivo:
        "Este confronto ainda não foi definido pelo chaveamento automático.",
    };
  }

  if (golsA === null || golsB === null) {
    return {
      resultado_oficial: null,
      vencedor_oficial: null,
      perdedor_oficial: null,
      motivo: "Placar incompleto.",
    };
  }

  if (golsA > golsB) {
    return {
      resultado_oficial: "A",
      vencedor_oficial: jogo.selecao_a,
      perdedor_oficial: jogo.selecao_b,
      motivo: `${formatarSelecao(jogo.selecao_a)} venceu no tempo normal.`,
    };
  }

  if (golsB > golsA) {
    return {
      resultado_oficial: "B",
      vencedor_oficial: jogo.selecao_b,
      perdedor_oficial: jogo.selecao_a,
      motivo: `${formatarSelecao(jogo.selecao_b)} venceu no tempo normal.`,
    };
  }

  if (!isMataMata(jogo)) {
    return {
      resultado_oficial: "EMPATE",
      vencedor_oficial: null,
      perdedor_oficial: null,
      motivo: "Empate válido na fase de grupos.",
    };
  }

  if (penaltisA === null || penaltisB === null) {
    return {
      resultado_oficial: "EMPATE",
      vencedor_oficial: null,
      perdedor_oficial: null,
      motivo: "Empate no mata-mata exige pênaltis.",
    };
  }

  if (penaltisA > penaltisB) {
    return {
      resultado_oficial: "EMPATE",
      vencedor_oficial: jogo.selecao_a,
      perdedor_oficial: jogo.selecao_b,
      motivo: `${formatarSelecao(jogo.selecao_a)} venceu nos pênaltis.`,
    };
  }

  if (penaltisB > penaltisA) {
    return {
      resultado_oficial: "EMPATE",
      vencedor_oficial: jogo.selecao_b,
      perdedor_oficial: jogo.selecao_a,
      motivo: `${formatarSelecao(jogo.selecao_b)} venceu nos pênaltis.`,
    };
  }

  return {
    resultado_oficial: "EMPATE",
    vencedor_oficial: null,
    perdedor_oficial: null,
    motivo: "Os pênaltis não podem terminar empatados.",
  };
}

function validarResultado({ jogo, golsA, golsB, penaltisA, penaltisB }) {
  if (!jogo) {
    return "Selecione um jogo.";
  }

  if (!jogo.selecao_a || !jogo.selecao_b) {
    return "Este confronto ainda não foi definido. Aguarde os jogos anteriores ou gere o chaveamento.";
  }

  if (golsA === null || golsB === null) {
    return "Informe o placar completo do jogo.";
  }

  if (golsA < 0 || golsB < 0) {
    return "O placar não pode ter gols negativos.";
  }

  if (!Number.isInteger(golsA) || !Number.isInteger(golsB)) {
    return "Os gols precisam ser números inteiros.";
  }

  if (!isMataMata(jogo)) {
    return null;
  }

  if (golsA !== golsB) {
    return null;
  }

  if (penaltisA === null || penaltisB === null) {
    return "No mata-mata, se o jogo empatar, informe os pênaltis.";
  }

  if (penaltisA < 0 || penaltisB < 0) {
    return "Os pênaltis não podem ser negativos.";
  }

  if (!Number.isInteger(penaltisA) || !Number.isInteger(penaltisB)) {
    return "Os pênaltis precisam ser números inteiros.";
  }

  if (penaltisA === penaltisB) {
    return "Disputa de pênaltis não pode terminar empatada.";
  }

  return null;
}

function criarResultadoOficial({ jogo, golsA, golsB, penaltisA, penaltisB }) {
  const calculo = getVencedorPorPlacar(jogo, golsA, golsB, penaltisA, penaltisB);

  const usarPenaltis =
    isMataMata(jogo) &&
    golsA !== null &&
    golsB !== null &&
    golsA === golsB &&
    penaltisA !== null &&
    penaltisB !== null;

  return {
    jogo: jogo.jogo,
    fase: jogo.fase,
    selecao_a: jogo.selecao_a,
    gols_a: golsA,
    gols_b: golsB,
    selecao_b: jogo.selecao_b,
    penaltis_a: usarPenaltis ? penaltisA : null,
    penaltis_b: usarPenaltis ? penaltisB : null,
    resultado_oficial: calculo.resultado_oficial,
    vencedor_oficial: calculo.vencedor_oficial,
    perdedor_oficial: calculo.perdedor_oficial,
    encerrado: true,
  };
}

function ordenarJogos(jogos) {
  return [...jogos].sort((a, b) => a.jogo - b.jogo);
}

function resultadoAlterouIdentidade(anterior, novoResultado) {
  if (!anterior) return true;

  return (
    anterior.selecao_a !== novoResultado.selecao_a ||
    anterior.selecao_b !== novoResultado.selecao_b ||
    anterior.vencedor_oficial !== novoResultado.vencedor_oficial ||
    anterior.perdedor_oficial !== novoResultado.perdedor_oficial
  );
}

export default function AdminResultsPanel({
  participantes,
  resultadosOficiais,
  onAtualizarResultados,
}) {
  const jogosBase = useMemo(() => {
    const jogosOriginais = ordenarJogos(participantes?.[0]?.jogos || []);

    return ordenarJogos(montarJogosAdmin(jogosOriginais, resultadosOficiais));
  }, [participantes, resultadosOficiais]);

  const mapaResultados = useMemo(
    () => criarMapaResultados(resultadosOficiais),
    [resultadosOficiais]
  );

  const [faseFiltro, setFaseFiltro] = useState("todos");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [busca, setBusca] = useState("");
  const [numeroJogoSelecionado, setNumeroJogoSelecionado] = useState("");
  const [golsA, setGolsA] = useState("");
  const [golsB, setGolsB] = useState("");
  const [penaltisA, setPenaltisA] = useState("");
  const [penaltisB, setPenaltisB] = useState("");
  const [mensagem, setMensagem] = useState(null);

  const jogoSelecionado = useMemo(() => {
    return jogosBase.find(
      (jogo) => Number(jogo.jogo) === Number(numeroJogoSelecionado)
    );
  }, [jogosBase, numeroJogoSelecionado]);

  const resultadoExistente = useMemo(() => {
    if (!numeroJogoSelecionado) return null;

    return getResultadoExistente(resultadosOficiais, numeroJogoSelecionado);
  }, [resultadosOficiais, numeroJogoSelecionado]);

  const jogosFiltrados = useMemo(() => {
    const termo = normalizarTexto(busca);

    return jogosBase.filter((jogo) => {
      const resultado = mapaResultados[jogo.jogo];

      if (faseFiltro !== "todos" && jogo.fase !== faseFiltro) {
        return false;
      }

      if (statusFiltro === "cadastrados" && !resultado?.encerrado) {
        return false;
      }

      if (statusFiltro === "pendentes" && resultado?.encerrado) {
        return false;
      }

      if (!termo) return true;

      const conteudo = normalizarTexto(
        `${jogo.jogo} ${jogo.fase} ${jogo.slot_a || ""} ${
          jogo.slot_b || ""
        } ${jogo.selecao_a || ""} ${jogo.selecao_b || ""} ${formatarSelecao(
          jogo.selecao_a
        )} ${formatarSelecao(jogo.selecao_b)}`
      );

      return conteudo.includes(termo);
    });
  }, [jogosBase, mapaResultados, faseFiltro, statusFiltro, busca]);

  const golsANumero = numeroOuNull(golsA);
  const golsBNumero = numeroOuNull(golsB);
  const penaltisANumero = numeroOuNull(penaltisA);
  const penaltisBNumero = numeroOuNull(penaltisB);

  const calculoPrevia = jogoSelecionado
    ? getVencedorPorPlacar(
        jogoSelecionado,
        golsANumero,
        golsBNumero,
        penaltisANumero,
        penaltisBNumero
      )
    : null;

  const deveMostrarPenaltis =
    jogoSelecionado &&
    isMataMata(jogoSelecionado) &&
    golsANumero !== null &&
    golsBNumero !== null &&
    golsANumero === golsBNumero;

  const totalCadastrados = (resultadosOficiais?.jogos || []).filter(
    (jogo) => jogo.encerrado
  ).length;

  const totalPendentes = jogosBase.length - totalCadastrados;

  useEffect(() => {
    if (!resultadoExistente) {
      setGolsA("");
      setGolsB("");
      setPenaltisA("");
      setPenaltisB("");
      setMensagem(null);
      return;
    }

    setGolsA(
      resultadoExistente.gols_a === null ||
        resultadoExistente.gols_a === undefined
        ? ""
        : String(resultadoExistente.gols_a)
    );

    setGolsB(
      resultadoExistente.gols_b === null ||
        resultadoExistente.gols_b === undefined
        ? ""
        : String(resultadoExistente.gols_b)
    );

    setPenaltisA(
      resultadoExistente.penaltis_a === null ||
        resultadoExistente.penaltis_a === undefined
        ? ""
        : String(resultadoExistente.penaltis_a)
    );

    setPenaltisB(
      resultadoExistente.penaltis_b === null ||
        resultadoExistente.penaltis_b === undefined
        ? ""
        : String(resultadoExistente.penaltis_b)
    );

    setMensagem({
      tipo: "info",
      texto:
        "Este jogo já possui resultado cadastrado. Ao salvar, ele será atualizado.",
    });
  }, [resultadoExistente]);

  function selecionarJogo(numeroJogo) {
    setNumeroJogoSelecionado(String(numeroJogo));
    setMensagem(null);
  }

  function limparFormulario() {
    setNumeroJogoSelecionado("");
    setGolsA("");
    setGolsB("");
    setPenaltisA("");
    setPenaltisB("");
    setMensagem(null);
  }

  function salvarResultado() {
    const erro = validarResultado({
      jogo: jogoSelecionado,
      golsA: golsANumero,
      golsB: golsBNumero,
      penaltisA: penaltisANumero,
      penaltisB: penaltisBNumero,
    });

    if (erro) {
      setMensagem({
        tipo: "erro",
        texto: erro,
      });

      return;
    }

    let resultadosBase = resultadosOficiais || {};

    const precisaResetarChaveamento = deveResetarChaveamentoPorJogoGrupo(
      jogoSelecionado.jogo,
      resultadosBase
    );

    if (precisaResetarChaveamento) {
      const confirmarReset = window.confirm(
        "Este jogo é da fase de grupos e já existe chaveamento/mata-mata cadastrado. Alterar este resultado vai apagar o chaveamento e todos os resultados de mata-mata para evitar inconsistências. Deseja continuar?"
      );

      if (!confirmarReset) return;

      resultadosBase = removerTodoMataMataEChaveamento(resultadosBase);
    }

    const resultadoAnterior = getResultadoExistente(
      resultadosBase,
      jogoSelecionado.jogo
    );

    const novoResultado = criarResultadoOficial({
      jogo: jogoSelecionado,
      golsA: golsANumero,
      golsB: golsBNumero,
      penaltisA: penaltisANumero,
      penaltisB: penaltisBNumero,
    });

    let outrosJogos = (resultadosBase?.jogos || []).filter(
      (jogo) => Number(jogo.jogo) !== Number(jogoSelecionado.jogo)
    );

    if (isMataMata(jogoSelecionado)) {
      const dependentes = getJogosDependentes(jogoSelecionado.jogo);
      const dependentesComResultado = dependentes.filter((numero) =>
        outrosJogos.some((jogo) => Number(jogo.jogo) === Number(numero))
      );

      const deveLimparDependentes = resultadoAlterouIdentidade(
        resultadoAnterior,
        novoResultado
      );

      if (deveLimparDependentes && dependentesComResultado.length > 0) {
        const confirmarDependentes = window.confirm(
          `Alterar este resultado pode mudar o chaveamento. Os resultados dependentes dos jogos ${dependentesComResultado.join(
            ", "
          )} serão removidos. Deseja continuar?`
        );

        if (!confirmarDependentes) return;

        outrosJogos = removerResultadosDependentes(
          outrosJogos,
          jogoSelecionado.jogo
        );
      }
    }

    let novosResultados = {
      ...(resultadosBase || {}),
      status: "EM_ANDAMENTO",
      ultima_atualizacao: dataHojeISO(),
      jogos: ordenarJogos([...outrosJogos, novoResultado]),
      fases_oficiais: {
        ...FASES_PADRAO,
        ...(resultadosBase?.fases_oficiais || {}),
      },
      posicoes_finais_oficiais: {
        ...POSICOES_PADRAO,
        ...(resultadosBase?.posicoes_finais_oficiais || {}),
      },
    };

    novosResultados = atualizarChaveamentoEProgressoes(novosResultados);

    onAtualizarResultados(novosResultados);

    setMensagem({
      tipo: "sucesso",
      texto: `Resultado do jogo ${jogoSelecionado.jogo} salvo. Chaveamento, fases oficiais e ranking foram recalculados.`,
    });
  }

  function removerResultado() {
    if (!jogoSelecionado) {
      setMensagem({
        tipo: "erro",
        texto: "Selecione um jogo para remover o resultado.",
      });

      return;
    }

    const existe = getResultadoExistente(resultadosOficiais, jogoSelecionado.jogo);

    if (!existe) {
      setMensagem({
        tipo: "erro",
        texto: "Este jogo ainda não possui resultado cadastrado.",
      });

      return;
    }

    let resultadosBase = resultadosOficiais || {};

    const precisaResetarChaveamento = deveResetarChaveamentoPorJogoGrupo(
      jogoSelecionado.jogo,
      resultadosBase
    );

    if (precisaResetarChaveamento) {
      const confirmarReset = window.confirm(
        "Remover este resultado da fase de grupos vai apagar o chaveamento e todos os resultados de mata-mata para evitar inconsistências. Deseja continuar?"
      );

      if (!confirmarReset) return;

      resultadosBase = removerTodoMataMataEChaveamento(resultadosBase);
    }

    const dependentes = isMataMata(jogoSelecionado)
      ? getJogosDependentes(jogoSelecionado.jogo)
      : [];

    const dependentesComResultado = dependentes.filter((numero) =>
      (resultadosBase?.jogos || []).some(
        (jogo) => Number(jogo.jogo) === Number(numero)
      )
    );

    if (dependentesComResultado.length > 0) {
      const confirmarDependentes = window.confirm(
        `Remover este resultado também removerá resultados dependentes dos jogos ${dependentesComResultado.join(
          ", "
        )}. Deseja continuar?`
      );

      if (!confirmarDependentes) return;
    } else {
      const confirmar = window.confirm(
        `Deseja remover o resultado cadastrado do jogo ${jogoSelecionado.jogo}?`
      );

      if (!confirmar) return;
    }

    let jogosRestantes = (resultadosBase?.jogos || []).filter(
      (jogo) => Number(jogo.jogo) !== Number(jogoSelecionado.jogo)
    );

    jogosRestantes = removerResultadosDependentes(
      jogosRestantes,
      jogoSelecionado.jogo
    );

    let novosResultados = {
      ...(resultadosBase || {}),
      status: resultadosBase?.status || "EM_ANDAMENTO",
      ultima_atualizacao: dataHojeISO(),
      jogos: ordenarJogos(jogosRestantes),
      fases_oficiais: {
        ...FASES_PADRAO,
        ...(resultadosBase?.fases_oficiais || {}),
      },
      posicoes_finais_oficiais: {
        ...POSICOES_PADRAO,
        ...(resultadosBase?.posicoes_finais_oficiais || {}),
      },
    };

    novosResultados = atualizarChaveamentoEProgressoes(novosResultados);

    onAtualizarResultados(novosResultados);

    limparFormulario();

    setMensagem({
      tipo: "sucesso",
      texto:
        "Resultado removido. Chaveamento, fases oficiais e ranking foram recalculados.",
    });
  }

  return (
    <div className="card admin-placares-pro">
      <div className="admin-placares-header">
        <div>
          <p className="tag">Administração</p>
          <h2>Placares oficiais</h2>
          <p>
            Cadastre os resultados jogo a jogo. O sistema calcula o vencedor,
            propaga automaticamente os classificados e atualiza ranking,
            chaveamento e posições finais.
          </p>
        </div>

        <div className="admin-placares-stats">
          <div>
            <span>Cadastrados</span>
            <strong>{totalCadastrados}</strong>
          </div>

          <div>
            <span>Pendentes</span>
            <strong>{totalPendentes}</strong>
          </div>

          <div>
            <span>Total</span>
            <strong>{jogosBase.length}</strong>
          </div>
        </div>
      </div>

      <div className="admin-placares-layout">
        <section className="admin-jogos-browser">
          <div className="admin-jogos-filtros">
            <input
              type="text"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar jogo, seleção, fase ou slot..."
            />

            <div className="admin-filter-row">
              {FILTROS_FASE.map((filtro) => (
                <button
                  key={filtro.id}
                  type="button"
                  className={faseFiltro === filtro.id ? "ativo" : ""}
                  onClick={() => setFaseFiltro(filtro.id)}
                >
                  {filtro.label}
                </button>
              ))}
            </div>

            <div className="admin-filter-row compact">
              {FILTROS_STATUS.map((filtro) => (
                <button
                  key={filtro.id}
                  type="button"
                  className={statusFiltro === filtro.id ? "ativo" : ""}
                  onClick={() => setStatusFiltro(filtro.id)}
                >
                  {filtro.label}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-jogos-lista">
            {jogosFiltrados.map((jogo) => {
              const cadastrado = mapaResultados[jogo.jogo]?.encerrado;
              const ativo =
                Number(jogo.jogo) === Number(numeroJogoSelecionado);
              const confrontoDefinido = jogo.selecao_a && jogo.selecao_b;

              return (
                <button
                  key={jogo.jogo}
                  type="button"
                  className={
                    ativo
                      ? "admin-jogo-card ativo"
                      : cadastrado
                      ? "admin-jogo-card cadastrado"
                      : !confrontoDefinido && Number(jogo.jogo) > 72
                      ? "admin-jogo-card indefinido"
                      : "admin-jogo-card"
                  }
                  onClick={() => selecionarJogo(jogo.jogo)}
                >
                  <div className="admin-jogo-card-top">
                    <span>Jogo {jogo.jogo}</span>
                    <small>
                      {formatarFase(jogo.fase)}
                      {jogo.slot_a && jogo.slot_b
                        ? ` · ${jogo.slot_a} x ${jogo.slot_b}`
                        : ""}
                    </small>
                  </div>

                  <div className="admin-jogo-card-times">
                    <TeamName selecao={jogo.selecao_a} />
                    <strong>x</strong>
                    <TeamName selecao={jogo.selecao_b} />
                  </div>

                  <div className="admin-jogo-card-status">
                    {cadastrado
                      ? "Resultado cadastrado"
                      : confrontoDefinido
                      ? "Pendente"
                      : "Aguardando chaveamento"}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="admin-placar-editor">
          {!jogoSelecionado ? (
            <div className="admin-editor-empty">
              <strong>Selecione um jogo</strong>
              <span>
                Escolha um jogo na lista ao lado para cadastrar ou atualizar o
                resultado oficial.
              </span>
            </div>
          ) : (
            <>
              <div className="admin-editor-jogo">
                <div>
                  <p className="tag">Jogo {jogoSelecionado.jogo}</p>
                  <h3>
                    <TeamName selecao={jogoSelecionado.selecao_a} /> x{" "}
                    <TeamName selecao={jogoSelecionado.selecao_b} />
                  </h3>
                  <span>
                    {formatarFase(jogoSelecionado.fase)}
                    {jogoSelecionado.slot_a && jogoSelecionado.slot_b
                      ? ` · ${jogoSelecionado.slot_a} x ${jogoSelecionado.slot_b}`
                      : ""}
                  </span>
                </div>

                <div
                  className={
                    isMataMata(jogoSelecionado)
                      ? "admin-regra-pill mata"
                      : "admin-regra-pill grupos"
                  }
                >
                  {isMataMata(jogoSelecionado)
                    ? "Mata-mata"
                    : "Fase de grupos"}
                </div>
              </div>

              <div className="admin-score-editor">
                <label>
                  <span>
                    <TeamName selecao={jogoSelecionado.selecao_a} />
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={golsA}
                    onChange={(event) => setGolsA(event.target.value)}
                    placeholder="0"
                    disabled={
                      !jogoSelecionado.selecao_a || !jogoSelecionado.selecao_b
                    }
                  />
                </label>

                <div className="admin-score-x">x</div>

                <label>
                  <span>
                    <TeamName selecao={jogoSelecionado.selecao_b} />
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={golsB}
                    onChange={(event) => setGolsB(event.target.value)}
                    placeholder="0"
                    disabled={
                      !jogoSelecionado.selecao_a || !jogoSelecionado.selecao_b
                    }
                  />
                </label>
              </div>

              {isMataMata(jogoSelecionado) ? (
                <div
                  className={
                    deveMostrarPenaltis
                      ? "admin-penaltis-box ativo"
                      : "admin-penaltis-box"
                  }
                >
                  <div>
                    <strong>Pênaltis</strong>
                    <p>
                      Só são exigidos se o jogo de mata-mata terminar empatado
                      no tempo normal.
                    </p>
                  </div>

                  <div className="admin-penaltis-inputs">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={penaltisA}
                      onChange={(event) => setPenaltisA(event.target.value)}
                      placeholder="A"
                      disabled={!deveMostrarPenaltis}
                    />

                    <span>x</span>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={penaltisB}
                      onChange={(event) => setPenaltisB(event.target.value)}
                      placeholder="B"
                      disabled={!deveMostrarPenaltis}
                    />
                  </div>
                </div>
              ) : (
                <div className="admin-grupos-info">
                  Jogos da fase de grupos podem terminar empatados. Pênaltis
                  ficam bloqueados nesta fase.
                </div>
              )}

              <div className="admin-previa">
                <span>Prévia do resultado</span>
                <strong>{calculoPrevia?.motivo || "Informe o placar."}</strong>

                {calculoPrevia?.vencedor_oficial && (
                  <div>
                    Vencedor:{" "}
                    <TeamName selecao={calculoPrevia.vencedor_oficial} />
                  </div>
                )}
              </div>

              {mensagem && (
                <div className={`admin-mensagem ${mensagem.tipo}`}>
                  {mensagem.texto}
                </div>
              )}

              <div className="admin-actions">
                <button
                  type="button"
                  className="admin-primary"
                  onClick={salvarResultado}
                >
                  Salvar resultado
                </button>

                <button type="button" onClick={limparFormulario}>
                  Limpar formulário
                </button>

                <button
                  type="button"
                  className="admin-danger"
                  onClick={removerResultado}
                >
                  Remover resultado
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}