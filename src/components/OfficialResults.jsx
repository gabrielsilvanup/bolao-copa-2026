import { useMemo, useState } from "react";
import { formatarFase } from "../utils/gameUtils";
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

function criarMapaResultados(jogos) {
  return (jogos || []).reduce((mapa, jogo) => {
    mapa[Number(jogo.jogo)] = jogo;
    return mapa;
  }, {});
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
  const mapaResultados = criarMapaResultados(jogosComResultado);
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

export default function OfficialResults({ resultadosOficiais }) {
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
      <section className="card resultados-hero">
        <div>
          <p className="tag">Resultados oficiais</p>
          <h2>{textoStatusGeral(resultadosOficiais?.status)}</h2>
          <p>
            Central oficial dos placares, confrontos definidos, chaveamento,
            classificados e posições finais do bolão.
          </p>
        </div>

        <div className="resultados-hero-badge">
          <span>Última atualização</span>
          <strong>{resultadosOficiais?.ultima_atualizacao || "-"}</strong>
        </div>
      </section>

      <section className="resultados-stats-grid">
        <div className="card resultados-stat">
          <span>Jogos cadastrados</span>
          <strong>{jogosComResultado.length}</strong>
        </div>

        <div className="card resultados-stat">
          <span>Jogos encerrados</span>
          <strong>{jogosEncerrados}</strong>
        </div>

        <div className="card resultados-stat">
          <span>Confrontos definidos</span>
          <strong>{confrontosDefinidos}</strong>
        </div>

        <div className="card resultados-stat">
          <span>Posições finais</span>
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