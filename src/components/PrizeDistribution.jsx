import { calcularRanking } from "../utils/scoringUtils";
import {
  VALOR_POR_PARTICIPANTE,
  calcularPremiacaoComEmpate,
  calcularTotalArrecadado,
  calcularValorOrganizacao,
  calcularValorPremiacao,
  formatarDinheiro,
  posicaoPremiacaoTexto,
} from "../utils/prizeUtils";

export default function PrizeDistribution({
  participantes,
  resultadosOficiais,
}) {
  const totalParticipantes = participantes.length;
  const totalArrecadado = calcularTotalArrecadado(totalParticipantes);
  const valorOrganizacao = calcularValorOrganizacao(totalArrecadado);
  const valorPremiacao = calcularValorPremiacao(totalArrecadado);

  const premiacao = calcularPremiacaoComEmpate(
    calcularRanking(participantes, resultadosOficiais),
    totalArrecadado
  );

  const premiados = premiacao.filter((item) => item.valor > 0);

  return (
    <div className="card premio-card">
      <div className="tabela-topo">
        <div>
          <p className="tag">Premiação</p>
          <h2>Distribuição automática</h2>
        </div>

        <span>R$ {VALOR_POR_PARTICIPANTE},00 por participante</span>
      </div>

      <div className="premio-body">
        <div className="premio-resumo-grid">
          <div>
            <span>Participantes</span>
            <strong>{totalParticipantes}</strong>
          </div>

          <div>
            <span>Total arrecadado</span>
            <strong>{formatarDinheiro(totalArrecadado)}</strong>
          </div>

          <div>
            <span>Premiação total</span>
            <strong>{formatarDinheiro(valorPremiacao)}</strong>
          </div>

          <div>
            <span>Organização</span>
            <strong>{formatarDinheiro(valorOrganizacao)}</strong>
          </div>
        </div>

        <div className="premio-faixas">
          <div>
            <span>1º lugar</span>
            <strong>{formatarDinheiro(totalArrecadado * 0.55)}</strong>
            <small>55%</small>
          </div>

          <div>
            <span>2º lugar</span>
            <strong>{formatarDinheiro(totalArrecadado * 0.15)}</strong>
            <small>15%</small>
          </div>

          <div>
            <span>3º lugar</span>
            <strong>{formatarDinheiro(totalArrecadado * 0.11)}</strong>
            <small>11%</small>
          </div>

          <div>
            <span>4º lugar</span>
            <strong>{formatarDinheiro(totalArrecadado * 0.08)}</strong>
            <small>8%</small>
          </div>

          <div>
            <span>5º lugar</span>
            <strong>{formatarDinheiro(totalArrecadado * 0.06)}</strong>
            <small>6%</small>
          </div>
        </div>

        <div className="premio-tabela-wrap">
          <table>
            <thead>
              <tr>
                <th>Faixa</th>
                <th>Participante</th>
                <th>Pontos</th>
                <th>% dividido</th>
                <th>Valor previsto</th>
              </tr>
            </thead>

            <tbody>
              {premiados.map((item) => (
                <tr key={`${item.participante}-${item.posicaoInicial}`}>
                  <td>{posicaoPremiacaoTexto(item)}</td>
                  <td>{item.participante}</td>
                  <td>{item.pontos}</td>
                  <td>{item.percentualGrupo}%</td>
                  <td className="pontos">{formatarDinheiro(item.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="premio-observacao">
          Em caso de empate, o sistema soma os percentuais das posições
          envolvidas e divide igualmente entre os participantes empatados.
        </p>
      </div>
    </div>
  );
}
