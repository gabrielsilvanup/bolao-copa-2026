import { useEffect, useMemo, useState } from "react";
import TeamName from "./TeamName";
import { formatarSelecao } from "../utils/teamUtils";

const FASES_PADRAO = {
  dezesseis_avos: [],
  oitavas: [],
  quartas: [],
  semifinal: [],
  final: [],
};

const POSICOES_PADRAO = {
  campeao: null,
  vice: null,
  terceiro: null,
  quarto: null,
};

const POSICOES = [
  { id: "campeao", label: "Campeão", pontos: 60 },
  { id: "vice", label: "Vice", pontos: 50 },
  { id: "terceiro", label: "3º lugar", pontos: 40 },
  { id: "quarto", label: "4º lugar", pontos: 35 },
];

function dataHojeISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminFinalPositionsPanel({
  participantes,
  resultadosOficiais,
  onAtualizarResultados,
}) {
  const [posicoes, setPosicoes] = useState(POSICOES_PADRAO);
  const [mensagem, setMensagem] = useState(null);

  const selecoes = useMemo(() => {
    const jogos = participantes?.[0]?.jogos || [];
    const nomes = new Set();

    jogos.forEach((jogo) => {
      if (jogo.selecao_a) nomes.add(jogo.selecao_a);
      if (jogo.selecao_b) nomes.add(jogo.selecao_b);
    });

    return Array.from(nomes).sort((a, b) =>
      formatarSelecao(a).localeCompare(formatarSelecao(b))
    );
  }, [participantes]);

  useEffect(() => {
    setPosicoes({
      ...POSICOES_PADRAO,
      ...(resultadosOficiais?.posicoes_finais_oficiais || {}),
    });
  }, [resultadosOficiais]);

  function alterarPosicao(posicao, selecao) {
    setMensagem(null);

    setPosicoes((estadoAtual) => ({
      ...estadoAtual,
      [posicao]: selecao || null,
    }));
  }

  function validarDuplicidade() {
    const preenchidas = Object.values(posicoes).filter(Boolean);
    const unicas = new Set(preenchidas);

    return preenchidas.length === unicas.size;
  }

  function salvarPosicoes() {
    if (!validarDuplicidade()) {
      setMensagem({
        tipo: "erro",
        texto:
          "A mesma seleção não pode ocupar mais de uma posição final. Revise campeão, vice, terceiro e quarto.",
      });

      return;
    }

    const novosResultados = {
      status: resultadosOficiais?.status || "EM_ANDAMENTO",
      ultima_atualizacao: dataHojeISO(),
      jogos: resultadosOficiais?.jogos || [],
      fases_oficiais: {
        ...FASES_PADRAO,
        ...(resultadosOficiais?.fases_oficiais || {}),
      },
      posicoes_finais_oficiais: {
        ...POSICOES_PADRAO,
        ...posicoes,
      },
    };

    onAtualizarResultados(novosResultados);

    setMensagem({
      tipo: "sucesso",
      texto: "Posições finais salvas. O ranking foi recalculado.",
    });
  }

  function limparPosicoes() {
    const confirmar = window.confirm(
      "Deseja apagar campeão, vice, terceiro e quarto oficiais?"
    );

    if (!confirmar) return;

    const novasPosicoes = POSICOES_PADRAO;

    setPosicoes(novasPosicoes);

    const novosResultados = {
      status: resultadosOficiais?.status || "EM_ANDAMENTO",
      ultima_atualizacao: dataHojeISO(),
      jogos: resultadosOficiais?.jogos || [],
      fases_oficiais: {
        ...FASES_PADRAO,
        ...(resultadosOficiais?.fases_oficiais || {}),
      },
      posicoes_finais_oficiais: novasPosicoes,
    };

    onAtualizarResultados(novosResultados);

    setMensagem({
      tipo: "sucesso",
      texto: "Posições finais zeradas.",
    });
  }

  return (
    <div className="card admin-posicoes">
      <div className="tabela-topo">
        <div>
          <p className="tag">Administração</p>
          <h2>Posições finais oficiais</h2>
        </div>

        <span>Campeão, vice, 3º e 4º</span>
      </div>

      <div className="admin-posicoes-body">
        <div className="admin-posicoes-grid">
          {POSICOES.map((posicao) => (
            <div key={posicao.id} className="admin-posicao-card">
              <div className="admin-posicao-header">
                <div>
                  <span>{posicao.label}</span>
                  <strong>{posicao.pontos} pts</strong>
                </div>
              </div>

              <select
                value={posicoes[posicao.id] || ""}
                onChange={(event) =>
                  alterarPosicao(posicao.id, event.target.value)
                }
              >
                <option value="">Selecione...</option>

                {selecoes.map((selecao) => (
                  <option key={`${posicao.id}-${selecao}`} value={selecao}>
                    {formatarSelecao(selecao)}
                  </option>
                ))}
              </select>

              <div className="admin-posicao-preview">
                <TeamName selecao={posicoes[posicao.id]} />
              </div>
            </div>
          ))}
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
            onClick={salvarPosicoes}
          >
            Salvar posições finais
          </button>

          <button type="button" onClick={limparPosicoes}>
            Limpar posições
          </button>
        </div>
      </div>
    </div>
  );
}