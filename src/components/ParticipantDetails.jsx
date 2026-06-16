import TeamName from "./TeamName";

export default function ParticipantDetails({ participante }) {
  if (!participante) return null;

  return (
    <div className="card cabecalho-participante">
      <div>
        <p className="tag">Participante selecionado</p>
        <h2>{participante.participante}</h2>
        <p className="arquivo">Origem: {participante.arquivo_origem}</p>
      </div>

      <div className="posicoes">
        <div>
          <span>Campeão</span>
          <strong>
            <TeamName selecao={participante.posicoes_finais.campeao} />
          </strong>
        </div>

        <div>
          <span>Vice</span>
          <strong>
            <TeamName selecao={participante.posicoes_finais.vice} />
          </strong>
        </div>

        <div>
          <span>3º lugar</span>
          <strong>
            <TeamName selecao={participante.posicoes_finais.terceiro} />
          </strong>
        </div>

        <div>
          <span>4º lugar</span>
          <strong>
            <TeamName selecao={participante.posicoes_finais.quarto} />
          </strong>
        </div>
      </div>
    </div>
  );
}