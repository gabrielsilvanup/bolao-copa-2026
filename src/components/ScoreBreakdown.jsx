import { calcularPontuacaoParticipante } from "../utils/scoringUtils";
import { formatarFase } from "../utils/gameUtils";
import TeamName from "./TeamName";

const FASES = [
  "dezesseis_avos",
  "oitavas",
  "quartas",
  "semifinal",
  "final",
];

const POSICOES = [
  { chave: "campeao", label: "Campeão" },
  { chave: "vice", label: "Vice" },
  { chave: "terceiro", label: "3º lugar" },
  { chave: "quarto", label: "4º lugar" },
];

export default function ScoreBreakdown({ participante, resultadosOficiais }) {
  const resumo = calcularPontuacaoParticipante(
    participante,
    resultadosOficiais
  );

  return (
    <div className="card score-breakdown">
      <div className="tabela-topo">
        <div>
          <p className="tag">Detalhamento</p>
          <h2>Composição da pontuação</h2>
        </div>
      </div>

      <div className="breakdown-grid">
        <section>
          <h3>Avanço de fase</h3>

          <div className="breakdown-list">
            {FASES.map((fase) => {
              const item = resumo.fases[fase];

              return (
                <div key={fase} className="breakdown-item">
                  <span>{formatarFase(fase)}</span>
                  <strong>
                    {item?.acertos ?? 0} acertos — {item?.pontos ?? 0} pts
                  </strong>
                  <small>{item?.valorPorAcerto ?? 0} pts por seleção</small>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h3>Posições finais</h3>

          <div className="breakdown-list">
            {POSICOES.map((posicao) => {
              const item = resumo.posicoesFinais[posicao.chave];

              return (
                <div key={posicao.chave} className="breakdown-item">
                  <span>{posicao.label}</span>
                  <strong>{item?.pontos ?? 0} pts</strong>
                  <small className="linha-times">
                    Palpite: <TeamName selecao={item?.palpite} />
                  </small>
                  <small className="linha-times">
                    Oficial: <TeamName selecao={item?.oficial} />
                  </small>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}