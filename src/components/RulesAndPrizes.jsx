import { SCORING_RULES } from "../utils/scoringRules";

export default function RulesAndPrizes() {
  return (
    <div className="card regras-card">
      <div className="tabela-topo">
        <div>
          <p className="tag">Regulamento</p>
          <h2>Regras e premiação</h2>
        </div>
      </div>

      <div className="regras-grid">
        <section>
          <h3>Pontuação dos jogos</h3>

          <div className="regras-lista">
            <div>
              <span>Resultado correto</span>
              <strong>{SCORING_RULES.resultadoCorreto} pts</strong>
            </div>

            <div>
              <span>Placar exato</span>
              <strong>+{SCORING_RULES.placarExatoBonus} pts</strong>
            </div>
          </div>

          <p className="regras-observacao">
            O placar exato soma o bônus aos pontos do resultado correto.
          </p>
        </section>

        <section>
          <h3>Avanço de fase</h3>

          <div className="regras-lista">
            <div>
              <span>16 avos</span>
              <strong>{SCORING_RULES.fases.dezesseis_avos} pts</strong>
            </div>

            <div>
              <span>Oitavas</span>
              <strong>{SCORING_RULES.fases.oitavas} pts</strong>
            </div>

            <div>
              <span>Quartas</span>
              <strong>{SCORING_RULES.fases.quartas} pts</strong>
            </div>

            <div>
              <span>Semifinal</span>
              <strong>{SCORING_RULES.fases.semifinal} pts</strong>
            </div>

            <div>
              <span>Final</span>
              <strong>{SCORING_RULES.fases.final} pts</strong>
            </div>
          </div>

          <p className="regras-observacao">
            A pontuação por fase é por seleção classificada, independente da
            ordem.
          </p>
        </section>

        <section>
          <h3>Posições finais</h3>

          <div className="regras-lista">
            <div>
              <span>4º lugar</span>
              <strong>{SCORING_RULES.posicoesFinais.quarto} pts</strong>
            </div>

            <div>
              <span>3º lugar</span>
              <strong>{SCORING_RULES.posicoesFinais.terceiro} pts</strong>
            </div>

            <div>
              <span>Vice-campeão</span>
              <strong>{SCORING_RULES.posicoesFinais.vice} pts</strong>
            </div>

            <div>
              <span>Campeão</span>
              <strong>{SCORING_RULES.posicoesFinais.campeao} pts</strong>
            </div>
          </div>
        </section>

        <section>
          <h3>Premiação</h3>

          <div className="regras-lista">
            <div>
              <span>1º lugar</span>
              <strong>{SCORING_RULES.premiacao.primeiro}%</strong>
            </div>

            <div>
              <span>2º lugar</span>
              <strong>{SCORING_RULES.premiacao.segundo}%</strong>
            </div>

            <div>
              <span>3º lugar</span>
              <strong>{SCORING_RULES.premiacao.terceiro}%</strong>
            </div>

            <div>
              <span>4º lugar</span>
              <strong>{SCORING_RULES.premiacao.quarto}%</strong>
            </div>

            <div>
              <span>5º lugar</span>
              <strong>{SCORING_RULES.premiacao.quinto}%</strong>
            </div>

            <div>
              <span>Organização</span>
              <strong>{SCORING_RULES.premiacao.organizacao}%</strong>
            </div>
          </div>

          <p className="regras-observacao">
            Havendo empate na pontuação, o valor da premiação dos empatados será
            dividido entre eles.
          </p>
        </section>
      </div>
    </div>
  );
}