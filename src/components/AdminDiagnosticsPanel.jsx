import { calcularRanking } from "../utils/scoringUtils";
import {
  calcularTotalArrecadado,
  calcularValorOrganizacao,
  calcularValorPremiacao,
  formatarDinheiro,
} from "../utils/prizeUtils";
import { validarResultadosOficiais } from "../utils/officialResultsValidation";

const TOTAL_PARTICIPANTES_ESPERADO = 37;
const TOTAL_JOGOS_POR_PARTICIPANTE = 104;

const FASES_ESPERADAS = [
  { id: "dezesseis_avos", label: "16 avos", esperado: 32 },
  { id: "oitavas", label: "Oitavas", esperado: 16 },
  { id: "quartas", label: "Quartas", esperado: 8 },
  { id: "semifinal", label: "Semifinal", esperado: 4 },
  { id: "final", label: "Final", esperado: 2 },
];

const POSICOES = [
  { id: "campeao", label: "Campeão" },
  { id: "vice", label: "Vice" },
  { id: "terceiro", label: "3º lugar" },
  { id: "quarto", label: "4º lugar" },
];

function criarItem(tipo, titulo, detalhe) {
  return { tipo, titulo, detalhe };
}

function validarParticipantes(participantes) {
  const itens = [];

  if (participantes.length === TOTAL_PARTICIPANTES_ESPERADO) {
    itens.push(
      criarItem(
        "ok",
        "Quantidade de participantes",
        `${participantes.length} participantes cadastrados.`
      )
    );
  } else {
    itens.push(
      criarItem(
        "erro",
        "Quantidade de participantes",
        `Esperado: ${TOTAL_PARTICIPANTES_ESPERADO}. Atual: ${participantes.length}.`
      )
    );
  }

  const nomes = participantes.map((item) => item.participante);
  const nomesDuplicados = nomes.filter(
    (nome, index) => nomes.indexOf(nome) !== index
  );

  if (nomesDuplicados.length === 0) {
    itens.push(criarItem("ok", "Participantes duplicados", "Nenhum nome duplicado."));
  } else {
    itens.push(
      criarItem(
        "erro",
        "Participantes duplicados",
        `Duplicados: ${Array.from(new Set(nomesDuplicados)).join(", ")}.`
      )
    );
  }

  const participantesComProblema = participantes.filter(
    (item) => item.jogos?.length !== TOTAL_JOGOS_POR_PARTICIPANTE
  );

  if (participantesComProblema.length === 0) {
    itens.push(
      criarItem(
        "ok",
        "Jogos por participante",
        `Todos possuem ${TOTAL_JOGOS_POR_PARTICIPANTE} jogos.`
      )
    );
  } else {
    itens.push(
      criarItem(
        "erro",
        "Jogos por participante",
        `${participantesComProblema.length} participante(s) com quantidade incorreta.`
      )
    );
  }

  return itens;
}

function validarResultados(resultadosOficiais) {
  const itens = [];
  const validacao = validarResultadosOficiais(resultadosOficiais);

  if (validacao.erros.length === 0) {
    itens.push(
      criarItem(
        "ok",
        "Integridade dos resultados oficiais",
        "Nenhum erro estrutural encontrado."
      )
    );
  } else {
    validacao.erros.slice(0, 8).forEach((erro) => {
      itens.push(
        criarItem(
          "erro",
          "Resultados oficiais",
          `${erro.caminho}: ${erro.mensagem}`
        )
      );
    });

    if (validacao.erros.length > 8) {
      itens.push(
        criarItem(
          "erro",
          "Resultados oficiais",
          `Mais ${validacao.erros.length - 8} erro(s) nao exibidos.`
        )
      );
    }
  }

  validacao.avisos.slice(0, 8).forEach((aviso) => {
    itens.push(
      criarItem(
        "alerta",
        "Resultados oficiais",
        `${aviso.caminho}: ${aviso.mensagem}`
      )
    );
  });

  if (validacao.avisos.length > 8) {
    itens.push(
      criarItem(
        "alerta",
        "Resultados oficiais",
        `Mais ${validacao.avisos.length - 8} aviso(s) nao exibidos.`
      )
    );
  }

  return itens;
}

function validarFases(resultadosOficiais) {
  const itens = [];
  const fases = resultadosOficiais?.fases_oficiais || {};

  FASES_ESPERADAS.forEach((fase) => {
    const quantidade = fases[fase.id]?.length || 0;

    if (quantidade === 0) {
      itens.push(
        criarItem(
          "info",
          fase.label,
          `Nenhuma seleção cadastrada ainda. Esperado quando preenchido: ${fase.esperado}.`
        )
      );
      return;
    }

    if (quantidade === fase.esperado) {
      itens.push(
        criarItem(
          "ok",
          fase.label,
          `${quantidade} de ${fase.esperado} seleções cadastradas.`
        )
      );
      return;
    }

    itens.push(
      criarItem(
        "erro",
        fase.label,
        `Quantidade incorreta: ${quantidade} de ${fase.esperado}.`
      )
    );
  });

  return itens;
}

function validarPosicoesFinais(resultadosOficiais) {
  const itens = [];
  const posicoes = resultadosOficiais?.posicoes_finais_oficiais || {};

  const preenchidas = POSICOES.map((posicao) => posicoes[posicao.id]).filter(Boolean);

  if (preenchidas.length === 0) {
    itens.push(
      criarItem(
        "info",
        "Posições finais",
        "Nenhuma posição final oficial cadastrada ainda."
      )
    );
    return itens;
  }

  const unicas = new Set(preenchidas);

  if (preenchidas.length !== unicas.size) {
    itens.push(
      criarItem(
        "erro",
        "Posições finais",
        "Há seleção repetida entre campeão, vice, terceiro e quarto."
      )
    );
    return itens;
  }

  if (preenchidas.length === 4) {
    itens.push(
      criarItem(
        "ok",
        "Posições finais",
        "Campeão, vice, terceiro e quarto cadastrados sem duplicidade."
      )
    );
    return itens;
  }

  itens.push(
    criarItem(
      "alerta",
      "Posições finais",
      `${preenchidas.length} de 4 posições preenchidas.`
    )
  );

  return itens;
}

function DiagnosticoItem({ item }) {
  return (
    <div className={`diagnostico-item ${item.tipo}`}>
      <div>
        <strong>{item.titulo}</strong>
        <p>{item.detalhe}</p>
      </div>

      <span>
        {item.tipo === "ok"
          ? "✓"
          : item.tipo === "erro"
          ? "!"
          : item.tipo === "alerta"
          ? "?"
          : "i"}
      </span>
    </div>
  );
}

export default function AdminDiagnosticsPanel({
  participantes,
  resultadosOficiais,
}) {
  const ranking = calcularRanking(participantes, resultadosOficiais);

  const totalArrecadado = calcularTotalArrecadado(participantes.length);
  const valorPremiacao = calcularValorPremiacao(totalArrecadado);
  const valorOrganizacao = calcularValorOrganizacao(totalArrecadado);

  const itens = [
    ...validarParticipantes(participantes),
    ...validarResultados(resultadosOficiais),
    ...validarFases(resultadosOficiais),
    ...validarPosicoesFinais(resultadosOficiais),
  ];

  const erros = itens.filter((item) => item.tipo === "erro").length;
  const alertas = itens.filter((item) => item.tipo === "alerta").length;

  return (
    <div className="card diagnostico-card">
      <div className="tabela-topo">
        <div>
          <p className="tag">Administração</p>
          <h2>Diagnóstico do sistema</h2>
        </div>

        <span>
          {erros === 0 ? "Sem erros críticos" : `${erros} erro(s)`}
        </span>
      </div>

      <div className="diagnostico-body">
        <div className="diagnostico-resumo">
          <div>
            <span>Líder atual</span>
            <strong>{ranking[0]?.participante || "-"}</strong>
          </div>

          <div>
            <span>Pontuação líder</span>
            <strong>{ranking[0]?.resumo.total ?? 0}</strong>
          </div>

          <div>
            <span>Total arrecadado</span>
            <strong>{formatarDinheiro(totalArrecadado)}</strong>
          </div>

          <div>
            <span>Premiação</span>
            <strong>{formatarDinheiro(valorPremiacao)}</strong>
          </div>

          <div>
            <span>Organização</span>
            <strong>{formatarDinheiro(valorOrganizacao)}</strong>
          </div>

          <div>
            <span>Alertas</span>
            <strong>{alertas}</strong>
          </div>
        </div>

        <div className="diagnostico-lista">
          {itens.map((item, index) => (
            <DiagnosticoItem key={`${item.titulo}-${index}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
