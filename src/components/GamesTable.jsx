import {
  formatarFase,
  placarTexto,
  temPenaltisValidos,
  vencedorTexto,
} from "../utils/gameUtils";

import {
  criarMapaCalendario,
  formatarAgendaJogo,
} from "../utils/calendarUtils";

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

function classeFase(fase) {
  return fase === "grupos" ? "grupos" : "mata";
}

export default function GamesTable({
  jogos,
  resultadosOficiais,
  calendarioOficial = [],
}) {
  const mapaResultados = criarMapaResultados(resultadosOficiais);
  const mapaCalendario = criarMapaCalendario(calendarioOficial);

  return (
    <div className="card tabela-card">
      <div className="tabela-topo">
        <div>
          <h2>Jogos</h2>
          <small>
            Grupos pontuam por resultado e placar; mata-mata pontua por avanço.
          </small>
        </div>

        <span>{jogos.length} jogos</span>
      </div>

      <div className="tabela-container">
        <table>
          <thead>
            <tr>
              <th>Jogo</th>
              <th>Agenda</th>
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
              const jogoCalendario = mapaCalendario[jogo.jogo];
              const pontuacao = calcularPontuacaoJogo(jogo, resultadoOficial);

              return (
                <tr
                  key={jogo.jogo}
                  className={`jogo-row ${classeFase(jogo.fase)} ${
                    pontuacao.status
                  }`}
                >
                  <td>{jogo.jogo}</td>
                  <td className="agenda-jogo">
                    <span>{formatarAgendaJogo(jogoCalendario)}</span>
                    <small>{jogoCalendario?.sede || "-"}</small>
                  </td>
                  <td>
                    <span className={`fase-pill ${classeFase(jogo.fase)}`}>
                      {formatarFase(jogo.fase)}
                    </span>
                  </td>
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
                  <td>
                    <span
                      className={`pontos-pill ${
                        pontuacao.pontos > 0 ? "positivo" : pontuacao.status
                      }`}
                    >
                      {pontosTexto(pontuacao)}
                    </span>
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
