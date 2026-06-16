import { useMemo } from "react";
import { calcularRanking } from "../utils/scoringUtils";

function normalizarTexto(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getIniciais(nome) {
  const partes = String(nome || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

function criarMapaRanking(participantes, resultadosOficiais) {
  if (!Array.isArray(participantes) || participantes.length === 0) {
    return {
      mapa: {},
      temPontuacao: false,
    };
  }

  if (!resultadosOficiais) {
    return {
      mapa: {},
      temPontuacao: false,
    };
  }

  try {
    const ranking = calcularRanking(participantes, resultadosOficiais);
    const temPontuacao = ranking.some((item) => item.resumo?.total > 0);

    const mapa = ranking.reduce((acc, item) => {
      acc[item.participante] = item;
      return acc;
    }, {});

    return {
      mapa,
      temPontuacao,
    };
  } catch {
    return {
      mapa: {},
      temPontuacao: false,
    };
  }
}

export default function ParticipantList({
  participantes = [],
  todosParticipantes = [],
  participanteSelecionado,
  busca = "",
  onBuscaChange,
  onSelecionarParticipante,
  resultadosOficiais,
}) {
  const baseRanking =
    Array.isArray(todosParticipantes) && todosParticipantes.length > 0
      ? todosParticipantes
      : participantes;

  const { mapa, temPontuacao } = useMemo(() => {
    return criarMapaRanking(baseRanking, resultadosOficiais);
  }, [baseRanking, resultadosOficiais]);

  const listaOrdenada = useMemo(() => {
    const lista = [...participantes];

    if (temPontuacao) {
      return lista.sort((a, b) => {
        const rankingA = mapa[a.participante];
        const rankingB = mapa[b.participante];

        const posicaoA = rankingA?.posicao ?? 9999;
        const posicaoB = rankingB?.posicao ?? 9999;

        if (posicaoA !== posicaoB) return posicaoA - posicaoB;

        const pontosA = rankingA?.resumo?.total ?? 0;
        const pontosB = rankingB?.resumo?.total ?? 0;

        if (pontosB !== pontosA) return pontosB - pontosA;

        return a.participante.localeCompare(b.participante);
      });
    }

    return lista.sort((a, b) =>
      a.participante.localeCompare(b.participante)
    );
  }, [participantes, mapa, temPontuacao]);

  const total = listaOrdenada.length;
  const termoBusca = normalizarTexto(busca);

  return (
    <aside className="card participant-picker">
      <div className="participant-picker-head">
        <div>
          <p className="tag">Participantes</p>
          <h2>Escolha uma pessoa</h2>
        </div>

        <span>{total}</span>
      </div>

      <div className="participant-picker-search">
        <input
          type="text"
          value={busca}
          onChange={(event) => onBuscaChange(event.target.value)}
          placeholder="Buscar participante..."
          aria-label="Buscar participante"
        />
      </div>

      <div className="participant-picker-list">
        {listaOrdenada.length === 0 && (
          <div className="participant-picker-empty">
            <strong>Nenhum participante encontrado</strong>
            <span>
              Não há resultado para “{busca}”.
            </span>
          </div>
        )}

        {listaOrdenada.map((participante) => {
          const selecionado =
            participanteSelecionado?.participante === participante.participante;

          const itemRanking = mapa[participante.participante];
          const pontos = itemRanking?.resumo?.total ?? 0;
          const posicao = itemRanking?.posicao;

          let detalhe = "Participante do bolão";

          if (temPontuacao && posicao) {
            detalhe = `${posicao}º lugar · ${pontos} pts`;
          }

          const nomeNormalizado = normalizarTexto(participante.participante);
          const destaqueBusca =
            termoBusca && nomeNormalizado.includes(termoBusca);

          return (
            <button
              key={participante.participante}
              type="button"
              className={
                selecionado
                  ? "participant-picker-item ativo"
                  : "participant-picker-item"
              }
              onClick={() => onSelecionarParticipante(participante)}
              title={participante.participante}
            >
              <span className="participant-picker-avatar">
                {getIniciais(participante.participante)}
              </span>

              <span className="participant-picker-info">
                <strong>{participante.participante}</strong>
                <small>{detalhe}</small>
              </span>

              {temPontuacao ? (
                <span className="participant-picker-rank">
                  {posicao ? `${posicao}º` : "-"}
                </span>
              ) : destaqueBusca ? (
                <span className="participant-picker-rank busca">✓</span>
              ) : (
                <span className="participant-picker-rank neutro">›</span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}