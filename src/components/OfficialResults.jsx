import { useMemo, useState } from "react";
import { formatarFase } from "../utils/gameUtils";
import {
  calcularPontuacaoJogo,
  calcularRanking,
} from "../utils/scoringUtils";
import TeamName from "./TeamName";

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
  { id: "encerrados", label: "Encerrados" },
  { id: "definidos", label: "Confrontos definidos" },
  { id: "aguardando", label: "Aguardando" },
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
    jogo.gols_a !== null &&
    jogo.gols_a !== undefined &&
    jogo.gols_b !== null &&
    jogo.gols_b !== undefined
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

function temPenaltis(jogo) {
  return (
    jogo.gols_a !== null &&
    jogo.gols_b !== null &&
    jogo.gols_a === jogo.gols_b &&
    jogo.penaltis_a !== null &&
    jogo.penaltis_a !== undefined &&
    jogo.penaltis_b !== null &&
    jogo.penaltis_b !== undefined
  );
}

function temPenaltisPreenchidos(jogo) {
  return (
    jogo.penaltis_a !== null &&
    jogo.penaltis_a !== undefined &&
    jogo.penaltis_b !== null &&
    jogo.penaltis_b !== undefined
  );
}

function temPenaltisIgnorados(jogo) {
  return (
    jogoTemPlacar(jogo) &&
    jogo.gols_a !== jogo.gols_b &&
    temPenaltisPreenchidos(jogo)
  );
}

function confrontoDefinido(jogo) {
  return Boolean(jogo?.selecao_a && jogo?.selecao_b);
}

function statusDoJogo(jogo) {
  if (jogo.encerrado) return "encerrado";
  if (confrontoDefinido(jogo)) return "definido";

  return "aguardando";
}

function textoStatusJogo(jogo) {
  const status = statusDoJogo(jogo);

  if (status === "encerrado") return "Encerrado";
  if (status === "definido") return "Confronto definido";

  return "Aguardando";
}

function vencedorTexto(jogo) {
  if (!jogo.encerrado) return textoStatusJogo(jogo);

  if (jogo.resultado_oficial === "EMPATE" && !jogo.vencedor_oficial) {
    return "Empate";
  }

  return jogo.vencedor_oficial || "Não informado";
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

function montarJogosPublicos(resultadosOficiais) {
  const jogosComResultado = resultadosOficiais?.jogos || [];
  const jogosChaveamento = getChaveamentoLista(resultadosOficiais);

  const mapaFinal = {};

  jogosChaveamento.forEach((jogo) => {
    mapaFinal[Number(jogo.jogo)] = jogo;
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

function contarClassificados(fases) {
  return Object.values(fases || {}).reduce((total, lista) => {
    if (!Array.isArray(lista)) return total;

    return total + lista.length;
  }, 0);
}

function contarPosicoesFinais(posicoes) {
  return Object.values(posicoes || {}).filter(Boolean).length;
}

function ResultadoMatchCard({ jogo }) {
  const status = statusDoJogo(jogo);
  const vencedor = vencedorTexto(jogo);

  return (
    <article className={`resultado-match-card ${status}`}>
      <div className="resultado-match-top">
        <div>
          <span>Jogo {jogo.jogo}</span>
          <strong>
            {formatarFase(jogo.fase)}
            {jogo.slot_a && jogo.slot_b ? ` · ${jogo.slot_a} x ${jogo.slot_b}` : ""}
          </strong>
        </div>

        <div className={`resultado-status-pill ${status}`}>
          {textoStatusJogo(jogo)}
        </div>
      </div>

      <div className="resultado-scoreboard">
        <div className="resultado-team-row">
          <TeamName selecao={jogo.selecao_a} />
          <strong>{jogoTemPlacar(jogo) ? jogo.gols_a : "-"}</strong>
        </div>

        <div className="resultado-team-row">
          <TeamName selecao={jogo.selecao_b} />
          <strong>{jogoTemPlacar(jogo) ? jogo.gols_b : "-"}</strong>
        </div>
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

      <div className="resultado-match-footer">
        <span>Placar</span>
        <strong>{placarTexto(jogo)}</strong>
      </div>

      <div className="resultado-vencedor">
        <span>{jogo.encerrado ? "Vencedor" : "Situação"}</span>
        <strong>
          {vencedor === "Empate" ||
          vencedor === "Confronto definido" ||
          vencedor === "Aguardando" ||
          vencedor === "Não informado" ? (
            vencedor
          ) : (
            <TeamName selecao={vencedor} />
          )}
        </strong>
      </div>
    </article>
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
              <strong>
                {jogo.slot_a && jogo.slot_b
                  ? `${jogo.slot_a} x ${jogo.slot_b}`
                  : formatarFase(jogo.fase)}
              </strong>
            </div>

            <div>
              <TeamName selecao={jogo.selecao_a} />
              <small>x</small>
              <TeamName selecao={jogo.selecao_b} />
            </div>

            <em>{textoStatusJogo(jogo)}</em>
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

function rotuloJogoConsulta(jogo) {
  const selecaoA = jogo.selecao_a || jogo.slot_a || "A definir";
  const selecaoB = jogo.selecao_b || jogo.slot_b || "A definir";

  return `Jogo ${jogo.jogo} - ${selecaoA} x ${selecaoB}`;
}

function pontosConsultaTexto(calculo) {
  if (!calculo) return "-";
  if (calculo.status === "mata_mata_por_fase") return "fase";
  if (calculo.status === "pendente") return "-";
  if (calculo.status === "nao_preenchido") return "-";

  return calculo.pontos;
}

function ConsultaJogo({
  participantes,
  resultadosOficiais,
  jogosPublicos,
}) {
  const [jogoSelecionadoId, setJogoSelecionadoId] = useState("");

  const ranking = useMemo(() => {
    return calcularRanking(participantes, resultadosOficiais);
  }, [participantes, resultadosOficiais]);

  const jogoSelecionado = useMemo(() => {
    const id = Number(jogoSelecionadoId);

    if (id) {
      return jogosPublicos.find((jogo) => Number(jogo.jogo) === id) || null;
    }

    return jogosPublicos[0] || null;
  }, [jogosPublicos, jogoSelecionadoId]);

  const palpites = useMemo(() => {
    if (!jogoSelecionado) return [];

    return ranking.map((item) => {
      const palpite = item.dados.jogos.find(
        (jogo) => Number(jogo.jogo) === Number(jogoSelecionado.jogo)
      );

      const calculo = palpite
        ? calcularPontuacaoJogo(palpite, jogoSelecionado)
        : null;

      return {
        itemRanking: item,
        palpite,
        calculo,
      };
    });
  }, [ranking, jogoSelecionado]);

  return (
    <section className="card consulta-jogo-card">
      <div className="consulta-jogo-top">
        <div>
          <p className="tag">Consulta por jogo</p>
          <h2>Palpites do jogo</h2>
        </div>

        <select
          value={jogoSelecionado?.jogo || ""}
          onChange={(event) => setJogoSelecionadoId(event.target.value)}
        >
          {jogosPublicos.map((jogo) => (
            <option key={jogo.jogo} value={jogo.jogo}>
              {rotuloJogoConsulta(jogo)}
            </option>
          ))}
        </select>
      </div>

      {jogoSelecionado ? (
        <>
          <div className="consulta-jogo-score">
            <span>Jogo {jogoSelecionado.jogo}</span>
            <strong>
              <TeamName selecao={jogoSelecionado.selecao_a} />{" "}
              {placarComPenaltisTexto(jogoSelecionado)}{" "}
              <TeamName selecao={jogoSelecionado.selecao_b} />
            </strong>
            <em>{formatarFase(jogoSelecionado.fase)}</em>
          </div>

          <div className="consulta-palpite-lista">
            {palpites.map(({ itemRanking, palpite, calculo }) => (
              <div key={itemRanking.participante} className="consulta-palpite-row">
                <span className="consulta-posicao">{itemRanking.posicao}º</span>

                <strong>{itemRanking.participante}</strong>

                <span className="consulta-palpite-placar">
                  {palpite ? placarComPenaltisTexto(palpite) : "-"}
                </span>

                <span className="consulta-oficial">
                  {placarComPenaltisTexto(jogoSelecionado)}
                </span>

                <em>{pontosConsultaTexto(calculo)}</em>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="resultado-empty">
          <strong>Nenhum jogo disponível</strong>
          <span>Cadastre resultados ou gere o chaveamento oficial.</span>
        </div>
      )}
    </section>
  );
}

export default function OfficialResults({
  participantes = [],
  resultadosOficiais,
}) {
  const [faseSelecionada, setFaseSelecionada] = useState("todos");
  const [statusSelecionado, setStatusSelecionado] = useState("todos");
  const [busca, setBusca] = useState("");

  const jogosPublicos = useMemo(
    () => montarJogosPublicos(resultadosOficiais),
    [resultadosOficiais]
  );

  const fasesOficiais = resultadosOficiais?.fases_oficiais || {};
  const posicoesFinais = resultadosOficiais?.posicoes_finais_oficiais || {};

  const jogosComResultado = resultadosOficiais?.jogos || [];
  const jogosEncerrados = jogosComResultado.filter((jogo) => jogo.encerrado).length;
  const jogosPendentes = jogosPublicos.filter(
    (jogo) => statusDoJogo(jogo) !== "encerrado"
  ).length;
  const confrontosDefinidos = jogosPublicos.filter(confrontoDefinido).length;
  const totalClassificados = contarClassificados(fasesOficiais);
  const totalPosicoesFinais = contarPosicoesFinais(posicoesFinais);

  const jogosFiltrados = useMemo(() => {
    const termo = normalizarTexto(busca);

    return jogosPublicos.filter((jogo) => {
      const status = statusDoJogo(jogo);

      if (faseSelecionada !== "todos" && jogo.fase !== faseSelecionada) {
        return false;
      }

      if (statusSelecionado === "encerrados" && status !== "encerrado") {
        return false;
      }

      if (statusSelecionado === "definidos" && status !== "definido") {
        return false;
      }

      if (statusSelecionado === "aguardando" && status !== "aguardando") {
        return false;
      }

      if (!termo) return true;

      const conteudo = normalizarTexto(
        `${jogo.jogo} ${jogo.fase} ${jogo.slot_a || ""} ${
          jogo.slot_b || ""
        } ${jogo.selecao_a || ""} ${jogo.selecao_b || ""} ${
          jogo.vencedor_oficial || ""
        }`
      );

      return conteudo.includes(termo);
    });
  }, [jogosPublicos, faseSelecionada, statusSelecionado, busca]);

  return (
    <div className="resultados-pro">
      <section className="resultados-stats-grid">
        <div className="card resultados-stat">
          <span>{textoStatusGeral(resultadosOficiais?.status)}</span>
          <strong>{resultadosOficiais?.ultima_atualizacao || "-"}</strong>
        </div>

        <div className="card resultados-stat">
          <span>Cadastrados</span>
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
          <span>Definidos</span>
          <strong>{confrontosDefinidos}</strong>
        </div>
      </section>

      <ConsultaJogo
        participantes={participantes}
        resultadosOficiais={resultadosOficiais}
        jogosPublicos={jogosPublicos}
      />

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
            <p className="tag">Placares e confrontos</p>
            <h2>Jogos oficiais</h2>
          </div>

          <span>{jogosFiltrados.length} jogo(s)</span>
        </div>

        <div className="resultados-filtros">
          <input
            type="text"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar jogo, seleção, fase ou slot..."
          />

          <div className="resultados-filtro-grupo">
            {FILTROS_FASE.map((filtro) => (
              <button
                key={filtro.id}
                type="button"
                className={faseSelecionada === filtro.id ? "ativo" : ""}
                onClick={() => setFaseSelecionada(filtro.id)}
              >
                {filtro.label}
              </button>
            ))}
          </div>

          <div className="resultados-filtro-grupo status">
            {FILTROS_STATUS.map((filtro) => (
              <button
                key={filtro.id}
                type="button"
                className={statusSelecionado === filtro.id ? "ativo" : ""}
                onClick={() => setStatusSelecionado(filtro.id)}
              >
                {filtro.label}
              </button>
            ))}
          </div>
        </div>

        {jogosFiltrados.length === 0 ? (
          <div className="resultado-empty">
            <strong>Nenhum jogo encontrado</strong>
            <span>
              Cadastre placares no Admin, gere o chaveamento ou ajuste os
              filtros de busca.
            </span>
          </div>
        ) : (
          <div className="resultado-matches-grid">
            {jogosFiltrados.map((jogo) => (
              <ResultadoMatchCard key={jogo.jogo} jogo={jogo} />
            ))}
          </div>
        )}
      </section>

      <section className="card resultados-section">
        <div className="resultados-section-header">
          <div>
            <p className="tag">Mata-mata</p>
            <h2>Chaveamento oficial</h2>
          </div>

          <span>{confrontosDefinidos} confrontos definidos</span>
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
          {Object.entries(fasesOficiais).map(([fase, selecoes]) => (
            <div key={fase} className="resultado-classificados-resumo-card">
              <span>{formatarFase(fase)}</span>
              <strong>{Array.isArray(selecoes) ? selecoes.length : 0}</strong>
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
