import { calcularPontuacaoParticipante } from "../utils/scoringUtils";

export default function ScoreSummary({ participante, resultadosOficiais }) {
  const resumo = calcularPontuacaoParticipante(
    participante,
    resultadosOficiais
  );

  return (
    <div className="card score-summary">
      <div>
        <p className="tag">Pontuação</p>
        <h2>{resumo.total} pontos</h2>
        <p>
          Soma de jogos da fase de grupos, avanço de fase e posições finais.
        </p>
      </div>

      <div className="score-grid">
        <div>
          <span>Pontos em jogos</span>
          <strong>{resumo.pontosJogos}</strong>
        </div>

        <div>
          <span>Pontos por fases</span>
          <strong>{resumo.pontosFases}</strong>
        </div>

        <div>
          <span>Posições finais</span>
          <strong>{resumo.pontosPosicoesFinais}</strong>
        </div>

        <div>
          <span>Jogos encerrados</span>
          <strong>{resumo.jogosEncerrados}</strong>
        </div>

        <div>
          <span>Jogos pontuados</span>
          <strong>{resumo.jogosPontuados}</strong>
        </div>

        <div>
          <span>Acertos de resultado</span>
          <strong>{resumo.acertosResultado}</strong>
        </div>

        <div>
          <span>Placares exatos</span>
          <strong>{resumo.placaresExatos}</strong>
        </div>
      </div>
    </div>
  );
}