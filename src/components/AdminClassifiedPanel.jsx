import { useEffect, useMemo, useState } from "react";
import { formatarFase } from "../utils/gameUtils";
import TeamName from "./TeamName";

const FASES = [
  { id: "dezesseis_avos", label: "16 avos", esperado: 32 },
  { id: "oitavas", label: "Oitavas", esperado: 16 },
  { id: "quartas", label: "Quartas", esperado: 8 },
  { id: "semifinal", label: "Semifinal", esperado: 4 },
  { id: "final", label: "Final", esperado: 2 },
];

const POSICOES_PADRAO = {
  campeao: null,
  vice: null,
  terceiro: null,
  quarto: null,
};

function criarFasesVazias() {
  return {
    dezesseis_avos: [],
    oitavas: [],
    quartas: [],
    semifinal: [],
    final: [],
  };
}

function dataHojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function getFaseInfo(faseId) {
  return FASES.find((fase) => fase.id === faseId);
}

export default function AdminClassifiedPanel({
  participantes,
  resultadosOficiais,
  onAtualizarResultados,
}) {
  const [faseAtual, setFaseAtual] = useState("dezesseis_avos");
  const [selecoesPorFase, setSelecoesPorFase] = useState(criarFasesVazias());
  const [mensagem, setMensagem] = useState(null);

  const selecoes = useMemo(() => {
    const jogos = participantes?.[0]?.jogos || [];
    const nomes = new Set();

    jogos.forEach((jogo) => {
      if (jogo.selecao_a) nomes.add(jogo.selecao_a);
      if (jogo.selecao_b) nomes.add(jogo.selecao_b);
    });

    return Array.from(nomes).sort((a, b) => a.localeCompare(b));
  }, [participantes]);

  useEffect(() => {
    setSelecoesPorFase({
      ...criarFasesVazias(),
      ...(resultadosOficiais?.fases_oficiais || {}),
    });
  }, [resultadosOficiais]);

  const faseInfo = getFaseInfo(faseAtual);
  const selecionadas = selecoesPorFase[faseAtual] || [];
  const quantidadeEsperada = faseInfo?.esperado || 0;
  const quantidadeCorreta = selecionadas.length === quantidadeEsperada;
  const temExcesso = selecionadas.length > quantidadeEsperada;

  function salvarEstadoFases(novasFases, textoSucesso) {
    const novosResultados = {
      status: resultadosOficiais?.status || "EM_ANDAMENTO",
      ultima_atualizacao: dataHojeISO(),
      jogos: resultadosOficiais?.jogos || [],
      fases_oficiais: {
        ...criarFasesVazias(),
        ...novasFases,
      },
      posicoes_finais_oficiais:
        resultadosOficiais?.posicoes_finais_oficiais || POSICOES_PADRAO,
    };

    onAtualizarResultados(novosResultados);

    setMensagem({
      tipo: "sucesso",
      texto: textoSucesso,
    });
  }

  function alternarSelecao(selecao) {
    setSelecoesPorFase((estadoAtual) => {
      const faseSelecionadaInfo = getFaseInfo(faseAtual);
      const limite = faseSelecionadaInfo?.esperado || 0;
      const listaAtual = estadoAtual[faseAtual] || [];
      const jaSelecionada = listaAtual.includes(selecao);

      setMensagem(null);

      if (jaSelecionada) {
        return {
          ...estadoAtual,
          [faseAtual]: listaAtual.filter((item) => item !== selecao),
        };
      }

      if (listaAtual.length >= limite) {
        setMensagem({
          tipo: "erro",
          texto: `${faseSelecionadaInfo.label} já atingiu o limite de ${limite} seleções.`,
        });

        return estadoAtual;
      }

      return {
        ...estadoAtual,
        [faseAtual]: [...listaAtual, selecao].sort((a, b) =>
          a.localeCompare(b)
        ),
      };
    });
  }

  function salvarClassificados() {
    if (selecionadas.length !== quantidadeEsperada) {
      setMensagem({
        tipo: "erro",
        texto: `${faseInfo.label} precisa ter exatamente ${quantidadeEsperada} seleções. Atualmente há ${selecionadas.length}.`,
      });

      return;
    }

    salvarEstadoFases(
      selecoesPorFase,
      `Classificados de ${formatarFase(faseAtual)} salvos. O ranking foi recalculado.`
    );
  }

  function limparFase() {
    const confirmar = window.confirm(
      `Deseja zerar os classificados de ${faseInfo.label}?`
    );

    if (!confirmar) return;

    const novasFases = {
      ...selecoesPorFase,
      [faseAtual]: [],
    };

    setSelecoesPorFase(novasFases);

    salvarEstadoFases(
      novasFases,
      `Classificados de ${faseInfo.label} foram zerados.`
    );
  }

  function limparTodasFases() {
    const confirmar = window.confirm(
      "Deseja zerar os classificados de todas as fases?"
    );

    if (!confirmar) return;

    const novasFases = criarFasesVazias();

    setSelecoesPorFase(novasFases);

    salvarEstadoFases(novasFases, "Todos os classificados foram zerados.");
  }

  return (
    <div className="card admin-classificados">
      <div className="tabela-topo">
        <div>
          <p className="tag">Administração</p>
          <h2>Classificados por fase</h2>
        </div>

        <span>
          {selecionadas.length} de {quantidadeEsperada}
        </span>
      </div>

      <div className="admin-classificados-body">
        <div className="admin-fases-tabs">
          {FASES.map((fase) => {
            const quantidade = selecoesPorFase[fase.id]?.length || 0;
            const correta = quantidade === fase.esperado;
            const excesso = quantidade > fase.esperado;

            return (
              <button
                key={fase.id}
                type="button"
                className={
                  faseAtual === fase.id
                    ? "admin-fase-tab ativa"
                    : excesso
                    ? "admin-fase-tab excesso"
                    : "admin-fase-tab"
                }
                onClick={() => {
                  setFaseAtual(fase.id);
                  setMensagem(null);
                }}
              >
                <span>{fase.label}</span>
                <strong title={`${quantidade} de ${fase.esperado}`}>
                  {correta ? "✓" : quantidade}
                </strong>
              </button>
            );
          })}
        </div>

        <div className="admin-classificados-info">
          <div>
            <h3>{faseInfo?.label}</h3>
            <p>
              Marque exatamente {quantidadeEsperada} seleções para salvar a fase.
              Para apagar uma fase já salva, use “Zerar esta fase”.
            </p>
          </div>

          <div
            className={
              quantidadeCorreta
                ? "admin-classificados-contador correto"
                : temExcesso
                ? "admin-classificados-contador excesso"
                : "admin-classificados-contador"
            }
          >
            <strong>{selecionadas.length}</strong>
            <span>de {quantidadeEsperada}</span>
          </div>
        </div>

        {temExcesso && (
          <div className="admin-mensagem erro">
            Esta fase tem seleções acima do limite. Desmarque seleções ou zere a
            fase.
          </div>
        )}

        <div className="admin-selecoes-grid">
          {selecoes.map((selecao) => {
            const marcada = selecionadas.includes(selecao);
            const bloqueada =
              !marcada && selecionadas.length >= quantidadeEsperada;

            return (
              <button
                key={selecao}
                type="button"
                disabled={bloqueada}
                className={
                  marcada
                    ? "admin-selecao-chip marcada"
                    : bloqueada
                    ? "admin-selecao-chip bloqueada"
                    : "admin-selecao-chip"
                }
                onClick={() => alternarSelecao(selecao)}
              >
                <span className="admin-check-bolinha">
                  {marcada ? "✓" : ""}
                </span>

                <TeamName selecao={selecao} />
              </button>
            );
          })}
        </div>

        {mensagem && (
          <div className={`admin-mensagem ${mensagem.tipo}`}>
            {mensagem.texto}
          </div>
        )}

        <div className="admin-actions">
          <button
            type="button"
            className="admin-primary"
            onClick={salvarClassificados}
            disabled={!quantidadeCorreta}
          >
            Salvar classificados
          </button>

          <button type="button" onClick={limparFase}>
            Zerar esta fase
          </button>

          <button
            type="button"
            className="admin-danger"
            onClick={limparTodasFases}
          >
            Zerar todas as fases
          </button>
        </div>
      </div>
    </div>
  );
}