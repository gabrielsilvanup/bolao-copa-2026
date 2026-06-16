import { calcularRanking } from "../utils/scoringUtils";
import {
  calcularTotalArrecadado,
  criarMapaPremiacao,
  formatarDinheiro,
  posicaoPremiacaoTexto,
} from "../utils/prizeUtils";
import { formatarFase } from "../utils/gameUtils";
import TeamName from "./TeamName";

const FASES = [
  "dezesseis_avos",
  "oitavas",
  "quartas",
  "semifinal",
  "final",
];

const POSICOES_FINAIS = [
  { chave: "campeao", label: "Campeão", classe: "ouro" },
  { chave: "vice", label: "Vice", classe: "prata" },
  { chave: "terceiro", label: "3º lugar", classe: "bronze" },
  { chave: "quarto", label: "4º lugar", classe: "neutro" },
];

function getMedalha(posicao, temPontos) {
  if (!temPontos) {
    return {
      classe: "neutra",
      icone: null,
      texto: `${posicao}º`,
    };
  }

  if (posicao === 1) {
    return {
      classe: "ouro",
      icone: "🥇",
      texto: "Ouro",
    };
  }

  if (posicao === 2) {
    return {
      classe: "prata",
      icone: "🥈",
      texto: "Prata",
    };
  }

  if (posicao === 3) {
    return {
      classe: "bronze",
      icone: "🥉",
      texto: "Bronze",
    };
  }

  return {
    classe: "neutra",
    icone: null,
    texto: `${posicao}º`,
  };
}

function textoEmpate(item) {
  if (!item?.empatado) return null;

  return `${item.totalEmpatados} empatados na posição`;
}

function buscarItemRanking(ranking, participante) {
  return ranking.find(
    (item) => item.participante === participante?.participante
  );
}

export default function ParticipantOverview({
  participante,
  participantes,
  resultadosOficiais,
}) {
  if (!participante) return null;

  const ranking = calcularRanking(participantes, resultadosOficiais);
  const itemRanking = buscarItemRanking(ranking, participante);

  const totalArrecadado = calcularTotalArrecadado(participantes.length);
  const mapaPremiacao = criarMapaPremiacao(ranking, totalArrecadado);
  const premio = mapaPremiacao[participante.participante];

  const rankingTemPontos = ranking.some((item) => item.resumo.total > 0);
  const medalha = getMedalha(itemRanking?.posicao || "-", rankingTemPontos);
  const resumo = itemRanking?.resumo;

  const temPremio = rankingTemPontos && premio && premio.valor > 0;
  const empate = textoEmpate(itemRanking);

  return (
    <div className="participante-pro">
      <section className={`card participante-hero ${medalha.classe}`}>
        <div className="participante-hero-main">
          <div className="participante-avatar">
            {medalha.icone ? <span>{medalha.icone}</span> : <span>🏆</span>}
          </div>

          <div>
            <p className="tag">Participante selecionado</p>
            <h2>{participante.participante}</h2>

            <div className="participante-meta">
              <span>{participante.status_extracao}</span>
              <span>{participante.arquivo_origem}</span>
            </div>
          </div>
        </div>

        <div className="participante-hero-stats">
          <div>
            <span>Posição</span>
            <strong>{itemRanking?.posicao ?? "-"}º</strong>
            {empate && <small>{empate}</small>}
          </div>

          <div>
            <span>Pontos</span>
            <strong>{resumo?.total ?? 0}</strong>
            <small>total geral</small>
          </div>

          <div>
            <span>Prêmio previsto</span>
            <strong>{temPremio ? formatarDinheiro(premio.valor) : "-"}</strong>
            {premio?.empatado && (
              <small>Faixa: {posicaoPremiacaoTexto(premio)}</small>
            )}
          </div>
        </div>
      </section>

      <section className="participante-score-grid">
        <div className="card participante-score-card destaque">
          <span>Total</span>
          <strong>{resumo?.total ?? 0}</strong>
          <small>pontos acumulados</small>
        </div>

        <div className="card participante-score-card">
          <span>Jogos</span>
          <strong>{resumo?.pontosJogos ?? 0}</strong>
          <small>fase de grupos</small>
        </div>

        <div className="card participante-score-card">
          <span>Fases</span>
          <strong>{resumo?.pontosFases ?? 0}</strong>
          <small>classificados</small>
        </div>

        <div className="card participante-score-card">
          <span>Finais</span>
          <strong>{resumo?.pontosPosicoesFinais ?? 0}</strong>
          <small>campeão, vice, 3º e 4º</small>
        </div>

        <div className="card participante-score-card">
          <span>Acertos</span>
          <strong>{resumo?.acertosResultado ?? 0}</strong>
          <small>resultado correto</small>
        </div>

        <div className="card participante-score-card">
          <span>Placares exatos</span>
          <strong>{resumo?.placaresExatos ?? 0}</strong>
          <small>bônus de placar</small>
        </div>
      </section>

      <section className="card participante-section">
        <div className="participante-section-header">
          <div>
            <p className="tag">Palpites finais</p>
            <h2>Caminho até o título</h2>
          </div>

          <span>Campeão, vice, 3º e 4º</span>
        </div>

        <div className="participante-finais-grid">
          {POSICOES_FINAIS.map((posicao) => (
            <div
              key={posicao.chave}
              className={`participante-final-card ${posicao.classe}`}
            >
              <span>{posicao.label}</span>

              <strong>
                <TeamName selecao={participante.posicoes_finais[posicao.chave]} />
              </strong>

              <small>
                Oficial:{" "}
                <TeamName
                  selecao={
                    resultadosOficiais?.posicoes_finais_oficiais?.[
                      posicao.chave
                    ]
                  }
                />
              </small>
            </div>
          ))}
        </div>
      </section>

      <section className="participante-detalhes-grid">
        <div className="card participante-section">
          <div className="participante-section-header">
            <div>
              <p className="tag">Avanço de fase</p>
              <h2>Acertos por fase</h2>
            </div>
          </div>

          <div className="participante-lista">
            {FASES.map((fase) => {
              const item = resumo?.fases?.[fase];

              return (
                <div key={fase} className="participante-lista-item">
                  <div>
                    <strong>{formatarFase(fase)}</strong>
                    <span>{item?.valorPorAcerto ?? 0} pts por seleção</span>
                  </div>

                  <div>
                    <strong>{item?.pontos ?? 0}</strong>
                    <span>{item?.acertos ?? 0} acertos</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card participante-section">
          <div className="participante-section-header">
            <div>
              <p className="tag">Posições finais</p>
              <h2>Pontuação decisiva</h2>
            </div>
          </div>

          <div className="participante-lista">
            {POSICOES_FINAIS.map((posicao) => {
              const item = resumo?.posicoesFinais?.[posicao.chave];

              return (
                <div key={posicao.chave} className="participante-lista-item">
                  <div>
                    <strong>{posicao.label}</strong>
                    <span>
                      Palpite: <TeamName selecao={item?.palpite} />
                    </span>
                  </div>

                  <div>
                    <strong>{item?.pontos ?? 0}</strong>
                    <span>{item?.acertou ? "Acertou" : "Pendente/errou"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}