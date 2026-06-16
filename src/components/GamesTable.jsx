import {
  formatarFase,
  placarTexto,
  temPenaltisValidos,
  vencedorTexto,
} from "../utils/gameUtils";

import {
  calcularPontuacaoJogo,
  criarMapaResultados,
} from "../utils/scoringUtils";

import TeamName from "./TeamName";

function pontosTexto(pontuacao) {
  if (pontuacao.status === "pendente") return "-";
  if (pontuacao.status === "nao_preenchido") return "-";
  if (pontuacao.status === "mata_mata_por_fase") return "Por fase";

  return pontuacao.pontos;
}

export default function GamesTable({ jogos, resultadosOficiais }) {
  const mapaResultados = criarMapaResultados(resultadosOficiais);

  return (
    <div className="card tabela-card">
      <div className="tabela-topo">
        <h2>Jogos</h2>
        <span>{jogos.length} jogos</span>
      </div>

      <div className="tabela-container">
        <table>
          <thead>
            <tr>
              <th>Jogo</th>
              <th>Fase</th>
              <th>Seleção A</th>
              <th>Placar</th>
              <th>Seleção B</th>
              <th>Vencedor previsto</th>
              <th>Pênaltis</th>
              <th>Pontos</th>
            </tr>
          </thead>

          <tbody>
            {jogos.map((jogo) => {
              const resultadoOficial = mapaResultados[jogo.jogo];
              const pontuacao = calcularPontuacaoJogo(jogo, resultadoOficial);

              return (
                <tr key={jogo.jogo}>
                  <td>{jogo.jogo}</td>
                  <td>{formatarFase(jogo.fase)}</td>
                  <td>
                    <TeamName selecao={jogo.selecao_a} />
                  </td>
                  <td className="placar">{placarTexto(jogo)}</td>
                  <td>
                    <TeamName selecao={jogo.selecao_b} />
                  </td>
                  <td>
                    <TeamName selecao={vencedorTexto(jogo)} />
                  </td>
                  <td>
                    {temPenaltisValidos(jogo)
                      ? `${jogo.penaltis_a} x ${jogo.penaltis_b}`
                      : "-"}
                  </td>
                  <td className={pontuacao.pontos > 0 ? "pontos" : ""}>
                    {pontosTexto(pontuacao)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}