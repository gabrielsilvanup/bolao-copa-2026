import { useState } from "react";
import { normalizarResultadosOficiais } from "../utils/officialResultsUtils";
import {
  formatarResumoValidacaoResultados,
  normalizarFormatoResultadosOficiais,
  validarResultadosOficiais,
} from "../utils/officialResultsValidation";

export default function AdminImportPanel({
  resultadosOficiais,
  onAtualizarResultados,
}) {
  const [arquivoNome, setArquivoNome] = useState("");
  const [dadosImportados, setDadosImportados] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  function selecionarArquivo(event) {
    const arquivo = event.target.files?.[0];

    setMensagem(null);
    setDadosImportados(null);
    setArquivoNome("");

    if (!arquivo) return;

    setArquivoNome(arquivo.name);

    const leitor = new FileReader();

    leitor.onload = () => {
      try {
        const dados = JSON.parse(leitor.result);
        const validacao = validarResultadosOficiais(dados);

        if (!validacao.valido) {
          setMensagem({
            tipo: "erro",
            texto: `Arquivo rejeitado: ${formatarResumoValidacaoResultados(
              validacao
            )}`,
          });

          return;
        }

        const dadosPreparados = normalizarFormatoResultadosOficiais(dados);
        const normalizado = normalizarResultadosOficiais(
          resultadosOficiais,
          dadosPreparados
        );

        setDadosImportados(normalizado);

        setMensagem({
          tipo: "sucesso",
          texto:
            validacao.avisos.length > 0
              ? `Arquivo lido com ${validacao.avisos.length} aviso(s). ${formatarResumoValidacaoResultados(
                  validacao
                )}`
              : "Arquivo lido com sucesso. Confira o resumo e clique em importar.",
        });
      } catch {
        setMensagem({
          tipo: "erro",
          texto:
            "Não foi possível ler o JSON. Verifique se o arquivo está correto.",
        });
      }
    };

    leitor.readAsText(arquivo);
  }

  function importarResultados() {
    if (!dadosImportados) {
      setMensagem({
        tipo: "erro",
        texto: "Selecione um arquivo válido antes de importar.",
      });

      return;
    }

    const confirmar = window.confirm(
      "Importar este arquivo vai substituir os resultados salvos atualmente no navegador. Deseja continuar?"
    );

    if (!confirmar) return;

    onAtualizarResultados(dadosImportados);

    setMensagem({
      tipo: "sucesso",
      texto: "Resultados importados com sucesso. O ranking foi recalculado.",
    });
  }

  const totalJogos = dadosImportados?.jogos?.length ?? 0;

  const jogosEncerrados =
    dadosImportados?.jogos?.filter((jogo) => jogo.encerrado).length ?? 0;

  return (
    <div className="card admin-import">
      <div className="tabela-topo">
        <div>
          <p className="tag">Administração</p>
          <h2>Importar resultados</h2>
        </div>

        <span>Backup / restauração</span>
      </div>

      <div className="admin-import-body">
        <div className="admin-import-box">
          <div>
            <h3>Importar resultados-oficiais.json</h3>
            <p>
              Use esta opção para restaurar um arquivo exportado anteriormente
              pelo próprio site.
            </p>
          </div>

          <label className="admin-file-label">
            Selecionar arquivo JSON
            <input type="file" accept=".json" onChange={selecionarArquivo} />
          </label>
        </div>

        {arquivoNome && (
          <div className="admin-import-resumo">
            <div>
              <span>Arquivo</span>
              <strong>{arquivoNome}</strong>
            </div>

            <div>
              <span>Jogos cadastrados</span>
              <strong>{totalJogos}</strong>
            </div>

            <div>
              <span>Jogos encerrados</span>
              <strong>{jogosEncerrados}</strong>
            </div>
          </div>
        )}

        {mensagem && (
          <div className={`admin-mensagem ${mensagem.tipo}`}>
            {mensagem.texto}
          </div>
        )}

        <div className="admin-actions">
          <button
            type="button"
            className="admin-primary"
            onClick={importarResultados}
            disabled={!dadosImportados}
          >
            Importar resultados
          </button>
        </div>
      </div>
    </div>
  );
}
