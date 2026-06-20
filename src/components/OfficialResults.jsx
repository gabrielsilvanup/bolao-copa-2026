import { useMemo, useRef, useState } from "react";
import {
  buscaEhJogosDoDia,
  formatarAgendaJogo,
  formatarDataBrasilia,
  formatarDataCurta,
  getDataHojeBrasilia,
  nomeMandante,
  nomeVisitante,
  textoBuscaCalendario,
} from "../utils/calendarUtils";
import { formatarFase } from "../utils/gameUtils";
import {
  calcularPontuacaoJogo,
  calcularRanking,
} from "../utils/scoringUtils";
import { formatarSelecao, getSelecaoInfo } from "../utils/teamUtils";
import TeamName from "./TeamName";

const FILTROS_RAPIDOS = [
  { id: "hoje", label: "Jogos de Hoje" },
  { id: "dia", label: "Por Dia" },
  { id: "selecao", label: "Por Seleção" },
  { id: "todos", label: "Todos" },
  { id: "busca", label: "Busca" },
];

const FASES_CHAVEAMENTO = [
  { id: "dezesseis_avos", label: "16 avos" },
  { id: "oitavas", label: "Oitavas" },
  { id: "quartas", label: "Quartas" },
  { id: "semifinal", label: "Semifinais" },
  { id: "terceiro_lugar", label: "3º lugar" },
  { id: "final", label: "Final" },
];

const POSICOES_FINAIS = [
  { id: "campeao", label: "Campeão", destaque: "ouro" },
  { id: "vice", label: "Vice", destaque: "prata" },
  { id: "terceiro", label: "3º lugar", destaque: "bronze" },
  { id: "quarto", label: "4º lugar", destaque: "neutro" },
];

function textoStatusGeral(status) {
  if (!status) return "Status não informado";

  const mapa = {
    NAO_INICIADO: "Copa ainda não iniciada",
    EM_ANDAMENTO: "Copa em andamento",
    EM_TESTE: "Ambiente de teste",
    FINALIZADO: "Copa finalizada",
  };

  return mapa[status] || status;
}

function normalizarTexto(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function jogoTemPlacar(jogo) {
  return (
    jogo?.gols_a !== null &&
    jogo?.gols_a !== undefined &&
    jogo?.gols_b !== null &&
    jogo?.gols_b !== undefined
  );
}

function temPenaltis(jogo) {
  return (
    jogo?.gols_a !== null &&
    jogo?.gols_b !== null &&
    jogo?.gols_a === jogo?.gols_b &&
    jogo?.penaltis_a !== null &&
    jogo?.penaltis_a !== undefined &&
    jogo?.penaltis_b !== null &&
    jogo?.penaltis_b !== undefined
  );
}

function temPenaltisPreenchidos(jogo) {
  return (
    jogo?.penaltis_a !== null &&
    jogo?.penaltis_a !== undefined &&
    jogo?.penaltis_b !== null &&
    jogo?.penaltis_b !== undefined
  );
}

function temPenaltisIgnorados(jogo) {
  return (
    jogoTemPlacar(jogo) &&
    jogo.gols_a !== jogo.gols_b &&
    temPenaltisPreenchidos(jogo)
  );
}

function placarTexto(jogo) {
  if (!jogoTemPlacar(jogo)) return "-";

  return `${jogo.gols_a} x ${jogo.gols_b}`;
}

function placarComPenaltisTexto(jogo) {
  if (!jogo) return "-";

  const placar = placarTexto(jogo);

  if (!temPenaltis(jogo)) return placar;

  return `${placar} (${jogo.penaltis_a} x ${jogo.penaltis_b})`;
}

function resultadoOficialTexto(jogo) {
  if (!jogo?.encerrado || !jogoTemPlacar(jogo)) return "Pendente";

  return placarComPenaltisTexto(jogo);
}

function statusDoJogo(jogo) {
  if (jogo?.encerrado) return "encerrado";

  return "pendente";
}

function textoStatusJogo(jogo) {
  if (jogo?.encerrado) return "Resultado cadastrado";

  return "Pendente";
}

function rotuloGrupo(jogo) {
  return jogo?.grupo ? `Grupo ${jogo.grupo}` : formatarFase(jogo?.fase);
}

function rotuloConfronto(jogo) {
  return `${nomeMandante(jogo)} x ${nomeVisitante(jogo)}`;
}

function jogoEmBusca(jogo, termo) {
  if (!termo) return true;

  if (buscaEhJogosDoDia(termo)) {
    return jogo.data === getDataHojeBrasilia();
  }

  if (/^\d+$/.test(termo)) {
    return String(jogo.jogo) === termo;
  }

  const conteudo = normalizarTexto(
    [textoBuscaCalendario(jogo), formatarFase(jogo.fase)]
      .filter(Boolean)
      .join(" ")
  );

  return conteudo.includes(termo);
}

function getChaveamentoLista(resultadosOficiais) {
  const chaveamento = resultadosOficiais?.chaveamento_oficial || {};

  return FASES_CHAVEAMENTO.flatMap((fase) => {
    const lista = chaveamento[fase.id];

    if (!Array.isArray(lista)) return [];

    return lista.map((jogo) => ({
      ...jogo,
      fase: jogo.fase || fase.id,
      encerrado: false,
      gols_a: null,
      gols_b: null,
      penaltis_a: null,
      penaltis_b: null,
      resultado_oficial: null,
      vencedor_oficial: null,
      perdedor_oficial: null,
      origem: "chaveamento",
    }));
  });
}

function montarJogosPublicos(resultadosOficiais, calendarioOficial = []) {
  const jogosComResultado = resultadosOficiais?.jogos || [];
  const jogosChaveamento = getChaveamentoLista(resultadosOficiais);
  const mapaFinal = {};

  calendarioOficial.forEach((jogo) => {
    mapaFinal[Number(jogo.jogo)] = {
      ...jogo,
      selecao_a: null,
      selecao_b: null,
      gols_a: null,
      gols_b: null,
      penaltis_a: null,
      penaltis_b: null,
      resultado_oficial: null,
      vencedor_oficial: null,
      perdedor_oficial: null,
      encerrado: false,
      origem: "calendario",
    };
  });

  jogosChaveamento.forEach((jogo) => {
    mapaFinal[Number(jogo.jogo)] = {
      ...mapaFinal[Number(jogo.jogo)],
      ...jogo,
    };
  });

  jogosComResultado.forEach((jogo) => {
    mapaFinal[Number(jogo.jogo)] = {
      ...mapaFinal[Number(jogo.jogo)],
      ...jogo,
      origem: "resultado",
    };
  });

  return Object.values(mapaFinal).sort(
    (a, b) => Number(a.jogo) - Number(b.jogo)
  );
}

function agruparJogosPorData(jogos) {
  const grupos = jogos.reduce((resultado, jogo) => {
    const data = jogo.data || "sem-data";

    if (!resultado[data]) {
      resultado[data] = [];
    }

    resultado[data].push(jogo);
    return resultado;
  }, {});

  return Object.entries(grupos)
    .sort(([dataA], [dataB]) => dataA.localeCompare(dataB))
    .map(([data, lista]) => ({
      data,
      jogos: lista.sort((a, b) => {
        const hora = String(a.hora_brasilia || "").localeCompare(
          String(b.hora_brasilia || "")
        );

        if (hora !== 0) return hora;

        return Number(a.jogo) - Number(b.jogo);
      }),
    }));
}

function formatarDiaSemana(data) {
  if (!data || typeof data !== "string") return "";

  const [ano, mes, dia] = data.split("-").map(Number);

  if (!ano || !mes || !dia) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
  }).format(new Date(Date.UTC(ano, mes - 1, dia, 12)));
}

function getInfoSelecao(selecao) {
  const info = getSelecaoInfo(selecao);

  if (!info?.codigo) return null;

  return info;
}

function montarSelecoes(jogos) {
  const mapa = {};

  jogos.forEach((jogo) => {
    [nomeMandante(jogo), nomeVisitante(jogo)].forEach((selecao) => {
      const info = getInfoSelecao(selecao);

      if (!info) return;

      mapa[info.nomePt] = {
        id: info.nomePt,
        nome: info.nomePt,
        original: info.nomeOriginal,
      };
    });
  });

  return Object.values(mapa).sort((a, b) => a.nome.localeCompare(b.nome));
}

function jogoDaSelecao(jogo, nomeSelecao) {
  return [nomeMandante(jogo), nomeVisitante(jogo)].some(
    (selecao) => formatarSelecao(selecao) === nomeSelecao
  );
}

function contarClassificados(fases) {
  return Object.values(fases || {}).reduce((total, lista) => {
    if (!Array.isArray(lista)) return total;

    return total + lista.length;
  }, 0);
}

function contarPosicoesFinais(posicoes) {
  return Object.values(posicoes || {}).filter(Boolean).length;
}

function buscarPalpite(participante, jogoId) {
  return participante?.jogos?.find((jogo) => Number(jogo.jogo) === Number(jogoId));
}

function textoPontos(calculo, jogo) {
  if (!jogo?.encerrado) return "Pendente";
  if (!calculo) return "-";
  if (calculo.status === "mata_mata_por_fase") return "Por fase";
  if (calculo.status === "pendente") return "Pendente";
  if (calculo.status === "nao_preenchido") return "-";

  return `${calculo.pontos} pts`;
}

function BotoesVazioHoje({ onVoltarTodos, onVerPorDia }) {
  return (
    <div className="resultado-empty-actions">
      <button type="button" onClick={onVoltarTodos}>
        Ver todos
      </button>

      <button type="button" onClick={onVerPorDia}>
        Ver por dia
      </button>
    </div>
  );
}

function FiltrosRapidos({
  modoFiltro,
  busca,
  onBuscaChange,
  onSelecionarModo,
}) {
  return (
    <section className="card resultados-quick-card">
      <div className="resultados-quick-tabs">
        {FILTROS_RAPIDOS.map((filtro) => (
          <button
            key={filtro.id}
            type="button"
            className={modoFiltro === filtro.id ? "ativo" : ""}
            onClick={() => onSelecionarModo(filtro.id)}
          >
            {filtro.label}
          </button>
        ))}
      </div>

      {modoFiltro === "busca" && (
        <input
          type="search"
          value={busca}
          onChange={(event) => onBuscaChange(event.target.value)}
          placeholder="Jogo, seleção, grupo, fase ou data"
        />
      )}
    </section>
  );
}

function DiasCalendario({
  datas,
  dataSelecionada,
  contagemPorData,
  onSelecionarData,
}) {
  if (datas.length === 0) return null;

  return (
    <section className="card resultados-date-card">
      <div className="resultados-date-grid">
        {datas.map((data) => (
          <button
            key={data}
            type="button"
            className={dataSelecionada === data ? "ativo" : ""}
            onClick={() => onSelecionarData(data)}
          >
            <strong>{formatarDataCurta(data)}</strong>
            <span>{formatarDiaSemana(data)}</span>
            <small>{contagemPorData[data] || 0} jogo(s)</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function SelecoesGrid({
  selecoes,
  selecaoSelecionada,
  onSelecionarSelecao,
}) {
  return (
    <section className="card selecao-picker-card">
      <div className="selecao-picker-grid">
        {selecoes.map((selecao) => (
          <button
            key={selecao.id}
            type="button"
            className={selecaoSelecionada === selecao.nome ? "ativo" : ""}
            onClick={() => onSelecionarSelecao(selecao.nome)}
          >
            <TeamName selecao={selecao.nome} />
          </button>
        ))}
      </div>
    </section>
  );
}

function JogoCalendarioCard({ jogo, selecionado, onSelecionarJogo }) {
  const status = statusDoJogo(jogo);

  return (
    <button
      type="button"
      className={`resultado-game-card ${status} ${
        selecionado ? "selecionado" : ""
      }`}
      aria-pressed={selecionado}
      onClick={() => onSelecionarJogo(jogo.jogo)}
    >
      <span className="resultado-game-numero">Jogo {jogo.jogo}</span>

      <span className={`resultado-game-status ${status}`}>
        {textoStatusJogo(jogo)}
      </span>

      <span className="resultado-game-meta">
        {rotuloGrupo(jogo)} · {formatarAgendaJogo(jogo)}
      </span>

      <strong>
        <TeamName selecao={nomeMandante(jogo)} />
        <small>x</small>
        <TeamName selecao={nomeVisitante(jogo)} />
      </strong>
    </button>
  );
}

function JogosPorData({
  grupos,
  jogoSelecionado,
  onSelecionarJogo,
  modoFiltro,
  onVoltarTodos,
  onVerPorDia,
}) {
  if (grupos.length === 0) {
    return (
      <section className="card resultado-empty rapido">
        <strong>Nenhum jogo encontrado</strong>
        <span>
          {modoFiltro === "hoje"
            ? "Não há jogos hoje no calendário."
            : "Ajuste o filtro ou a busca."}
        </span>

        {modoFiltro === "hoje" && (
          <BotoesVazioHoje
            onVoltarTodos={onVoltarTodos}
            onVerPorDia={onVerPorDia}
          />
        )}
      </section>
    );
  }

  return (
    <section className="resultado-dia-lista">
      {grupos.map((grupo) => (
        <div key={grupo.data} className="resultado-dia-grupo">
          <div className="resultado-dia-header">
            <strong>{formatarDataBrasilia(grupo.data)}</strong>
            <span>{grupo.jogos.length} jogo(s)</span>
          </div>

          <div className="resultado-game-grid">
            {grupo.jogos.map((jogo) => (
              <JogoCalendarioCard
                key={jogo.jogo}
                jogo={jogo}
                selecionado={Number(jogoSelecionado?.jogo) === Number(jogo.jogo)}
                onSelecionarJogo={onSelecionarJogo}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function PainelJogoSelecionado({ jogo, ranking, onVoltarLista }) {
  if (!jogo) return null;

  const palpites = ranking.map((item) => {
    const palpite = buscarPalpite(item.dados, jogo.jogo);
    const calculo =
      palpite && jogo?.encerrado ? calcularPontuacaoJogo(palpite, jogo) : null;

    return {
      itemRanking: item,
      palpite,
      calculo,
    };
  });

  return (
    <section className="card jogo-consulta-card">
      <div className="jogo-consulta-head">
        <div>
          <span>Jogo {jogo.jogo}</span>
          <strong className="jogo-consulta-confronto">
            <TeamName selecao={nomeMandante(jogo)} />
            <small>x</small>
            <TeamName selecao={nomeVisitante(jogo)} />
          </strong>
        </div>

        <div className="jogo-consulta-actions">
          <em>{textoStatusJogo(jogo)}</em>
          <button type="button" onClick={onVoltarLista}>
            Trocar jogo
          </button>
        </div>
      </div>

      <div className="jogo-consulta-meta">
        <span>{rotuloGrupo(jogo)}</span>
        <span>{formatarAgendaJogo(jogo)}</span>
        <span>{resultadoOficialTexto(jogo)}</span>
      </div>

      {temPenaltis(jogo) && (
        <div className="resultado-penaltis">
          Pênaltis: {jogo.penaltis_a} x {jogo.penaltis_b}
        </div>
      )}

      {temPenaltisIgnorados(jogo) && (
        <div className="resultado-penaltis ignorado">
          Pênaltis informados, ignorados pela regra
        </div>
      )}

      <div className="jogo-palpite-lista">
        <div className="jogo-palpite-row cabecalho">
          <span>Pos.</span>
          <strong>Participante</strong>
          <em>Palpite</em>
          <small>Pontos</small>
        </div>

        {palpites.map(({ itemRanking, palpite, calculo }) => (
          <div key={itemRanking.participante} className="jogo-palpite-row">
            <span>{itemRanking.posicao}º</span>
            <strong>{itemRanking.participante}</strong>
            <em>{palpite ? placarComPenaltisTexto(palpite) : "-"}</em>
            <small>{textoPontos(calculo, jogo)}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function ComparativoSelecao({ selecao, jogos, ranking }) {
  if (!selecao || jogos.length === 0) return null;

  return (
    <section className="card selecao-comparativo-card">
      <div className="resultados-section-header compacto">
        <div>
          <p className="tag">Por seleção</p>
          <h2>{selecao}</h2>
        </div>

        <span>{jogos.length} jogo(s)</span>
      </div>

      <div className="selecao-comparativo-wrap">
        <table className="selecao-comparativo-table">
          <thead>
            <tr>
              <th>Pos.</th>
              <th>Participante</th>
              {jogos.map((jogo) => (
                <th key={jogo.jogo}>
                  J{jogo.jogo}
                  <small>{formatarAgendaJogo(jogo)}</small>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {ranking.map((item) => (
              <tr key={item.participante}>
                <td>{item.posicao}º</td>
                <td>{item.participante}</td>
                {jogos.map((jogo) => {
                  const palpite = buscarPalpite(item.dados, jogo.jogo);
                  const calculo = palpite && jogo?.encerrado
                    ? calcularPontuacaoJogo(palpite, jogo)
                    : null;

                  return (
                    <td key={`${item.participante}-${jogo.jogo}`}>
                      <span>{palpite ? placarComPenaltisTexto(palpite) : "-"}</span>
                      <small>{textoPontos(calculo, jogo)}</small>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ChaveamentoFase({ fase, jogos }) {
  const jogosDaFase = jogos.filter((jogo) => jogo.fase === fase.id);

  if (jogosDaFase.length === 0) return null;

  return (
    <section className="resultado-chaveamento-fase">
      <div className="resultado-chaveamento-fase-top">
        <h3>{fase.label}</h3>
        <span>{jogosDaFase.length} jogo(s)</span>
      </div>

      <div className="resultado-chaveamento-lista">
        {jogosDaFase.map((jogo) => (
          <div key={`chave-${jogo.jogo}`} className="resultado-chaveamento-item">
            <div>
              <span>Jogo {jogo.jogo}</span>
              <strong>{rotuloConfronto(jogo)}</strong>
            </div>

            <div>
              <TeamName selecao={nomeMandante(jogo)} />
              <small>x</small>
              <TeamName selecao={nomeVisitante(jogo)} />
            </div>

            <em>
              {formatarAgendaJogo(jogo)} · {jogo.sede || textoStatusJogo(jogo)}
            </em>
          </div>
        ))}
      </div>
    </section>
  );
}

function PosicaoFinalCard({ posicao, selecao }) {
  return (
    <section className={`resultado-final-card ${posicao.destaque}`}>
      <span>{posicao.label}</span>

      <strong>
        <TeamName selecao={selecao} />
      </strong>
    </section>
  );
}

export default function OfficialResults({
  participantes = [],
  resultadosOficiais,
  calendarioOficial = [],
}) {
  const resultadosTopRef = useRef(null);
  const listaJogosRef = useRef(null);
  const detalheJogoRef = useRef(null);

  const [modoFiltro, setModoFiltro] = useState("hoje");
  const [busca, setBusca] = useState("");
  const [dataSelecionada, setDataSelecionada] = useState(() =>
    getDataHojeBrasilia()
  );
  const [selecaoSelecionada, setSelecaoSelecionada] = useState("");
  const [jogoSelecionadoId, setJogoSelecionadoId] = useState("");

  const jogosPublicos = useMemo(
    () => montarJogosPublicos(resultadosOficiais, calendarioOficial),
    [resultadosOficiais, calendarioOficial]
  );

  const ranking = useMemo(() => {
    return calcularRanking(participantes, resultadosOficiais);
  }, [participantes, resultadosOficiais]);

  const selecoes = useMemo(() => montarSelecoes(jogosPublicos), [jogosPublicos]);
  const selecaoAtiva = selecaoSelecionada || selecoes[0]?.nome || "";
  const datasCalendario = useMemo(() => {
    return Array.from(
      new Set(jogosPublicos.map((jogo) => jogo.data).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
  }, [jogosPublicos]);

  const dataDiaAtiva = datasCalendario.includes(dataSelecionada)
    ? dataSelecionada
    : datasCalendario[0] || "";

  const contagemPorData = useMemo(() => {
    return jogosPublicos.reduce((mapa, jogo) => {
      if (!jogo.data) return mapa;

      mapa[jogo.data] = (mapa[jogo.data] || 0) + 1;
      return mapa;
    }, {});
  }, [jogosPublicos]);

  const jogosDaSelecao = useMemo(() => {
    if (!selecaoAtiva) return [];

    return jogosPublicos.filter((jogo) => jogoDaSelecao(jogo, selecaoAtiva));
  }, [jogosPublicos, selecaoAtiva]);

  const jogosFiltrados = useMemo(() => {
    if (modoFiltro === "hoje") {
      const hoje = getDataHojeBrasilia();
      return jogosPublicos.filter((jogo) => jogo.data === hoje);
    }

    if (modoFiltro === "dia") {
      return jogosPublicos.filter((jogo) => jogo.data === dataDiaAtiva);
    }

    if (modoFiltro === "selecao") {
      return jogosDaSelecao;
    }

    if (modoFiltro === "busca") {
      const termo = normalizarTexto(busca);
      return termo ? jogosPublicos.filter((jogo) => jogoEmBusca(jogo, termo)) : [];
    }

    return jogosPublicos;
  }, [busca, dataDiaAtiva, jogosDaSelecao, jogosPublicos, modoFiltro]);

  const jogoSelecionado = useMemo(() => {
    if (jogoSelecionadoId) {
      return (
        jogosPublicos.find(
          (jogo) => Number(jogo.jogo) === Number(jogoSelecionadoId)
        ) || null
      );
    }

    return null;
  }, [jogoSelecionadoId, jogosPublicos]);

  const gruposPorData = useMemo(
    () => agruparJogosPorData(jogosFiltrados),
    [jogosFiltrados]
  );

  const fasesOficiais = resultadosOficiais?.fases_oficiais || {};
  const posicoesFinais = resultadosOficiais?.posicoes_finais_oficiais || {};
  const jogosComResultado = resultadosOficiais?.jogos || [];
  const jogosEncerrados = jogosComResultado.filter((jogo) => jogo.encerrado).length;
  const jogosPendentes = jogosPublicos.filter((jogo) => !jogo.encerrado).length;
  const jogosMataMata = jogosPublicos.filter((jogo) => jogo.fase !== "grupos").length;
  const totalClassificados = contarClassificados(fasesOficiais);
  const totalPosicoesFinais = contarPosicoesFinais(posicoesFinais);

  function rolarPara(ref) {
    window.requestAnimationFrame(() => {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function selecionarModo(id) {
    setModoFiltro(id);
    setJogoSelecionadoId("");

    if (id === "dia" && !datasCalendario.includes(dataSelecionada)) {
      const hoje = getDataHojeBrasilia();
      const dataInicial = datasCalendario.includes(hoje)
        ? hoje
        : datasCalendario[0] || "";

      setDataSelecionada(dataInicial);
    }

    if (id !== "busca") {
      setBusca("");
    }

    rolarPara(resultadosTopRef);
  }

  function atualizarBusca(valor) {
    setBusca(valor);
    setJogoSelecionadoId("");
  }

  function selecionarSelecao(selecao) {
    setSelecaoSelecionada(selecao);
    setJogoSelecionadoId("");
    rolarPara(listaJogosRef);
  }

  function selecionarData(data) {
    setDataSelecionada(data);
    setJogoSelecionadoId("");
    rolarPara(listaJogosRef);
  }

  function selecionarJogo(jogoId) {
    setJogoSelecionadoId(jogoId);
    rolarPara(detalheJogoRef);
  }

  return (
    <div className="resultados-pro" ref={resultadosTopRef}>
      <section className="resultados-stats-grid">
        <div className="card resultados-stat">
          <span>{textoStatusGeral(resultadosOficiais?.status)}</span>
          <strong>{resultadosOficiais?.ultima_atualizacao || "-"}</strong>
        </div>

        <div className="card resultados-stat">
          <span>Calendário</span>
          <strong>{jogosPublicos.length}</strong>
        </div>

        <div className="card resultados-stat">
          <span>Resultados</span>
          <strong>{jogosComResultado.length}</strong>
        </div>

        <div className="card resultados-stat">
          <span>Encerrados</span>
          <strong>{jogosEncerrados}</strong>
        </div>

        <div className="card resultados-stat">
          <span>Pendentes</span>
          <strong>{jogosPendentes}</strong>
        </div>

        <div className="card resultados-stat">
          <span>Mata-mata</span>
          <strong>{jogosMataMata}</strong>
        </div>
      </section>

      <FiltrosRapidos
        modoFiltro={modoFiltro}
        busca={busca}
        onBuscaChange={atualizarBusca}
        onSelecionarModo={selecionarModo}
      />

      {modoFiltro === "dia" && (
        <DiasCalendario
          datas={datasCalendario}
          dataSelecionada={dataDiaAtiva}
          contagemPorData={contagemPorData}
          onSelecionarData={selecionarData}
        />
      )}

      {modoFiltro === "selecao" && (
        <SelecoesGrid
          selecoes={selecoes}
          selecaoSelecionada={selecaoAtiva}
          onSelecionarSelecao={selecionarSelecao}
        />
      )}

      <div className="resultados-list-anchor" ref={listaJogosRef}>
        <JogosPorData
          grupos={gruposPorData}
          jogoSelecionado={jogoSelecionado}
          onSelecionarJogo={selecionarJogo}
          modoFiltro={modoFiltro}
          onVoltarTodos={() => selecionarModo("todos")}
          onVerPorDia={() => selecionarModo("dia")}
        />
      </div>

      <div className="resultados-detail-anchor" ref={detalheJogoRef}>
        <PainelJogoSelecionado
          jogo={jogoSelecionado}
          ranking={ranking}
          onVoltarLista={() => rolarPara(listaJogosRef)}
        />
      </div>

      {modoFiltro === "selecao" && (
        <ComparativoSelecao
          selecao={selecaoAtiva}
          jogos={jogosDaSelecao}
          ranking={ranking}
        />
      )}

      <section className="resultados-stats-grid compacta">
        <div className="card resultados-stat">
          <span>Classificados</span>
          <strong>{totalClassificados}</strong>
        </div>

        <div className="card resultados-stat">
          <span>Finais</span>
          <strong>{totalPosicoesFinais}/4</strong>
        </div>
      </section>

      <section className="card resultados-section">
        <div className="resultados-section-header">
          <div>
            <p className="tag">Mata-mata</p>
            <h2>Chaveamento oficial</h2>
          </div>

          <span>{jogosMataMata} jogos no calendário</span>
        </div>

        <div className="resultado-chaveamento">
          {FASES_CHAVEAMENTO.map((fase) => (
            <ChaveamentoFase
              key={fase.id}
              fase={fase}
              jogos={jogosPublicos}
            />
          ))}
        </div>
      </section>

      <section className="card resultados-section">
        <div className="resultados-section-header">
          <div>
            <p className="tag">Classificados</p>
            <h2>Fases oficiais</h2>
          </div>

          <span>{totalClassificados} seleções</span>
        </div>

        <div className="resultado-classificados-resumo">
          {Object.entries(fasesOficiais).map(([fase, selecoesFase]) => (
            <div key={fase} className="resultado-classificados-resumo-card">
              <span>{formatarFase(fase)}</span>
              <strong>{Array.isArray(selecoesFase) ? selecoesFase.length : 0}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="card resultados-section">
        <div className="resultados-section-header">
          <div>
            <p className="tag">Decisão</p>
            <h2>Posições finais oficiais</h2>
          </div>

          <span>{totalPosicoesFinais} de 4</span>
        </div>

        <div className="resultado-finais-grid">
          {POSICOES_FINAIS.map((posicao) => (
            <PosicaoFinalCard
              key={posicao.id}
              posicao={posicao}
              selecao={posicoesFinais[posicao.id]}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
