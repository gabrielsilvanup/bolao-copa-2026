import { useEffect, useState } from "react";

import AdminClassifiedPanel from "./AdminClassifiedPanel";
import AdminDiagnosticsPanel from "./AdminDiagnosticsPanel";
import AdminExportPanel from "./AdminExportPanel";
import AdminFinalPositionsPanel from "./AdminFinalPositionsPanel";
import AdminGroupStandingsPanel from "./AdminGroupStandingsPanel";
import AdminImportPanel from "./AdminImportPanel";
import AdminResetPanel from "./AdminResetPanel";
import AdminResultsPanel from "./AdminResultsPanel";

const CODIGO_ADMIN = "alvarocopa";
const ADMIN_SESSION_KEY = "bolao-copa-2026-admin-liberado";

const ABAS_ADMIN = [
  { id: "placares", label: "Placares" },
  { id: "grupos", label: "Grupos" },
  { id: "classificados", label: "Classificados" },
  { id: "finais", label: "Posições finais" },
  { id: "backup", label: "Backup" },
  { id: "importar", label: "Importar" },
  { id: "zerar", label: "Zerar dados" },
  { id: "diagnostico", label: "Diagnóstico" },
];

export default function AdminArea({
  participantes,
  resultadosOficiais,
  onAtualizarResultados,
  onLimparResultadosSalvos,
}) {
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [liberado, setLiberado] = useState(false);
  const [abaAdmin, setAbaAdmin] = useState("placares");

  useEffect(() => {
    const sessaoLiberada = sessionStorage.getItem(ADMIN_SESSION_KEY);

    if (sessaoLiberada === "true") {
      setLiberado(true);
    }
  }, []);

  function entrar(event) {
    event.preventDefault();

    if (codigo.trim() === CODIGO_ADMIN) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      setLiberado(true);
      setErro("");
      setCodigo("");
      return;
    }

    setErro("Código incorreto.");
  }

  function sair() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setLiberado(false);
    setCodigo("");
    setErro("");
    setAbaAdmin("placares");
  }

  if (!liberado) {
    return (
      <section className="aba-conteudo">
        <div className="card admin-login">
          <div>
            <p className="tag">Área administrativa</p>
            <h2>Acesso restrito</h2>
            <p>
              Informe o código de acesso para cadastrar placares, calcular
              grupos, atualizar classificados, posições finais e backups.
            </p>
          </div>

          <form className="admin-login-form" onSubmit={entrar}>
            <label>Código de acesso</label>

            <input
              type="password"
              value={codigo}
              onChange={(event) => setCodigo(event.target.value)}
              placeholder="Digite o código"
              autoComplete="off"
            />

            {erro && <div className="admin-mensagem erro">{erro}</div>}

            <button type="submit" className="admin-primary">
              Entrar no Admin
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="aba-conteudo">
      <div className="card admin-shell">
        <div className="admin-shell-top">
          <div>
            <p className="tag">Área administrativa</p>
            <h2>Painel do bolão</h2>
            <p>
              Gerencie resultados, classificação dos grupos, classificados,
              posições finais, backups e diagnóstico do sistema.
            </p>
          </div>

          <button type="button" className="admin-sair" onClick={sair}>
            Sair do Admin
          </button>
        </div>

        <div className="admin-subtabs">
          {ABAS_ADMIN.map((aba) => (
            <button
              key={aba.id}
              type="button"
              className={
                abaAdmin === aba.id ? "admin-subtab ativa" : "admin-subtab"
              }
              onClick={() => setAbaAdmin(aba.id)}
            >
              {aba.label}
            </button>
          ))}
        </div>
      </div>

      {abaAdmin === "placares" && (
        <AdminResultsPanel
          participantes={participantes}
          resultadosOficiais={resultadosOficiais}
          onAtualizarResultados={onAtualizarResultados}
          onLimparResultadosSalvos={onLimparResultadosSalvos}
        />
      )}

      {abaAdmin === "grupos" && (
        <AdminGroupStandingsPanel
          participantes={participantes}
          resultadosOficiais={resultadosOficiais}
          onAtualizarResultados={onAtualizarResultados}
        />
      )}

      {abaAdmin === "classificados" && (
        <AdminClassifiedPanel
          participantes={participantes}
          resultadosOficiais={resultadosOficiais}
          onAtualizarResultados={onAtualizarResultados}
        />
      )}

      {abaAdmin === "finais" && (
        <AdminFinalPositionsPanel
          participantes={participantes}
          resultadosOficiais={resultadosOficiais}
          onAtualizarResultados={onAtualizarResultados}
        />
      )}

      {abaAdmin === "backup" && (
        <AdminExportPanel
          resultadosOficiais={resultadosOficiais}
          onLimparResultadosSalvos={onLimparResultadosSalvos}
        />
      )}

      {abaAdmin === "importar" && (
        <AdminImportPanel onAtualizarResultados={onAtualizarResultados} />
      )}

      {abaAdmin === "zerar" && (
        <AdminResetPanel
          resultadosOficiais={resultadosOficiais}
          onAtualizarResultados={onAtualizarResultados}
          onLimparResultadosSalvos={onLimparResultadosSalvos}
        />
      )}

      {abaAdmin === "diagnostico" && (
        <AdminDiagnosticsPanel
          participantes={participantes}
          resultadosOficiais={resultadosOficiais}
        />
      )}
    </section>
  );
}