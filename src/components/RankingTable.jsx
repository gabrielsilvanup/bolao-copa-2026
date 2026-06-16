import { useMemo, useState } from "react";
import { calcularRanking } from "../utils/scoringUtils";
import {
  calcularTotalArrecadado,
  criarMapaPremiacao,
  formatarDinheiro,
  posicaoPremiacaoTexto,
} from "../utils/prizeUtils";

function normalizarTexto(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function classeMedalha(posicao, rankingTemPontos) {
  if (!rankingTemPontos) return "neutro";
  if (posicao === 1) return "ouro";
  if (posicao === 2) return "prata";
  if (posicao === 3) return "bronze";

  return "neutro";
}

function textoMedalha(posicao, rankingTemPontos) {
  if (!rankingTemPontos) return `${posicao}º`;
  if (posicao === 1) return "🥇";
  if (posicao === 2) return "🥈";
  if (posicao === 3) return "🥉";

  return `${posicao}º`;
}

function contarJogosEncerrados(resultadosOficiais) {
  return (resultadosOficiais?.jogos || []).filter((jogo) => jogo.encerrado)
    .length;
}

function contarFasesComClassificados(resultadosOficiais) {
  return Object.values(resultadosOficiais?.fases_oficiais || {}).reduce(
    (total, lista) => {
      if (!Array.isArray(lista)) return total;

      return total + lista.length;
    },
    0
  );
}

function contarPosicoesFinais(resultadosOficiais) {
  return Object.values(resultadosOficiais?.posicoes_finais_oficiais || {}).filter(
    Boolean
  ).length;
}

function ativarComTeclado(event, onSelecionar) {
  if (event.key !== "Enter" && event.key !== " ") return;

  event.preventDefault();
  onSelecionar?.();
}

function RankingPodiumCard({
  item,
  premio,
  rankingTemPontos,
  onSelecionar,
}) {
  if (!item) return null;

  const classe = classeMedalha(item.posicao, rankingTemPontos);
  const temPremio = rankingTemPontos && premio && premio.valor > 0;
  const clicavel = Boolean(onSelecionar);

  return (
    <article
      className={`ranking-podium-card ${classe}`}
      onClick={onSelecionar}
      onKeyDown={(event) => ativarComTeclado(event, onSelecionar)}
      role={clicavel ? "button" : undefined}
      tabIndex={clicavel ? 0 : undefined}
    >
      <div className="ranking-podium-medal">
        {textoMedalha(item.posicao, rankingTemPontos)}
      </div>

      <div>
        <span>{item.posicao}º lugar</span>
        <h3>{item.participante}</h3>

        {item.empatado && (
          <small>{item.totalEmpatados} empatados nesta posição</small>
        )}
      </div>

      <div className="ranking-podium-score">
        <strong>{item.resumo.total}</strong>
        <span>pontos</span>
      </div>

      <div className="ranking-podium-prize">
        <span>Prêmio previsto</span>
        <strong>{temPremio ? formatarDinheiro(premio.valor) : "-"}</strong>
      </div>
    </article>
  );
}

function RankingRow({
  item,
  premio,
  rankingTemPontos,
  onSelecionar,
}) {
  const classe = classeMedalha(item.posicao, rankingTemPontos);
  const temPremio = rankingTemPontos && premio && premio.valor > 0;
  const clicavel = Boolean(onSelecionar);
  const classes = [
    "linha-ranking",
    classe,
    item.empatado ? "empatado" : "",
    temPremio ? "premiado" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <tr
      className={classes}
      onClick={onSelecionar}
      onKeyDown={(event) => ativarComTeclado(event, onSelecionar)}
      role={clicavel ? "button" : undefined}
      tabIndex={clicavel ? 0 : undefined}
    >
      <td>
        <div className={`ranking-position-chip ${classe}`}>
          <span>{textoMedalha(item.posicao, rankingTemPontos)}</span>
        </div>
      </td>

      <td>
        <div className="ranking-participante-cell">
          <strong>{item.participante}</strong>

          <span>
            {item.empatado
              ? `${item.totalEmpatados} empatados na posição`
              : "Posição isolada"}
          </span>

          <div className="ranking-row-badges">
            {temPremio && <small className="ranking-badge premio">Premiação</small>}
            {item.empatado && <small className="ranking-badge empate">Empate</small>}
          </div>
        </div>
      </td>

      <td>
        <strong className="ranking-number principal">
          {item.resumo.total}
        </strong>
      </td>

      <td>
        <span className="ranking-number">{item.resumo.pontosJogos}</span>
      </td>

      <td>
        <span className="ranking-number">{item.resumo.pontosFases}</span>
      </td>

      <td>
        <span className="ranking-number">
          {item.resumo.pontosPosicoesFinais}
        </span>
      </td>

      <td>
        <span className="ranking-number">{item.resumo.acertosResultado}</span>
      </td>

      <td>
        <span className="ranking-number">{item.resumo.placaresExatos}</span>
      </td>

      <td>
        <div className="ranking-premio-cell">
          <strong>{temPremio ? formatarDinheiro(premio.valor) : "-"}</strong>

          {temPremio && premio?.empatado && (
            <span>{posicaoPremiacaoTexto(premio)}</span>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function RankingTable({
  participantes,
  resultadosOficiais,
  onSelecionarParticipante,
}) {
  const [busca, setBusca] = useState("");

  const ranking = useMemo(() => {
    return calcularRanking(participantes, resultadosOficiais);
  }, [participantes, resultadosOficiais]);

  const rankingTemPontos = ranking.some((item) => item.resumo.total > 0);

  const totalArrecadado = calcularTotalArrecadado(participantes.length);
  const mapaPremiacao = criarMapaPremiacao(ranking, totalArrecadado);
  const participantesPorNome = useMemo(() => {
    return participantes.reduce((mapa, participante) => {
      mapa[participante.participante] = participante;
      return mapa;
    }, {});
  }, [participantes]);

  const jogosEncerrados = contarJogosEncerrados(resultadosOficiais);
  const classificadosLancados = contarFasesComClassificados(resultadosOficiais);
  const posicoesFinaisLancadas = contarPosicoesFinais(resultadosOficiais);

  const lider = ranking[0];
  const pontosLider = lider?.resumo?.total || 0;

  const podium = ranking.filter((item) => item.posicao <= 3);

  const rankingFiltrado = useMemo(() => {
    const termo = normalizarTexto(busca);

    if (!termo) return ranking;

    return ranking.filter((item) =>
      normalizarTexto(item.participante).includes(termo)
    );
  }, [ranking, busca]);

  function selecionarParticipanteRanking(nome) {
    const participante = participantesPorNome[nome];

    if (!participante) return;

    onSelecionarParticipante?.(participante);
  }

  return (
    <div className="ranking-pro">
      <section className="card ranking-pro-header">
        <div>
          <p className="tag">Classificação geral</p>
          <h2>Ranking do Bolão</h2>
          <p>
            Pontuação atualizada automaticamente com placares, avanço de fase,
            chaveamento e posições finais oficiais. Empates permanecem
            empatados e dividem as faixas de premiação ocupadas.
          </p>
        </div>

        <div className="ranking-pro-stats">
          <div>
            <span>Líder</span>
            <strong>{rankingTemPontos ? lider?.participante : "-"}</strong>
          </div>

          <div>
            <span>Pontos do líder</span>
            <strong>{rankingTemPontos ? pontosLider : "-"}</strong>
          </div>

          <div>
            <span>Jogos encerrados</span>
            <strong>{jogosEncerrados}</strong>
          </div>

          <div>
            <span>Prêmio total</span>
            <strong>{formatarDinheiro(totalArrecadado)}</strong>
          </div>
        </div>
      </section>

      {!rankingTemPontos && (
        <section className="card ranking-alerta">
          <strong>Ranking ainda zerado</strong>
          <span>
            A classificação começará a mudar quando os primeiros resultados
            oficiais forem cadastrados no Admin. A premiação prevista só será
            exibida quando houver pontuação real.
          </span>
        </section>
      )}

      <section className="ranking-status-grid">
        <div className="card ranking-status-card">
          <span>Participantes</span>
          <strong>{participantes.length}</strong>
        </div>

        <div className="card ranking-status-card">
          <span>Classificados lançados</span>
          <strong>{classificadosLancados}</strong>
        </div>

        <div className="card ranking-status-card">
          <span>Posições finais</span>
          <strong>{posicoesFinaisLancadas}/4</strong>
        </div>

        <div className="card ranking-status-card">
          <span>Última atualização</span>
          <strong>{resultadosOficiais?.ultima_atualizacao || "-"}</strong>
        </div>
      </section>

      {rankingTemPontos && podium.length > 0 && (
        <section className="ranking-podium">
          {podium.map((item) => (
            <RankingPodiumCard
              key={item.participante}
              item={item}
              premio={mapaPremiacao[item.participante]}
              rankingTemPontos={rankingTemPontos}
              onSelecionar={() => selecionarParticipanteRanking(item.participante)}
            />
          ))}
        </section>
      )}

      <section className="card ranking-card">
        <div className="ranking-table-header">
          <div>
            <p className="tag">Tabela completa</p>
            <h2>Classificação dos participantes</h2>
          </div>

          <input
            type="text"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar participante..."
          />
        </div>

        <div className="ranking-table-wrap">
          <table className="ranking-table">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Participante</th>
                <th>Total</th>
                <th>Jogos</th>
                <th>Fases</th>
                <th>Finais</th>
                <th>Acertos</th>
                <th>Exatos</th>
                <th>Prêmio</th>
              </tr>
            </thead>

            <tbody>
              {rankingFiltrado.map((item) => (
                <RankingRow
                  key={item.participante}
                  item={item}
                  premio={mapaPremiacao[item.participante]}
                  rankingTemPontos={rankingTemPontos}
                  onSelecionar={() =>
                    selecionarParticipanteRanking(item.participante)
                  }
                />
              ))}
            </tbody>
          </table>
        </div>

        {rankingFiltrado.length === 0 && (
          <div className="ranking-empty">
            <strong>Nenhum participante encontrado</strong>
            <span>Altere a busca para visualizar o ranking.</span>
          </div>
        )}
      </section>
    </div>
  );
}
