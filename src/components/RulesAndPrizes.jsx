import { SCORING_RULES } from "../utils/scoringRules";

const FASES = [
  { label: "16 avos", valor: SCORING_RULES.fases.dezesseis_avos },
  { label: "Oitavas", valor: SCORING_RULES.fases.oitavas },
  { label: "Quartas", valor: SCORING_RULES.fases.quartas },
  { label: "Semifinal", valor: SCORING_RULES.fases.semifinal },
  { label: "Final", valor: SCORING_RULES.fases.final },
];

const POSICOES_FINAIS = [
  { label: "4º lugar", valor: SCORING_RULES.posicoesFinais.quarto },
  { label: "3º lugar", valor: SCORING_RULES.posicoesFinais.terceiro },
  { label: "Vice", valor: SCORING_RULES.posicoesFinais.vice },
  { label: "Campeão", valor: SCORING_RULES.posicoesFinais.campeao },
];

const PREMIACAO = [
  { label: "1º lugar", valor: SCORING_RULES.premiacao.primeiro },
  { label: "2º lugar", valor: SCORING_RULES.premiacao.segundo },
  { label: "3º lugar", valor: SCORING_RULES.premiacao.terceiro },
  { label: "4º lugar", valor: SCORING_RULES.premiacao.quarto },
  { label: "5º lugar", valor: SCORING_RULES.premiacao.quinto },
  { label: "Organização", valor: SCORING_RULES.premiacao.organizacao },
];

function ListaRegras({ itens, sufixo }) {
  return (
    <div className="regras-lista">
      {itens.map((item) => (
        <div key={item.label}>
          <span>{item.label}</span>
          <strong>
            {item.valor}
            {sufixo}
          </strong>
        </div>
      ))}
    </div>
  );
}

export default function RulesAndPrizes() {
  return (
    <div className="card regras-card">
      <div className="tabela-topo regras-topo">
        <div>
          <p className="tag">Regulamento</p>
          <h2>Regras e premiação</h2>
        </div>

        <span>Sem critério de desempate</span>
      </div>

      <div className="regras-intro-grid">
        <div>
          <strong>Fase de grupos</strong>
          <span>resultado e placar</span>
        </div>

        <div>
          <strong>Pós-grupos</strong>
          <span>seleções classificadas</span>
        </div>

        <div>
          <strong>Empates</strong>
          <span>mesma posição real</span>
        </div>

        <div>
          <strong>Premiação</strong>
          <span>faixas somadas e divididas</span>
        </div>
      </div>

      <div className="regras-grid">
        <section className="regras-bloco destaque">
          <h3>Grupos</h3>

          <ListaRegras
            itens={[
              {
                label: "Resultado correto",
                valor: SCORING_RULES.resultadoCorreto,
              },
              {
                label: "Placar exato",
                valor: `+${SCORING_RULES.placarExatoBonus}`,
              },
            ]}
            sufixo=" pts"
          />

          <p className="regras-observacao">
            Resultado + placar exato.
          </p>
        </section>

        <section className="regras-bloco">
          <h3>Pós-grupos</h3>

          <ListaRegras itens={FASES} sufixo=" pts" />

          <p className="regras-observacao">
            Mata-mata pontua só por seleção classificada.
          </p>
        </section>

        <section className="regras-bloco">
          <h3>Posições finais</h3>

          <ListaRegras itens={POSICOES_FINAIS} sufixo=" pts" />

          <p className="regras-observacao">
            Pontuação extra no fim da Copa.
          </p>
        </section>

        <section className="regras-bloco">
          <h3>Prêmio</h3>

          <ListaRegras itens={PREMIACAO} sufixo="%" />

          <p className="regras-observacao">
            Empatados dividem as faixas ocupadas.
          </p>
        </section>
      </div>
    </div>
  );
}
