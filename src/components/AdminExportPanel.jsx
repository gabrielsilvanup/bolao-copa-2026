import { useState } from "react";

function dataHojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function gerarJson(resultadosOficiais) {
  return JSON.stringify(resultadosOficiais || {}, null, 2);
}

export default function AdminExportPanel({
  resultadosOficiais,
  onLimparResultadosSalvos,
}) {
  const [mensagem, setMensagem] = useState(null);

  const totalJogos = resultadosOficiais?.jogos?.length ?? 0;

  const jogosEncerrados =
    resultadosOficiais?.jogos?.filter((jogo) => jogo.encerrado).length ?? 0;

  const ultimaAtualizacao = resultadosOficiais?.ultima_atualizacao || "-";

  function baixarJson() {
    const conteudo = gerarJson(resultadosOficiais);
    const blob = new Blob([conteudo], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `resultados-oficiais-${dataHojeISO()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    setMensagem({
      tipo: "sucesso",
      texto: "Arquivo JSON exportado com sucesso.",
    });
  }

  async function copiarJson() {
    try {
      const conteudo = gerarJson(resultadosOficiais);

      await navigator.clipboard.writeText(conteudo);

      setMensagem({
        tipo: "sucesso",
        texto: "JSON copiado para a área de transferência.",
      });
    } catch {
      setMensagem({
        tipo: "erro",
        texto:
          "Não foi possível copiar automaticamente. Use o botão de baixar JSON.",
      });
    }
  }

  return (
    <div className="card admin-export">
      <div className="tabela-topo">
        <div>
          <p className="tag">Administração</p>
          <h2>Backup dos resultados</h2>
        </div>

        <span>Exportar / copiar JSON</span>
      </div>

      <div className="admin-export-body">
        <div className="admin-export-resumo">
          <div>
            <span>Status</span>
            <strong>{resultadosOficiais?.status || "-"}</strong>
          </div>

          <div>
            <span>Jogos cadastrados</span>
            <strong>{totalJogos}</strong>
          </div>

          <div>
            <span>Jogos encerrados</span>
            <strong>{jogosEncerrados}</strong>
          </div>

          <div>
            <span>Atualização</span>
            <strong>{ultimaAtualizacao}</strong>
          </div>
        </div>

        <div className="admin-export-box">
          <div>
            <h3>Salvar uma cópia do resultados-oficiais.json</h3>
            <p>
              Use este backup para guardar os placares, classificados, posições
              finais e demais resultados cadastrados no Admin.
            </p>
          </div>

          <div className="admin-export-actions">
            <button
              type="button"
              className="export-btn export-primary"
              onClick={baixarJson}
            >
              <span>⬇</span>
              Baixar JSON
            </button>

            <button
              type="button"
              className="export-btn export-secondary"
              onClick={copiarJson}
            >
              <span>⧉</span>
              Copiar JSON
            </button>

            <button
              type="button"
              className="export-btn export-danger"
              onClick={onLimparResultadosSalvos}
            >
              <span>×</span>
              Limpar salvos
            </button>
          </div>
        </div>

        {mensagem && (
          <div className={`admin-mensagem ${mensagem.tipo}`}>
            {mensagem.texto}
          </div>
        )}
      </div>
    </div>
  );
}