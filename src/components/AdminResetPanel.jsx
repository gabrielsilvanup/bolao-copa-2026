import { useState } from "react";
import {
  criarFasesOficiaisPadrao,
  criarPosicoesFinaisPadrao,
  dataHojeISO,
  normalizarResultadosOficiais,
} from "../utils/officialResultsUtils";

function contarClassificados(fases) {
  return Object.values(fases || {}).reduce((total, lista) => {
    if (!Array.isArray(lista)) return total;
    return total + lista.length;
  }, 0);
}

function contarPosicoes(posicoes) {
  return Object.values(posicoes || {}).filter(Boolean).length;
}

export default function AdminResetPanel({
  resultadosOficiais,
  onAtualizarResultados,
  onLimparResultadosSalvos,
}) {
  const [mensagem, setMensagem] = useState(null);

  const totalJogos = resultadosOficiais?.jogos?.length ?? 0;

  const jogosEncerrados =
    resultadosOficiais?.jogos?.filter((jogo) => jogo.encerrado).length ?? 0;

  const totalClassificados = contarClassificados(
    resultadosOficiais?.fases_oficiais
  );

  const totalPosicoes = contarPosicoes(
    resultadosOficiais?.posicoes_finais_oficiais
  );

  function montarBase() {
    return normalizarResultadosOficiais(resultadosOficiais, {
      ultima_atualizacao: dataHojeISO(),
    });
  }

  function zerarPlacares() {
    const confirmar = window.confirm(
      "Deseja apagar todos os placares oficiais cadastrados?"
    );

    if (!confirmar) return;

    onAtualizarResultados({
      ...montarBase(),
      status: "EM_ANDAMENTO",
      ultima_atualizacao: dataHojeISO(),
      jogos: [],
    });

    setMensagem({
      tipo: "sucesso",
      texto: "Placares oficiais zerados.",
    });
  }

  function zerarFases() {
    const confirmar = window.confirm(
      "Deseja apagar todos os classificados por fase?"
    );

    if (!confirmar) return;

    onAtualizarResultados({
      ...montarBase(),
      ultima_atualizacao: dataHojeISO(),
      fases_oficiais: criarFasesOficiaisPadrao(),
    });

    setMensagem({
      tipo: "sucesso",
      texto: "Classificados por fase zerados.",
    });
  }

  function zerarPosicoes() {
    const confirmar = window.confirm(
      "Deseja apagar campeão, vice, terceiro e quarto oficiais?"
    );

    if (!confirmar) return;

    onAtualizarResultados({
      ...montarBase(),
      ultima_atualizacao: dataHojeISO(),
      posicoes_finais_oficiais: criarPosicoesFinaisPadrao(),
    });

    setMensagem({
      tipo: "sucesso",
      texto: "Posições finais zeradas.",
    });
  }

  function zerarTudo() {
    const confirmar = window.confirm(
      "Atenção: isso vai apagar placares, classificados e posições finais cadastrados no Admin. Deseja continuar?"
    );

    if (!confirmar) return;

    onAtualizarResultados(normalizarResultadosOficiais(resultadosOficiais, {
      status: "NAO_INICIADO",
      ultima_atualizacao: dataHojeISO(),
      jogos: [],
      fases_oficiais: criarFasesOficiaisPadrao(),
      posicoes_finais_oficiais: criarPosicoesFinaisPadrao(),
      chaveamento_oficial: {
        ...(resultadosOficiais?.chaveamento_oficial || {}),
        ultima_atualizacao: dataHojeISO(),
        dezesseis_avos: [],
        oitavas: [],
        quartas: [],
        semifinal: [],
        terceiro_lugar: [],
        final: [],
        terceiros_por_jogo: {},
      },
    }));

    setMensagem({
      tipo: "sucesso",
      texto: "Todos os dados administrativos foram zerados.",
    });
  }

  return (
    <div className="card admin-reset">
      <div className="tabela-topo">
        <div>
          <p className="tag">Administração</p>
          <h2>Zerar dados</h2>
        </div>

        <span>Limpeza controlada</span>
      </div>

      <div className="admin-reset-body">
        <div className="admin-reset-alerta">
          <strong>Use esta área para corrigir ou reiniciar dados cadastrados.</strong>
          <p>
            As ações abaixo alteram os resultados salvos no navegador. Antes de
            zerar tudo, é recomendável baixar um backup em JSON.
          </p>
        </div>

        <div className="admin-reset-grid">
          <div className="admin-reset-card">
            <span>Placares oficiais</span>
            <strong>{jogosEncerrados}</strong>
            <small>{totalJogos} jogo(s) cadastrados</small>
            <button type="button" onClick={zerarPlacares}>
              Zerar placares
            </button>
          </div>

          <div className="admin-reset-card">
            <span>Classificados</span>
            <strong>{totalClassificados}</strong>
            <small>Seleções cadastradas nas fases</small>
            <button type="button" onClick={zerarFases}>
              Zerar fases
            </button>
          </div>

          <div className="admin-reset-card">
            <span>Posições finais</span>
            <strong>{totalPosicoes}</strong>
            <small>De 4 posições possíveis</small>
            <button type="button" onClick={zerarPosicoes}>
              Zerar posições
            </button>
          </div>

          <div className="admin-reset-card perigo">
            <span>Zerar tudo</span>
            <strong>!</strong>
            <small>Apaga placares, fases e posições</small>
            <button type="button" onClick={zerarTudo}>
              Zerar tudo
            </button>
          </div>
        </div>

        {mensagem && (
          <div className={`admin-mensagem ${mensagem.tipo}`}>
            {mensagem.texto}
          </div>
        )}

        <div className="admin-reset-original">
          <div>
            <h3>Restaurar estado original do arquivo</h3>
            <p>
              Essa opção apaga o que está salvo no navegador e recarrega o site
              usando novamente o arquivo <strong>resultados-oficiais.json</strong>{" "}
              da pasta public/data.
            </p>
          </div>

          <button
            type="button"
            className="export-btn export-danger"
            onClick={onLimparResultadosSalvos}
          >
            <span>×</span>
            Limpar localStorage e recarregar
          </button>
        </div>
      </div>
    </div>
  );
}
